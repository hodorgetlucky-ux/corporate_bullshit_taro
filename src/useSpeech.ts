import { useCallback, useEffect, useRef, useState } from 'react'

// Минимальные типы для Web Speech API (его нет в стандартных TS-либах).
interface SpeechRecognitionAlternative {
  transcript: string
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}
interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type SpeechErrorKind = 'denied' | 'other' | null

export interface UseSpeech {
  supported: boolean
  listening: boolean
  error: SpeechErrorKind
  /** Запускает распознавание; распознанный текст приходит в onText как дельта. */
  start: (lang: string) => void
  stop: () => void
}

export function useSpeech(onText: (chunk: string) => void): UseSpeech {
  const [supported] = useState(() => getCtor() !== null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<SpeechErrorKind>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  const stop = useCallback(() => {
    recRef.current?.stop()
  }, [])

  const start = useCallback((lang: string) => {
    const Ctor = getCtor()
    if (!Ctor) return
    // Останавливаем предыдущую сессию, если была.
    recRef.current?.abort()

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = false

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) {
          const chunk = res[0].transcript.trim()
          if (chunk) onTextRef.current(chunk)
        }
      }
    }
    rec.onerror = (e) => {
      setError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : 'other')
      setListening(false)
    }
    rec.onend = () => setListening(false)

    recRef.current = rec
    setError(null)
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('other')
      setListening(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      recRef.current?.abort()
    }
  }, [])

  return { supported, listening, error, start, stop }
}
