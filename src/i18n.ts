export type Lang = 'ru' | 'en'

export interface Strings {
  htmlLang: string
  speechLang: string
  title: string
  tagline: string
  inputLabel: string
  placeholder: string
  draw: string
  drawing: string
  again: string
  micStart: string
  micStop: string
  micUnsupported: string
  micDenied: string
  listening: string
  positions: [string, string, string]
  reversed: string
  upright: string
  errorShort: string
  errorGeneric: string
  resultIntro: string
  resultSummary: string
  resultSupport: string
  disclaimer: string
  langSwitch: string
  emptyHint: string
}

export const STRINGS: Record<Lang, Strings> = {
  ru: {
    htmlLang: 'ru',
    speechLang: 'ru-RU',
    title: 'Корпоративное Таро',
    tagline: 'Три карты на рабочую заварушку. Чтоб на душе полегчало и стало яснее.',
    inputLabel: 'Ну чё там у тебя?',
    placeholder: 'Давай как есть: что за беда на работе, что гложет, чего ждёшь. Чем подробнее расскажешь — тем толковее расклад.',
    draw: 'Раскинуть карты',
    drawing: 'Тасую колоду…',
    again: 'Спросить заново',
    micStart: 'Сказать голосом',
    micStop: 'Стоп',
    micUnsupported: 'Браузер голос не понимает. Пиши руками.',
    micDenied: 'К микрофону не пускает. Глянь разрешения в браузере.',
    listening: 'Слушаю…',
    positions: ['С чего пошло', 'Что сейчас', 'Куда вырулит'],
    reversed: 'перевёрнутая',
    upright: 'прямая',
    errorShort: 'Маловато будет. Накидай хоть пару фраз, чтоб было с чем работать.',
    errorGeneric: 'Чёт карты заупрямились. Попробуй ещё разок через секунду.',
    resultIntro: 'Ну смотри',
    resultSummary: 'Короче',
    resultSupport: 'А теперь по-доброму',
    disclaimer: 'Это не бизнес и не гадалка с базара. Сделано по фану, чтоб поддержать. Никакой эзотерики всерьёз — решай своей головой, а не по картам.',
    langSwitch: 'EN',
    emptyHint: 'Расскажи, чё происходит, и жми кнопку.',
  },
  en: {
    htmlLang: 'en',
    speechLang: 'en-US',
    title: 'Corporate Tarot',
    tagline: "Three cards on your work mess. To breathe out and see it straight.",
    inputLabel: "So what's going on?",
    placeholder: "Just lay it out: what happened at work, what's gnawing at you, what you're waiting on. The more you tell, the better the read.",
    draw: 'Lay the cards',
    drawing: 'Shuffling the deck…',
    again: 'Ask again',
    micStart: 'Speak it',
    micStop: 'Stop',
    micUnsupported: "Browser can't do voice. Just type it.",
    micDenied: 'No mic access. Check your browser permissions.',
    listening: 'Listening…',
    positions: ['Where it started', 'Where it stands', "Where it's headed"],
    reversed: 'reversed',
    upright: 'upright',
    errorShort: "That's a bit thin. Give me a couple sentences to work with.",
    errorGeneric: 'Cards are being stubborn. Give it another go in a sec.',
    resultIntro: 'Alright, look',
    resultSummary: 'In short',
    resultSupport: 'Now, kindly',
    disclaimer: "This ain't a business or some boardwalk fortune-teller. Made for fun, to lend a hand. No real esoterics — use your own head, not the cards.",
    langSwitch: 'RU',
    emptyHint: "Tell me what's going on and hit the button.",
  },
}
