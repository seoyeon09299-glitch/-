const express = require('express')
const cors    = require('cors')
const path    = require('path')
require('dotenv').config()

const app  = express()
const PORT = process.env.PORT || 4000
const isProd = process.env.NODE_ENV === 'production'

const allowedOrigins = ['http://localhost:5173']
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL)
app.use(cors({ origin: isProd ? allowedOrigins : '*' }))
app.use(express.json())

// Anthropic client — only if API key is present
let anthropic = null
if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk')
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  console.log('✅ Anthropic AI 활성화됨')
} else {
  console.log('⚠️  ANTHROPIC_API_KEY 없음 — AI 기능 비활성화 (server/.env에 키를 추가하세요)')
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ai: !!anthropic })
})

// ─── AI 어시스턴트 ────────────────────────────────────────────────────────────
app.post('/api/ai-assist', async (req, res) => {
  const { sentences, action, customPrompt } = req.body
  if (!sentences?.length) return res.status(400).json({ error: '문장을 선택하세요.' })

  const text = sentences.join(' ')

  if (!anthropic) {
    return res.status(503).json({
      error: 'AI 서비스 미설정',
      hint: 'server/.env 파일에 ANTHROPIC_API_KEY=sk-ant-... 를 추가하세요.',
    })
  }

  const PROMPTS = {
    '더 구체적으로': `다음 한국어 자기소개서 문장을 구체적인 사례와 수치를 포함하여 더 설득력 있게 개선하세요. 결과 텍스트만 출력하세요(설명 없음):\n\n`,
    '문장 다듬기':   `다음 한국어 자기소개서 문장을 더 자연스럽고 읽기 좋게 다듬어주세요. 결과 텍스트만 출력하세요(설명 없음):\n\n`,
    '짧게 요약':    `다음 한국어 자기소개서 문장을 핵심만 유지하며 간결하게 요약하세요. 결과 텍스트만 출력하세요(설명 없음):\n\n`,
    '톤 바꾸기':    `다음 한국어 자기소개서 문장을 더 자신감 있고 능동적인 표현으로 바꿔주세요. 결과 텍스트만 출력하세요(설명 없음):\n\n`,
  }

  const prompt = PROMPTS[action]
    ? PROMPTS[action] + text
    : `다음 한국어 자기소개서 문장에 대해 "${customPrompt || action}" 작업을 수행하세요. 결과 텍스트만 출력하세요(설명 없음):\n\n${text}`

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    })
    res.json({ result: msg.content[0].text.trim() })
  } catch (err) {
    console.error('AI error:', err.message)
    res.status(500).json({ error: 'AI 처리 오류: ' + err.message })
  }
})

// ─── 맞춤법 검사 ──────────────────────────────────────────────────────────────
app.post('/api/spell-check', async (req, res) => {
  const { text } = req.body
  if (!text || text.length < 5) return res.json({ errors: [] })

  if (!anthropic) {
    return res.status(503).json({
      error: 'AI 서비스 미설정',
      hint: 'server/.env 파일에 ANTHROPIC_API_KEY=sk-ant-... 를 추가하세요.',
    })
  }

  const prompt = `당신은 한국어 맞춤법·문법 전문가입니다. 다음 텍스트에서 맞춤법, 띄어쓰기, 문법 오류를 찾아주세요.

반드시 아래 JSON 배열 형식만 출력하세요(마크다운·설명 없이):
[{"original":"오류 원문","correction":"수정 결과","note":"설명"}]

오류가 없으면 빈 배열 []을 반환하세요.

텍스트:
${text}`

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    })
    let raw = msg.content[0].text.trim()
    // Strip any accidental markdown fences
    raw = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/,'').trim()
    let errors = []
    try { errors = JSON.parse(raw) } catch { errors = [] }
    res.json({ errors })
  } catch (err) {
    console.error('Spell-check error:', err.message)
    res.status(500).json({ error: '맞춤법 검사 오류: ' + err.message })
  }
})

// 프로덕션: 빌드된 클라이언트 정적 파일 서빙
if (isProd) {
  const distPath = path.join(__dirname, '../client/dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
