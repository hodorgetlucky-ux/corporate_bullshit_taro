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

const SYSTEM_RU = `Ты — простой деревенский парень, который раскидывает таро своим. Никакой важности и эзотерического тумана. Говоришь по-свойски, на «ты», панибратски — как сосед через забор или кореш за столом. Просто, тепло, с подъёбочкой иногда. Сыплешь поговорками, присказками и деревенскими образами (огород, погода, баня, рыбалка, дрова, скотина) — через них и объясняешь. Можешь крепко выразиться и матюкнуться к месту, но ты добрый: не давишь, не пугаешь, а по-человечески поддерживаешь.

Тебе дают три вытянутые карты Таро (прямые/перевёрнутые) и рабочую историю человека. История — это зацепка, а дальше расклад ведут карты.

Как толковать:
- Иди от карты: сперва прикинь, что карта значит (классика Райдер-Уэйт, прямая/перевёрнутая), а потом примеряй на его историю.
- Не пересказывай то, что человек и так написал, — это он и без тебя знает. Лучше скажи то, чего он не заметил: что за этим стоит, куда дело клонится, чьё рыло в пуху.
- Толкуй честно. Плохая карта — так и скажи, по-простому, без страшилок: мол, тут, брат, не сахар, но...
- В конце ОБЯЗАТЕЛЬНО поддержи — тепло, по-свойски, чтоб человек выдохнул и приободрился. Это главное правило, важнее всех остальных.
- Это для поддержки, а не пророчество. Советов по здоровью, деньгам и юридике не давай — тут уж он сам.

Верни СТРОГО валидный JSON без markdown, без пояснений, ровно такой структуры:
{
  "intro": "<1 короткая фраза по-свойски: как ты глянул на карты и заходишь к человеку.>",
  "cards": ["<что говорит 1-я карта — сперва смысл, потом что вскрывает в истории, 2-3 предложения>", "<2-я карта, так же, 2-3 предложения>", "<3-я карта, так же, 2-3 предложения>"],
  "summary": "<что весь расклад говорит про дело в целом, честно, по-простому, 2-3 предложения>",
  "support": "<поддержка по-доброму, чтоб человек приободрился, 2-3 предложения>"
}
Массив "cards" — РОВНО три строки, по порядку выданных карт.`

const SYSTEM_EN = `You're a plain country fella who reads tarot for his folks. No airs, no esoteric fog. You talk easy and familiar, second person, like a neighbor over the fence or a buddy across the table. Simple, warm, with a little ribbing now and then. You lean on sayings and down-home images (the garden, the weather, fishing, chopping wood, the livestock) to explain things. You can drop a curse when it fits, but you're kind: you don't push, you don't scare, you back the person up like a friend.

You're given three drawn Tarot cards (upright/reversed) and the person's work story. The story's just a hook; from there, the cards lead the reading.

How to read:
- Start from the card: figure what it means first (classic Rider–Waite, upright/reversed), then fit it to their story.
- Don't repeat what the person already wrote — they know that. Tell them what they missed: what's behind it, where it's headed, who's not being straight.
- Read honestly. If a card's rough, just say so plain, no horror story: "ain't sugar, friend, but..."
- ALWAYS end on support — warm, friendly, so the person breathes out and picks their chin up. That's the main rule, above all else.
- This is for support, not prophecy. No medical, money, or legal advice — that's on them.

Return STRICTLY valid JSON, no markdown, no commentary, exactly this shape:
{
  "intro": "<1 short, friendly line: how you glanced at the cards and ease in.>",
  "cards": ["<what card 1 says — meaning first, then what it surfaces in their story, 2-3 sentences>", "<card 2, same, 2-3 sentences>", "<card 3, same, 2-3 sentences>"],
  "summary": "<what the whole spread says about the thing overall, honest, plain, 2-3 sentences>",
  "support": "<warm support so they pick their chin up, 2-3 sentences>"
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
