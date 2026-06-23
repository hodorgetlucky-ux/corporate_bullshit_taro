// Полная колода Таро Райдера-Уэйта: 22 Старших + 56 Младших Арканов.
// Названия на двух языках. Картинок нет — у каждой карты есть символ-эмодзи
// и градиент, чтобы карта выглядела живой и узнаваемой.

export interface CardDef {
  id: string
  en: string
  ru: string
  symbol: string
  // hue для градиента рубашки/лица карты
  hue: number
}

const majors: CardDef[] = [
  { id: 'major-0', en: 'The Fool', ru: 'Шут', symbol: '🃏', hue: 45 },
  { id: 'major-1', en: 'The Magician', ru: 'Маг', symbol: '🪄', hue: 280 },
  { id: 'major-2', en: 'The High Priestess', ru: 'Верховная Жрица', symbol: '🌙', hue: 250 },
  { id: 'major-3', en: 'The Empress', ru: 'Императрица', symbol: '👑', hue: 330 },
  { id: 'major-4', en: 'The Emperor', ru: 'Император', symbol: '🏛️', hue: 10 },
  { id: 'major-5', en: 'The Hierophant', ru: 'Иерофант', symbol: '🗝️', hue: 35 },
  { id: 'major-6', en: 'The Lovers', ru: 'Влюблённые', symbol: '💞', hue: 345 },
  { id: 'major-7', en: 'The Chariot', ru: 'Колесница', symbol: '🛞', hue: 210 },
  { id: 'major-8', en: 'Strength', ru: 'Сила', symbol: '🦁', hue: 40 },
  { id: 'major-9', en: 'The Hermit', ru: 'Отшельник', symbol: '🏮', hue: 200 },
  { id: 'major-10', en: 'Wheel of Fortune', ru: 'Колесо Фортуны', symbol: '🎡', hue: 260 },
  { id: 'major-11', en: 'Justice', ru: 'Справедливость', symbol: '⚖️', hue: 190 },
  { id: 'major-12', en: 'The Hanged Man', ru: 'Повешенный', symbol: '🙃', hue: 220 },
  { id: 'major-13', en: 'Death', ru: 'Смерть', symbol: '💀', hue: 270 },
  { id: 'major-14', en: 'Temperance', ru: 'Умеренность', symbol: '🍷', hue: 175 },
  { id: 'major-15', en: 'The Devil', ru: 'Дьявол', symbol: '😈', hue: 5 },
  { id: 'major-16', en: 'The Tower', ru: 'Башня', symbol: '🗼', hue: 0 },
  { id: 'major-17', en: 'The Star', ru: 'Звезда', symbol: '⭐', hue: 195 },
  { id: 'major-18', en: 'The Moon', ru: 'Луна', symbol: '🌕', hue: 235 },
  { id: 'major-19', en: 'The Sun', ru: 'Солнце', symbol: '☀️', hue: 48 },
  { id: 'major-20', en: 'Judgement', ru: 'Суд', symbol: '📯', hue: 215 },
  { id: 'major-21', en: 'The World', ru: 'Мир', symbol: '🌍', hue: 150 },
]

const suits = [
  { en: 'Wands', ru: 'Жезлов', symbol: '🔥', hue: 25 },
  { en: 'Cups', ru: 'Кубков', symbol: '💧', hue: 205 },
  { en: 'Swords', ru: 'Мечей', symbol: '⚔️', hue: 220 },
  { en: 'Pentacles', ru: 'Пентаклей', symbol: '🪙', hue: 130 },
]

const ranks = [
  { en: 'Ace', ru: 'Туз' },
  { en: 'Two', ru: 'Двойка' },
  { en: 'Three', ru: 'Тройка' },
  { en: 'Four', ru: 'Четвёрка' },
  { en: 'Five', ru: 'Пятёрка' },
  { en: 'Six', ru: 'Шестёрка' },
  { en: 'Seven', ru: 'Семёрка' },
  { en: 'Eight', ru: 'Восьмёрка' },
  { en: 'Nine', ru: 'Девятка' },
  { en: 'Ten', ru: 'Десятка' },
  { en: 'Page', ru: 'Паж' },
  { en: 'Knight', ru: 'Рыцарь' },
  { en: 'Queen', ru: 'Королева' },
  { en: 'King', ru: 'Король' },
]

const minors: CardDef[] = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    id: `${suit.en.toLowerCase()}-${rank.en.toLowerCase()}`,
    en: `${rank.en} of ${suit.en}`,
    ru: `${rank.ru} ${suit.ru}`,
    symbol: suit.symbol,
    hue: suit.hue,
  })),
)

export const DECK: CardDef[] = [...majors, ...minors]

export interface DrawnCard {
  def: CardDef
  reversed: boolean
}

// Тянем три РАЗНЫЕ карты, каждой случайно достаётся прямое/перевёрнутое положение.
export function drawThree(): DrawnCard[] {
  const pool = [...DECK]
  const drawn: DrawnCard[] = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    const [def] = pool.splice(idx, 1)
    drawn.push({ def, reversed: Math.random() < 0.4 })
  }
  return drawn
}
