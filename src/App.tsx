import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './App.module.css'
import { STRINGS, type Lang } from './i18n'
import { drawThree, type DrawnCard } from './deck'
import { TarotCard } from './components/TarotCard'
import { useSpeech } from './useSpeech'

interface Reading {
  intro: string
  cards: [string, string, string]
  summary: string
  support: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

function detectLang(): Lang {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('ct_lang') : null
  if (saved === 'ru' || saved === 'en') return saved
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')) return 'ru'
  return 'en'
}

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang)
  const [situation, setSituation] = useState('')
  const [cards, setCards] = useState<DrawnCard[] | null>(null)
  const [reading, setReading] = useState<Reading | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const resultRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const t = STRINGS[lang]

  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    document.title = `${t.title} · ${lang === 'ru' ? 'Corporate Tarot' : 'Корпоративное Таро'}`
  }, [lang, t])

  useEffect(() => {
    localStorage.setItem('ct_lang', lang)
  }, [lang])

  const appendVoice = useCallback((chunk: string) => {
    setSituation((prev) => (prev ? `${prev} ${chunk}` : chunk))
  }, [])

  const speech = useSpeech(appendVoice)

  const micHint = useMemo(() => {
    if (!speech.supported) return t.micUnsupported
    if (speech.error === 'denied') return t.micDenied
    return ''
  }, [speech.supported, speech.error, t])

  const toggleMic = () => {
    if (speech.listening) speech.stop()
    else speech.start(t.speechLang)
  }

  const doReading = async () => {
    const text = situation.trim()
    if (text.length < 5) {
      setStatus('error')
      setErrorMsg(t.errorShort)
      return
    }
    if (speech.listening) speech.stop()

    const drawn = drawThree()
    setCards(drawn)
    setReading(null)
    setStatus('loading')
    setErrorMsg('')

    // Прокрутим к раскладу, чтобы видно было, как карты переворачиваются.
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: text,
          lang,
          cards: drawn.map((c, i) => ({
            name: lang === 'ru' ? c.def.ru : c.def.en,
            reversed: c.reversed,
            position: t.positions[i],
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data?.error === 'too_short' ? t.errorShort : t.errorGeneric)
        setStatus('error')
        return
      }

      const data = (await res.json()) as Reading
      setReading(data)
      setStatus('done')
    } catch {
      setErrorMsg(t.errorGeneric)
      setStatus('error')
    }
  }

  const resetAll = () => {
    if (speech.listening) speech.stop()
    setSituation('')
    setCards(null)
    setReading(null)
    setErrorMsg('')
    setStatus('idle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const loading = status === 'loading'

  return (
    <div className={styles.shell}>
      <div className={styles.stars} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>🔮</span>
          <div>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.tagline}>{t.tagline}</p>
          </div>
        </div>
        <button
          type="button"
          className={styles.langBtn}
          onClick={() => setLang((l) => (l === 'ru' ? 'en' : 'ru'))}
          aria-label="Switch language"
        >
          {t.langSwitch}
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.panel}>
          <label className={styles.label} htmlFor="situation">
            {t.inputLabel}
          </label>
          <div className={styles.inputWrap}>
            <textarea
              id="situation"
              ref={textareaRef}
              className={styles.textarea}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={t.placeholder}
              rows={5}
              maxLength={2000}
            />
            {speech.supported && (
              <button
                type="button"
                className={`${styles.micBtn} ${speech.listening ? styles.micActive : ''}`}
                onClick={toggleMic}
                title={speech.listening ? t.micStop : t.micStart}
                aria-pressed={speech.listening}
              >
                {speech.listening ? '⏹' : '🎙'}
                <span className={styles.micLabel}>
                  {speech.listening ? t.listening : t.micStart}
                </span>
              </button>
            )}
          </div>
          {micHint && <p className={styles.hint}>{micHint}</p>}

          <button
            type="button"
            className={styles.drawBtn}
            onClick={doReading}
            disabled={loading}
          >
            {loading ? t.drawing : `🔮 ${t.draw}`}
          </button>
        </section>

        <div ref={resultRef} className={styles.resultAnchor} />

        {cards && (
          <section className={styles.cards} aria-label="cards">
            {cards.map((c, i) => (
              <TarotCard
                key={`${c.def.id}-${i}`}
                card={c}
                index={i}
                lang={lang}
                position={t.positions[i]}
                reversedLabel={t.reversed}
              />
            ))}
          </section>
        )}

        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            <span>{t.drawing}</span>
          </div>
        )}

        {status === 'error' && <p className={styles.error}>{errorMsg}</p>}

        {status === 'done' && reading && (
          <section className={styles.reading}>
            <p className={styles.intro}>{reading.intro}</p>

            <div className={styles.cardReadings}>
              {reading.cards.map((text, i) => (
                <div key={i} className={styles.cardReading}>
                  <span className={styles.cardReadingHead}>
                    {t.positions[i]}
                    {cards && (
                      <span className={styles.cardReadingName}>
                        {' · '}
                        {lang === 'ru' ? cards[i].def.ru : cards[i].def.en}
                        {cards[i].reversed ? ` (${t.reversed})` : ''}
                      </span>
                    )}
                  </span>
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>{t.resultSummary}</h3>
              <p>{reading.summary}</p>
            </div>

            <div className={`${styles.block} ${styles.supportBlock}`}>
              <h3 className={styles.blockTitle}>💛 {t.resultSupport}</h3>
              <p>{reading.support}</p>
            </div>

            <button type="button" className={styles.resetBtn} onClick={resetAll}>
              ↺ {t.again}
            </button>
          </section>
        )}

        {status === 'idle' && !cards && <p className={styles.emptyHint}>{t.emptyHint}</p>}
      </main>

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>⚠️ {t.disclaimer}</p>
      </footer>
    </div>
  )
}
