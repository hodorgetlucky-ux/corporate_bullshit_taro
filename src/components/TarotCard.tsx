import { useEffect, useState } from 'react'
import type { DrawnCard } from '../deck'
import type { Lang } from '../i18n'
import styles from './TarotCard.module.css'

interface Props {
  card: DrawnCard
  position: string
  reversedLabel: string
  lang: Lang
  index: number
}

// Декоративная рамка + россыпь звёзд на лицевой стороне.
function FrontArt() {
  return (
    <svg className={styles.art} viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <path id="spkF" d="M0,-3 L0.8,-0.8 L3,0 L0.8,0.8 L0,3 L-0.8,0.8 L-3,0 L-0.8,-0.8 Z" />
      </defs>
      <rect x="5" y="5" width="90" height="150" rx="9" fill="none" stroke="#E8B45A" strokeWidth="1.3" opacity="0.85" />
      <rect x="8.5" y="8.5" width="83" height="143" rx="7" fill="none" stroke="#E8B45A" strokeWidth="0.6" opacity="0.45" />
      {/* уголки */}
      <use href="#spkF" transform="translate(14 14) scale(1.1)" fill="#F3E3BF" />
      <use href="#spkF" transform="translate(86 14) scale(1.1)" fill="#F3E3BF" />
      <use href="#spkF" transform="translate(14 146) scale(1.1)" fill="#F3E3BF" />
      <use href="#spkF" transform="translate(86 146) scale(1.1)" fill="#F3E3BF" />
      {/* верхняя россыпь */}
      <use href="#spkF" transform="translate(50 16) scale(1.4)" fill="#E8A04A" />
      <use href="#spkF" transform="translate(30 23) scale(0.9)" fill="#F3E3BF" />
      <use href="#spkF" transform="translate(70 25) scale(1.0)" fill="#7D7ED6" />
      <use href="#spkF" transform="translate(20 40) scale(0.8)" fill="#F3E3BF" />
      <use href="#spkF" transform="translate(82 42) scale(0.9)" fill="#E8A04A" />
      {/* бока */}
      <use href="#spkF" transform="translate(13 78) scale(0.9)" fill="#7D7ED6" />
      <use href="#spkF" transform="translate(88 82) scale(1.0)" fill="#F3E3BF" />
      {/* низ */}
      <use href="#spkF" transform="translate(28 140) scale(1.0)" fill="#E8A04A" />
      <use href="#spkF" transform="translate(72 138) scale(0.9)" fill="#7D7ED6" />
      <use href="#spkF" transform="translate(50 150) scale(1.2)" fill="#F3E3BF" />
      {/* точки */}
      <g fill="#F3E3BF" opacity="0.7">
        <circle cx="40" cy="30" r="0.8" />
        <circle cx="60" cy="34" r="0.8" />
        <circle cx="24" cy="60" r="0.8" />
        <circle cx="80" cy="63" r="0.8" />
        <circle cx="36" cy="148" r="0.8" />
        <circle cx="64" cy="150" r="0.8" />
      </g>
    </svg>
  )
}

// Узор рубашки карты.
function BackArt() {
  return (
    <svg className={styles.art} viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <path id="spkB" d="M0,-3 L0.8,-0.8 L3,0 L0.8,0.8 L0,3 L-0.8,0.8 L-3,0 L-0.8,-0.8 Z" />
      </defs>
      <rect x="5" y="5" width="90" height="150" rx="9" fill="none" stroke="#E8B45A" strokeWidth="1.3" opacity="0.8" />
      <rect x="8.5" y="8.5" width="83" height="143" rx="7" fill="none" stroke="#E8B45A" strokeWidth="0.6" opacity="0.4" />
      <circle cx="50" cy="80" r="23" fill="none" stroke="#E8B45A" strokeWidth="0.7" strokeDasharray="1.5 3" opacity="0.6" />
      <use href="#spkB" transform="translate(50 80) scale(6.5)" fill="#E8B45A" opacity="0.9" />
      <use href="#spkB" transform="translate(50 80) scale(3)" fill="#F3E3BF" />
      <use href="#spkB" transform="translate(50 36) scale(1.2)" fill="#F3E3BF" />
      <use href="#spkB" transform="translate(50 124) scale(1.2)" fill="#F3E3BF" />
      <use href="#spkB" transform="translate(22 22) scale(0.9)" fill="#E8A04A" />
      <use href="#spkB" transform="translate(78 22) scale(0.9)" fill="#E8A04A" />
      <use href="#spkB" transform="translate(22 138) scale(0.9)" fill="#7D7ED6" />
      <use href="#spkB" transform="translate(78 138) scale(0.9)" fill="#7D7ED6" />
    </svg>
  )
}

export function TarotCard({ card, position, reversedLabel, lang, index }: Props) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setRevealed(false)
    const t = setTimeout(() => setRevealed(true), 250 + index * 450)
    return () => clearTimeout(t)
  }, [card, index])

  const name = lang === 'ru' ? card.def.ru : card.def.en

  return (
    <figure className={styles.slot}>
      <div className={styles.position}>{position}</div>
      <div className={`${styles.card} ${revealed ? styles.revealed : ''}`}>
        <div className={styles.back}>
          <BackArt />
        </div>
        <div
          className={styles.front}
          style={{
            // @ts-expect-error CSS custom property
            '--hue': card.def.hue,
          }}
        >
          <FrontArt />
          <div className={styles.center}>
            <div className={styles.medallion}>
              <span className={`${styles.symbol} ${card.reversed ? styles.reversedSymbol : ''}`}>
                {card.def.symbol}
              </span>
            </div>
            <span className={styles.name}>{name}</span>
            {card.reversed && <span className={styles.reversedTag}>↻ {reversedLabel}</span>}
          </div>
        </div>
      </div>
    </figure>
  )
}
