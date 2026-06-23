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
          <span className={styles.backGlyph}>✦</span>
        </div>
        <div
          className={styles.front}
          style={{
            // @ts-expect-error CSS custom property
            '--hue': card.def.hue,
          }}
        >
          <span className={`${styles.symbol} ${card.reversed ? styles.reversedSymbol : ''}`}>
            {card.def.symbol}
          </span>
          <span className={styles.name}>{name}</span>
          {card.reversed && <span className={styles.reversedTag}>↻ {reversedLabel}</span>}
        </div>
      </div>
    </figure>
  )
}
