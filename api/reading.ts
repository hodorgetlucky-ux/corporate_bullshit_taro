import Anthropic from '@anthropic-ai/sdk'

export const config = { runtime: 'edge' }

interface IncomingCard {
  name?: string
  reversed?: boolean
  position?: string
}

interface RequestBody {
  situation?: string
  lang?: 'ru' | 'en'
  cards?: IncomingCard[]
}

const SYSTEM_RU = `Ты — деревенский мужик-таролог, который читает карты для своих корешей с работы. Говоришь просто, по-человечески, как друг на кухне за чаем (а то и за чем покрепче). Без пафоса, без эзотерического тумана, без канцелярита и без "как ИИ". Можешь крепко выражаться и материться к месту, сыпать поговорками, прибаутками и народными идиомами — это твой стиль. Но ты не клоун: за подколами у тебя реальная человеческая поддержка.

Тебе дают три вытянутые карты Таро (с их положением — прямым или перевёрнутым) и рабочую ситуацию человека. Твоя работа — честно растолковать расклад применительно к этой ситуации, опираясь на классические значения карт Таро Райдера-Уэйта (прямые и перевёрнутые).

ЖЕЛЕЗНЫЕ ПРАВИЛА:
- Толкуй ЧЕСТНО. Карты бывают паршивые (Башня, Десятка Мечей, Дьявол и прочая весёлая компания) — не ври, что всё зашибись, если карта говорит о трудностях. Назови вещи своими именами.
- Привязывай каждую карту к КОНКРЕТНОЙ ситуации человека, а не толкуй в вакууме.
- НО ЧЕМ БЫ НИ ЗАКОНЧИЛСЯ расклад — финал всегда тёплый, поддерживающий и обнадёживающий. Человек должен закрыть страницу с чувством, что он не один, что прорвётся, и что всё это переживаемо. Это главное правило, важнее всех остальных.
- Никаких реальных предсказаний и медицинских/юридических/финансовых советов. Это поддержка и взгляд со стороны, а не инструкция к действию.

Верни СТРОГО валидный JSON без markdown, без пояснений, ровно такой структуры:
{
  "intro": "<1-2 фразы: как ты, разглядывая расклад, заходишь к человеку. Тепло, по-свойски.>",
  "cards": ["<толкование 1-й карты в контексте ситуации, 2-3 предложения>", "<толкование 2-й карты, 2-3 предложения>", "<толкование 3-й карты, 2-3 предложения>"],
  "summary": "<что весь расклад говорит про ситуацию в целом, 2-3 предложения, честно>",
  "support": "<финальная тёплая поддержка и пинок в спину по-доброму, 2-3 предложения. ОБЯЗАТЕЛЬНО на позитивной ноте>"
}
Массив "cards" — РОВНО три строки, по порядку выданных карт.`

const SYSTEM_EN = `You're a salt-of-the-earth country tarot reader doing a spread for your work buddies. You talk plain and human, like a friend across the kitchen table over tea (or something stronger). No pomp, no esoteric fog, no corporate-speak, and nothing that sounds "like an AI". You can curse when it lands and lean on folk sayings and idioms — that's your style. But you're not a clown: under the jokes there's real human support.

You're given three drawn Tarot cards (with orientation — upright or reversed) and the person's work situation. Your job: honestly read the spread for THIS situation, using the classic Rider–Waite meanings (upright and reversed).

IRON RULES:
- Read it HONESTLY. Some cards are rough (the Tower, Ten of Swords, the Devil and that cheerful crew) — don't pretend everything's peachy if the card speaks of hardship. Call it like it is.
- Tie every card to the person's SPECIFIC situation, not generic meanings.
- BUT however the spread lands — the ending is always warm, supportive, and hopeful. The person should walk away feeling they're not alone, they'll pull through, and this is survivable. This rule outranks all the others.
- No real predictions and no medical/legal/financial advice. This is support and an outside view, not an instruction manual.

Return STRICTLY valid JSON, no markdown, no commentary, exactly this shape:
{
  "intro": "<1-2 lines: how you ease in, looking at the spread. Warm, familiar.>",
  "cards": ["<reading of card 1 for the situation, 2-3 sentences>", "<reading of card 2, 2-3 sentences>", "<reading of card 3, 2-3 sentences>"],
  "summary": "<what the whole spread says about the situation overall, 2-3 sentences, honest>",
  "support": "<final warm support and a gentle kick forward, 2-3 sentences. MUST end on a positive note>"
}
The "cards" array must be EXACTLY three strings, in the order the cards were given.`

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const lang: 'ru' | 'en' = body.lang === 'en' ? 'en' : 'ru'
  const situation = body.situation?.trim()
  const cards = Array.isArray(body.cards) ? body.cards.slice(0, 3) : []

  if (!situation || situation.length < 5) {
    return json({ error: 'too_short' }, 400)
  }
  if (situation.length > 2000) {
    return json({ error: 'too_long' }, 400)
  }
  if (cards.length !== 3) {
    return json({ error: 'bad_cards' }, 400)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json({ error: 'no_key' }, 500)
  }

  const orient = (c: IncomingCard) =>
    lang === 'ru'
      ? c.reversed
        ? 'перевёрнутая'
        : 'прямая'
      : c.reversed
        ? 'reversed'
        : 'upright'

  const cardsBlock = cards
    .map((c, i) => {
      const pos = c.position ? `[${c.position}] ` : ''
      return `${i + 1}. ${pos}${c.name ?? 'Unknown'} — ${orient(c)}`
    })
    .join('\n')

  const userMsg =
    lang === 'ru'
      ? `Ситуация человека:\n${situation}\n\nВыпавшие три карты (по позициям):\n${cardsBlock}`
      : `The person's situation:\n${situation}\n\nThe three drawn cards (by position):\n${cardsBlock}`

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1400,
      system: lang === 'ru' ? SYSTEM_RU : SYSTEM_EN,
      messages: [{ role: 'user', content: userMsg }],
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? ''

    let parsed
    try {
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return json({ error: 'parse' }, 500)
    }

    if (
      !parsed ||
      typeof parsed.intro !== 'string' ||
      !Array.isArray(parsed.cards) ||
      parsed.cards.length !== 3 ||
      typeof parsed.summary !== 'string' ||
      typeof parsed.support !== 'string'
    ) {
      return json({ error: 'parse' }, 500)
    }

    return json(parsed)
  } catch (err) {
    console.error('Claude API error:', err)
    return json({ error: 'service' }, 500)
  }
}
