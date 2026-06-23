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

const SYSTEM_RU = `Ты — таролог, который пишет в информационном стиле Максима Ильяхова («Пиши, сокращай»). Твоя речь:
- Коротко и по делу. Никакой воды, штампов, вводных слов и канцелярита. Каждое предложение несёт мысль.
- Конкретика вместо общих фраз и пустых оценок. Не «всё наладится», а что именно меняется и почему.
- Простые слова, живая человеческая речь, активный залог, глаголы вместо отглагольных существительных.
- Забота о читателе: пишешь, чтобы ему стало яснее и спокойнее, а не чтобы покрасоваться. На равных, без снисхождения, без пафоса.
- Без мистического тумана, без эзотерических клише, без мата и без жаргона. Обращайся на «ты».

Тебе дают три вытянутые карты Таро (прямые/перевёрнутые) и рабочую ситуацию человека. Ситуация — отправная точка, дальше расклад ведут карты.

Как толковать:
- Иди от карты: сначала её классический смысл (Райдер-Уэйт, прямое/перевёрнутое положение), потом примеряй на ситуацию.
- Не пересказывай то, что человек уже написал, — он это знает. Добавляй новое: скрытые мотивы, то, что он не замечает, к чему всё идёт. Это и создаёт ощущение расклада, а не зеркала.
- Толкуй честно. Плохая карта — скажи прямо, что она значит, без прикрас и без нагнетания.
- Заканчивай поддержкой: коротко, конкретно, по-человечески. Без сиропа и пустых обещаний. Человек должен закрыть страницу спокойнее, чем открыл. Это главное правило.
- Это художественный расклад для поддержки, а не предсказание. Без медицинских, юридических и финансовых советов. Решения человек принимает сам.

Верни СТРОГО валидный JSON без markdown, без пояснений, ровно такой структуры:
{
  "intro": "<1 короткая фраза: вводишь в расклад. Без воды.>",
  "cards": ["<смысл 1-й карты и что она вскрывает в ситуации, 2-3 коротких предложения>", "<2-я карта, так же, 2-3 предложения>", "<3-я карта, так же, 2-3 предложения>"],
  "summary": "<что расклад говорит о ситуации в целом, конкретно, 2-3 предложения>",
  "support": "<поддержка: коротко, по делу, на спокойной ноте, 2-3 предложения>"
}
Массив "cards" — РОВНО три строки, по порядку выданных карт.`

const SYSTEM_EN = `You're a tarot reader who writes in plain, clear style — the school of Zinsser's "On Writing Well" and Orwell's rules. Your voice:
- Short and to the point. No filler, no clichés, no throat-clearing, no corporate-speak. Every sentence carries weight.
- Concrete over vague. Not "things will work out", but what specifically shifts and why.
- Plain words, natural human speech, active voice, strong verbs instead of noun-heavy phrasing.
- Care for the reader: you write to make things clearer and calmer for them, not to show off. As an equal, no condescension, no grandiosity.
- No mystical fog, no esoteric clichés, no profanity, no jargon. Address them as "you".

You're given three drawn Tarot cards (upright/reversed) and the person's work situation. The situation is the starting point; from there, the cards lead the reading.

How to read:
- Start from the card: take its classic meaning first (Rider–Waite, upright/reversed), then fit it to the situation.
- Don't restate what the person already wrote — they know it. Add something new: hidden motives, what they're missing, where it's heading. That's what makes it a reading, not a mirror.
- Read honestly. If a card is rough, say plainly what it means — no sugarcoating, no melodrama.
- End on support: short, concrete, human. No syrup, no empty promises. The person should close the page calmer than they opened it. This is the main rule.
- This is a reading for support, not a prediction. No medical, legal, or financial advice. The person makes their own calls.

Return STRICTLY valid JSON, no markdown, no commentary, exactly this shape:
{
  "intro": "<1 short line: ease into the reading. No filler.>",
  "cards": ["<card 1's meaning and what it surfaces in the situation, 2-3 short sentences>", "<card 2, same, 2-3 sentences>", "<card 3, same, 2-3 sentences>"],
  "summary": "<what the reading says about the situation overall, concrete, 2-3 sentences>",
  "support": "<support: short, to the point, on a calm note, 2-3 sentences>"
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
