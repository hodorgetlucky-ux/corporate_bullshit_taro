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
    tagline: 'Расклад на рабочие передряги. Чтоб на душе полегчало.',
    inputLabel: 'Что у тебя стряслось?',
    placeholder: 'Расскажи, что за беда на работе. Реорг, дедлайн горит, начальник лютует, перформанс-ревью на носу — выкладывай как есть.',
    draw: 'Раскинуть карты',
    drawing: 'Тасую колоду…',
    again: 'Ещё разок',
    micStart: 'Сказать голосом',
    micStop: 'Стоп',
    micUnsupported: 'Голосовой ввод твой браузер не тянет. Печатай ручками.',
    micDenied: 'К микрофону не пустили. Глянь разрешения в браузере.',
    listening: 'Слушаю…',
    positions: ['Откуда ноги растут', 'Что творится сейчас', 'Чем сердце успокоится'],
    reversed: 'перевёрнутая',
    upright: 'прямая',
    errorShort: 'Маловато написал. Накидай хоть пару фраз про свою ситуацию.',
    errorGeneric: 'Что-то карты заклинило. Попробуй ещё разок через секунду.',
    resultIntro: 'Ну слушай сюда',
    resultSummary: 'Что в итоге',
    resultSupport: 'А теперь по-доброму',
    disclaimer: 'Это не коммерция и не гадалка с базара. Сделано по фану, чтоб поддержать в нервотрёпке. Никакой эзотерики всерьёз, решения принимай головой, а не картами.',
    langSwitch: 'EN',
    emptyHint: 'Опиши ситуацию и жми кнопку — карты сами разберутся.',
  },
  en: {
    htmlLang: 'en',
    speechLang: 'en-US',
    title: 'Corporate Tarot',
    tagline: 'A spread for workplace messes. To take the edge off.',
    inputLabel: "What's eating you?",
    placeholder: "Tell me what went sideways at work. Reorg, deadline on fire, boss losing it, perf review looming — just lay it all out.",
    draw: 'Lay the cards',
    drawing: 'Shuffling the deck…',
    again: 'One more time',
    micStart: 'Speak it',
    micStop: 'Stop',
    micUnsupported: "Your browser can't do voice input. Type it out, friend.",
    micDenied: "Mic access was blocked. Check your browser permissions.",
    listening: 'Listening…',
    positions: ['Where it comes from', "What's going on now", 'How it settles'],
    reversed: 'reversed',
    upright: 'upright',
    errorShort: "That's a bit thin. Give me at least a sentence or two about your situation.",
    errorGeneric: 'The cards jammed up. Give it another go in a second.',
    resultIntro: 'Alright, listen up',
    resultSummary: 'Bottom line',
    resultSupport: 'And now, kindly',
    disclaimer: "This is not a business and not a roadside fortune-teller. Made for fun, to lend a hand when work gets rough. No real esoterics here — make your calls with your head, not the cards.",
    langSwitch: 'RU',
    emptyHint: 'Describe the situation and hit the button — the cards will sort it out.',
  },
}
