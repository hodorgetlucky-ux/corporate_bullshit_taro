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
    tagline: 'Три карты на рабочую ситуацию. Чтобы выдохнуть и увидеть её яснее.',
    inputLabel: 'Что происходит?',
    placeholder: 'Опиши рабочую ситуацию: что случилось, что беспокоит, чего ждёшь. Чем конкретнее, тем точнее расклад.',
    draw: 'Сделать расклад',
    drawing: 'Тасую карты…',
    again: 'Новый вопрос',
    micStart: 'Голосом',
    micStop: 'Стоп',
    micUnsupported: 'Браузер не поддерживает голосовой ввод. Набери текст вручную.',
    micDenied: 'Нет доступа к микрофону. Проверь разрешения в браузере.',
    listening: 'Слушаю…',
    positions: ['Что привело', 'Что сейчас', 'К чему идёт'],
    reversed: 'перевёрнутая',
    upright: 'прямая',
    errorShort: 'Слишком коротко. Опиши ситуацию хотя бы парой фраз.',
    errorGeneric: 'Не получилось сделать расклад. Попробуй ещё раз через секунду.',
    resultIntro: 'Расклад',
    resultSummary: 'Итог',
    resultSupport: 'Поддержка',
    disclaimer: 'Приложение некоммерческое, сделано для развлечения и поддержки. Это не эзотерика и не предсказание. Решения принимай сам.',
    langSwitch: 'EN',
    emptyHint: 'Опиши ситуацию и нажми кнопку.',
  },
  en: {
    htmlLang: 'en',
    speechLang: 'en-US',
    title: 'Corporate Tarot',
    tagline: 'Three cards on your work situation. To exhale and see it more clearly.',
    inputLabel: "What's going on?",
    placeholder: 'Describe your work situation: what happened, what worries you, what you expect. The more specific, the sharper the reading.',
    draw: 'Draw the cards',
    drawing: 'Shuffling…',
    again: 'New question',
    micStart: 'Voice',
    micStop: 'Stop',
    micUnsupported: "Your browser doesn't support voice input. Please type instead.",
    micDenied: 'No microphone access. Check your browser permissions.',
    listening: 'Listening…',
    positions: ['What led here', 'Where it stands', "Where it's heading"],
    reversed: 'reversed',
    upright: 'upright',
    errorShort: 'Too short. Describe the situation in at least a sentence or two.',
    errorGeneric: "Couldn't make the reading. Try again in a second.",
    resultIntro: 'Reading',
    resultSummary: 'Summary',
    resultSupport: 'Support',
    disclaimer: 'This app is non-commercial, made for fun and support. Not esoterics, not a prediction. Make your own decisions.',
    langSwitch: 'RU',
    emptyHint: 'Describe the situation and press the button.',
  },
}
