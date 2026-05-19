import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadState(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback }
  catch { return fallback }
}
function saveState(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const HomeIcon     = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill={active?'#111':'#a0a0a0'}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>)
const ListIcon     = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill={active?'#111':'#a0a0a0'}><path d="M3 9h2v2H3V9m0 4h2v-2H3v2m0 4h2v-2H3v2m4 0h11v-2H7v2m0-4h11v-2H7v2m0-6v2h11V7H7z"/></svg>)
const DocIcon      = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill={active?'#111':'#a0a0a0'}><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>)
const ChatIcon     = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill={active?'#111':'#a0a0a0'}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/></svg>)
const CoachIcon    = ({ active }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill={active?'#111':'#a0a0a0'}><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V18H7v2h10v-2h-4v-2.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>)
const ChevronIcon  = ({ size=12, up=false }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{transform:up?'rotate(180deg)':'none',transition:'transform .2s'}}><path d="M7 10l5 5 5-5z"/></svg>)
const MoreVertIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#757575"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>)
const BookIcon     = ({ size=18, color='#989898' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>)
const SearchIcon   = ({ size=18, color='#989898' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>)
const CloseIcon    = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="#989898"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>)
const WandIcon     = ({ color='#757575' }) => (<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a1 1 0 0 0-1.41 0L1.29 18.96a1 1 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a1 1 0 0 0 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z"/></svg>)
const SpellcheckIcon = ({ color='#757575' }) => (<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M12.45 16h2.09L9.43 3H7.57L2.46 16h2.09l1.12-3h5.64zm-5.1-5l2.18-5.86L11.71 11H7.35zM21.59 11.59l-8.09 8.09L11 17.17 9.59 18.59 13.5 22.5l9.5-9.5z"/></svg>)
const UndoIcon     = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="#757575"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>)
const RedoIcon     = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="#757575"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>)
const PlusIcon     = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="#ff6813"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>)
const AddIcon      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#ff6813"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>)
const PencilIcon   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#aaaaaa"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>)
const SpinnerIcon  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6813" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 1s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>)
const NotesIcon    = ({ color='#757575' }) => (<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>)

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATUS_TABS = ['작성중', '제출 완료', '서류 합격', '1차 합격', '2차 합격']

const ALL_APPLICATIONS = [
  { id: 1, company: '코스맥스그룹 [코스맥스] 전략마케팅', deadline: '~ 2026. 04.06 16:00', remaining: '4일 남음',   originalStatus: '작성중' },
  { id: 2, company: 'CJ그룹 [CJ 올리브영] MD',          deadline: '~ 2025. 04.03 18:00', remaining: '11개월 지남', originalStatus: '작성중' },
  { id: 3, company: '콜마그룹 한국콜마(내곡)_영업',       deadline: '~ 2024. 10.03 23:59', remaining: '1년 지남',   originalStatus: '작성중' },
  { id: 4, company: 'LG전자 [LG전자] 마케팅기획',         deadline: '~ 2026. 03.15 18:00', remaining: '2개월 지남', originalStatus: '제출 완료' },
  { id: 5, company: '삼성전자 [삼성전자] 영업마케팅',      deadline: '~ 2026. 02.28 18:00', remaining: '2개월 지남', originalStatus: '서류 합격' },
  { id: 6, company: 'SK하이닉스 [SK하이닉스] 마케팅기획', deadline: '~ 2026. 01.30 18:00', remaining: '3개월 지남', originalStatus: '1차 합격' },
]

const SORT_OPTIONS = ['수정일순', '최신순', '마감일순']

const BADGE_STYLES = {
  '성장경험': { color: '#e96b6b', bg: '#fce3e4' },
  '지원동기': { color: '#7aa2c8', bg: '#edf3f9' },
  '강점':     { color: '#9ab17a', bg: '#f3f5ed' },
  '수치성과': { color: '#e8a64c', bg: '#fdf4e9' },
  '포부':     { color: '#b07ab1', bg: '#eedcef' },
}

const DEFAULT_CATS = [
  { label: '성장경험', color: '#e96b6b', bg: '#fce3e4' },
  { label: '지원동기', color: '#7aa2c8', bg: '#edf3f9' },
  { label: '강점',     color: '#9ab17a', bg: '#f3f5ed' },
  { label: '수치성과', color: '#e8a64c', bg: '#fdf4e9' },
  { label: '포부',     color: '#b07ab1', bg: '#eedcef' },
]

const SAMPLE_CONTENT = '저는 기술을 통해 사람들의 삶을 더 편리하게 만드는 일에 가치를 둡니다. 삼성전자는 끊임없는 혁신으로 세계 기술 리더십을 증명해 왔으며, 저의 이러한 목표를 실현할 최적의 장이라 확신하여 지원했습니다. 입사 후에는 공정 효율을 10% 이상 개선하여 초격차 경쟁력 유지에 기여하겠습니다'

const INIT_LIBRARY = [
  { id: 1, category: '성장경험', title: '동아리 프로젝트 경험',  content: SAMPLE_CONTENT },
  { id: 2, category: '지원동기', title: '삼성 온디바이스 AI',    content: SAMPLE_CONTENT },
  { id: 3, category: '강점',     title: '문제 해결 접근법',      content: SAMPLE_CONTENT },
  { id: 4, category: '수치성과', title: '추천 시스템 10% 개선',  content: SAMPLE_CONTENT },
  { id: 5, category: '포부',     title: '마지막 마무리',         content: SAMPLE_CONTENT },
  { id: 6, category: '수치성과', title: '매장 매출 개선',        content: SAMPLE_CONTENT },
]

let CATS = ['성장경험', '지원동기', '강점', '수치성과', '포부']

const NAV_ITEMS = [
  { label: '홈',       Icon: HomeIcon  },
  { label: '채용공고',  Icon: ListIcon  },
  { label: '자기소개서', Icon: DocIcon  },
  { label: '채팅',     Icon: ChatIcon  },
  { label: '합격코치',  Icon: CoachIcon },
]

const MOCK_QUESTIONS = [
  { text: '귀하가 지원한 직무와 관련하여 본인의 역량과 경험을 구체적으로 기술해 주세요.', maxChars: 1000 },
  { text: '당사에 지원하게 된 동기와 입사 후 이루고 싶은 목표를 서술해 주세요.', maxChars: 800 },
  { text: '조직·팀 내 갈등이나 어려움을 해결한 경험과 그 과정에서 배운 점을 기술해 주세요.', maxChars: 600 },
  { text: '자신의 강점과 약점을 각각 기술하고, 약점을 보완하기 위한 노력을 설명하세요.', maxChars: 800 },
]

const CAT_COLORS = ['#e96b6b','#e8a64c','#c8b84a','#6ab87a','#7aa2c8','#7084fa','#b07ab1','#555555']

const AI_ACTIONS = [
  { name: '더 구체적으로', desc: '구체 사례와 숫자로' },
  { name: '문장 다듬기',   desc: '자연스럽게 수정' },
  { name: '짧게 요약',    desc: '핵심만 간결하게' },
  { name: '톤 바꾸기',    desc: '더 자신감 있게' },
]

const HIGHLIGHT_COLORS = ['#ffd04a', '#7dd87a', '#79c8f5', '#ffb0c4', '#c9a8f5', '#ffaa5e']

function lightenColor(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgb(${Math.round(r*.18+255*.82)},${Math.round(g*.18+255*.82)},${Math.round(b*.18+255*.82)})`
}

function getLibFilters(items) {
  const counts = {}
  items.forEach(({ category }) => { counts[category] = (counts[category]||0)+1 })
  return [{ label:'전체', count:items.length }, ...CATS.map(cat => ({ label:cat, count:counts[cat]||0 }))]
}

// 문장 단위 분리
function splitIntoSentences(text) {
  if (!text || !text.trim()) return []
  const parts = text.split(/(?<=[.!?])\s+/)
  return parts.filter(s => s.trim())
}

// 모의 맞춤법 검사
function getMockSpellErrors(text) {
  if (!text || text.length < 10) return []
  const results = []
  const checks = [
    { find: '증명해 왔으며', fix: '증명해왔으며', note: '보조동사는 붙여 씁니다.' },
    { find: '삶을 더 편리하게', fix: '삶을더 편리하게', note: '띄어쓰기를 확인하세요.' },
  ]
  checks.forEach(({ find, fix, note }) => {
    if (text.includes(find)) results.push({ original: find, correction: fix, note })
  })
  if (results.length === 0 && text.length > 20) {
    results.push({ original: text.slice(0, 8), correction: text.slice(0, 8), note: '올바른 표현입니다.' })
  }
  return results
}

// ─── 어노테이션 세그먼트 빌더 ─────────────────────────────────────────────────
function buildAnnotatedSegments(text, annotations) {
  if (!annotations.length || !text) return [{ text, annotation: null }]
  const located = annotations.map(ann => {
    const idx = text.indexOf(ann.text)
    if (idx < 0) return null
    return { ...ann, realStart: idx, realEnd: idx + ann.text.length }
  }).filter(Boolean).sort((a, b) => a.realStart - b.realStart)

  if (!located.length) return [{ text, annotation: null }]
  const parts = []
  let pos = 0
  for (const ann of located) {
    if (ann.realStart > pos) parts.push({ text: text.slice(pos, ann.realStart), annotation: null })
    parts.push({ text: text.slice(ann.realStart, ann.realEnd), annotation: ann })
    pos = ann.realEnd
  }
  if (pos < text.length) parts.push({ text: text.slice(pos), annotation: null })
  return parts
}

// 검색 스니펫 내 검색어 강조
function highlightSnippet(snippet, query) {
  if (!query || !snippet) return snippet
  const lowerSnip  = snippet.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerSnip.indexOf(lowerQuery)
  if (idx < 0) return snippet
  return (
    <>
      {snippet.slice(0, idx)}
      <mark className="search-hl">{snippet.slice(idx, idx + query.length)}</mark>
      {snippet.slice(idx + query.length)}
    </>
  )
}

// AI 문장 변환 (모의)
function applyAIAction(sentence, action) {
  if (!sentence) return sentence
  switch (action) {
    case '더 구체적으로':
      return sentence.replace(/합니다\.?$/, '하였으며, 구체적으로 수치 기반의 성과를 이끌어냈습니다.')
    case '문장 다듬기':
      return sentence.replace('저는', '저는').replace('왔으며,', '왔으며').replace('합니다', '합니다')
    case '짧게 요약': {
      const words = sentence.split(' ')
      return words.slice(0, Math.min(8, words.length)).join(' ') + (words.length > 8 ? '.' : '')
    }
    case '톤 바꾸기':
      return sentence.replace('둡니다', '둡니다').replace('지원했습니다', '지원하였습니다').replace('합니다', '하겠습니다')
    default: return sentence
  }
}

// ─── 공용 컴포넌트 ────────────────────────────────────────────────────────────
function Badge({ category }) {
  const s = BADGE_STYLES[category] || { color:'#888', bg:'#f0f0f0' }
  return (
    <span className="lib-badge" style={{ color:s.color, backgroundColor:s.bg }}>
      <span className="lib-badge__dot" style={{ backgroundColor:s.color }} />
      {category}
    </span>
  )
}

function BottomNav({ activeNav, setActiveNav }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ label, Icon }, i) => (
        <button key={label} className={`nav-item ${activeNav===i?'nav-item--active':''}`} onClick={() => setActiveNav(i)}>
          <Icon active={activeNav===i} />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}

function MainTabHeader({ activeTab, onChange }) {
  return (
    <div className="lib-view-header">
      <button className={`lib-view-tab ${activeTab==='docs'?'lib-view-tab--active':'tap'}`} onClick={() => onChange('docs')}>작성한 서류</button>
      <button className={`lib-view-tab ${activeTab==='library'?'lib-view-tab--active':'tap'}`} onClick={() => onChange('library')}>라이브러리</button>
    </div>
  )
}

// ─── 하단 툴바 바텀시트 공통 ──────────────────────────────────────────────────
function ToolSheetBar({ activeSheet, onSheetChange, onLibrary, extraButtons, onClose }) {
  return (
    <div className="tool-sheet-bar">
      <button className="tool-icon-btn tap" onClick={onLibrary}>
        <BookIcon size={22} color="#757575" />
      </button>
      <button className={`tool-icon-btn tap ${activeSheet==='ai'?'tool-icon-btn--active':''}`} onClick={() => onSheetChange('ai')}>
        <WandIcon color={activeSheet==='ai'?'#ff6813':'#757575'} />
      </button>
      <button className={`tool-icon-btn tap ${activeSheet==='spell'?'tool-icon-btn--active':''}`} onClick={() => onSheetChange('spell')}>
        <SpellcheckIcon color={activeSheet==='spell'?'#ff6813':'#757575'} />
      </button>
      <button className={`tool-icon-btn tap ${activeSheet==='search'?'tool-icon-btn--active':''}`} onClick={() => onSheetChange('search')}>
        <SearchIcon size={22} color={activeSheet==='search'?'#ff6813':'#757575'} />
      </button>
      <div className="doc-bar-spacer" />
      {extraButtons}
      <button className="tool-icon-btn tap tool-close-btn" onClick={onClose}><CloseIcon /></button>
    </div>
  )
}

// 문장 선택 뷰 (AI 모드) — 여러 문장 동시 선택 가능
function SentenceSelectView({ text, selectedSentences, onToggle }) {
  const sentences = splitIntoSentences(text)
  if (!text) return <div className="sentence-view"><span className="sentence-empty">내용을 입력한 후 문장을 선택하세요.</span></div>
  return (
    <div className="sentence-view">
      {sentences.map((s, i) => (
        <span key={i}
          className={`sentence-span ${selectedSentences.includes(s) ? 'sentence-span--selected' : ''}`}
          onClick={() => onToggle(s)}>
          {s}{i < sentences.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  )
}

// 맞춤법 오류 강조 뷰
function HighlightedText({ text, errors }) {
  if (!text) return <div className="spell-text-view" />
  if (!errors || errors.length === 0) return <div className="spell-text-view">{text}</div>

  const validErrors = errors.filter(e => e.original !== e.correction && text.includes(e.original))
    .map(e => ({ ...e, idx: text.indexOf(e.original) }))
    .sort((a, b) => a.idx - b.idx)

  if (validErrors.length === 0) return <div className="spell-text-view">{text}</div>

  const parts = []
  let pos = 0
  for (const err of validErrors) {
    if (err.idx > pos) parts.push({ t: text.slice(pos, err.idx), err: false })
    parts.push({ t: err.original, err: true })
    pos = err.idx + err.original.length
  }
  if (pos < text.length) parts.push({ t: text.slice(pos), err: false })

  return (
    <div className="spell-text-view">
      {parts.map((p, i) =>
        p.err ? <span key={i} className="spell-highlight">{p.t}</span> : <span key={i}>{p.t}</span>
      )}
    </div>
  )
}

// AI 어시스턴트 콘텐츠
function AISheetContent({ selectedSentences, aiInput, setAiInput, onApply, loading }) {
  const count = selectedSentences.length
  const canAct = count > 0 && !loading
  return (
    <div className="tool-sheet-content">
      <div className="ai-sheet-header">
        <span className="ai-sheet-title">AI 작성 도우미</span>
        <span className="ai-sheet-subtitle">
          {loading ? 'AI가 작성 중입니다…' :
           count > 0 ? `${count}개 문장 선택됨` : '본문에서 문장을 탭해 선택하세요 (복수 선택 가능)'}
        </span>
      </div>
      {loading ? (
        <div className="ai-loading-row"><SpinnerIcon /><span>처리 중…</span></div>
      ) : (
        <>
          <div className="ai-actions-grid">
            {AI_ACTIONS.map(({ name, desc }) => (
              <button key={name} className={`ai-action-btn tap ${!canAct ? 'ai-action-btn--disabled' : ''}`}
                onClick={() => canAct && onApply(name)}>
                <span className="ai-action-btn__name">{name}</span>
                <span className="ai-action-btn__desc">{desc}</span>
              </button>
            ))}
          </div>
          <div className="ai-input-row">
            <PencilIcon />
            <input className="ai-input" placeholder="원하는 요청을 직접 입력하세요"
              value={aiInput} onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && aiInput.trim() && canAct) {
                  onApply(aiInput.trim()); setAiInput('')
                }
              }} />
          </div>
        </>
      )}
    </div>
  )
}

// 맞춤법 검사 콘텐츠
function SpellSheetContent({ loading, errors, onApply, onDismiss }) {
  if (loading) {
    return (
      <div className="tool-sheet-content">
        <div className="spell-loading">
          <SpinnerIcon />
          맞춤법 검사 진행 중입니다
        </div>
      </div>
    )
  }
  const realErrors = errors.filter(e => e.original !== e.correction)
  return (
    <div className="tool-sheet-content">
      {realErrors.length === 0 ? (
        <div className="spell-no-error">
          <span>맞춤법 오류가 없습니다 ✓</span>
        </div>
      ) : (
        <div className="spell-error-list">
          {realErrors.map((err, i) => (
            <div key={i} className="spell-error-item">
              <div className="spell-error-header">
                <span className="spell-error-original">{err.original}</span>
                <span className="spell-error-arrow">→</span>
                <span className="spell-error-correction">{err.correction}</span>
              </div>
              {err.note && <div className="spell-error-note">{err.note}</div>}
              <div className="spell-error-btns">
                <button className="spell-btn spell-btn--keep tap" onClick={() => onDismiss(err)}>유지</button>
                <button className="spell-btn spell-btn--apply tap" onClick={() => onApply(err)}>수정 적용</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 텍스트 검색 시트 (작성된 서류 내 검색) ──────────────────────────────────
function SearchSheet({ appAnswers }) {
  const [query,       setQuery]       = useState('')
  const [previewData, setPreviewData] = useState(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    const matches = []
    ALL_APPLICATIONS.forEach(app => {
      const companyMatch = app.company.toLowerCase().includes(q)
      const answers = appAnswers[app.id] || []
      answers.forEach((ans, qIdx) => {
        if (!ans) return
        const ansMatch = ans.toLowerCase().includes(q)
        if (!companyMatch && !ansMatch) return
        let snippet
        if (ansMatch) {
          const idx = ans.toLowerCase().indexOf(q)
          const s = Math.max(0, idx - 25)
          const e = Math.min(ans.length, idx + q.length + 55)
          snippet = (s > 0 ? '…' : '') + ans.slice(s, e) + (e < ans.length ? '…' : '')
        } else {
          snippet = ans.slice(0, 80) + (ans.length > 80 ? '…' : '')
        }
        matches.push({ app, qIdx, snippet, answer: ans })
      })
    })
    return matches
  }, [query, appAnswers])

  return (
    <div className="tool-sheet-content">
      <div className="search-input-row">
        <SearchIcon size={15} color="#bbb" />
        <input className="search-sheet-input" placeholder="작성된 서류에서 검색"
          value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        {query && <button className="search-clear-btn tap" onClick={() => setQuery('')}><CloseIcon /></button>}
      </div>
      {query.trim() ? (
        results.length === 0
          ? <div className="search-empty">검색 결과가 없습니다</div>
          : <div className="search-result-list">
              {results.map((r, i) => (
                <div key={i} className="search-result-item">
                  <div className="search-result-top">
                    <span className="search-result-company">{r.app.company.split(' ').slice(0,2).join(' ')}</span>
                    <span className="search-result-qnum">Q{r.qIdx + 1}</span>
                  </div>
                  <div className="search-result-snippet">{highlightSnippet(r.snippet, query.trim())}</div>
                  <button className="search-copy-btn tap" onClick={() => setPreviewData(r)}>미리보기</button>
                </div>
              ))}
            </div>
      ) : (
        <div className="search-hint">검색어를 입력하면 작성된 서류가 표시됩니다</div>
      )}

      {previewData && (
        <div className="search-preview-overlay" onClick={() => setPreviewData(null)}>
          <div className="search-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="search-preview-header">
              <span className="search-preview-company">{previewData.app.company.split('[')[0].trim()}</span>
              <button className="tap" onClick={() => setPreviewData(null)}><CloseIcon /></button>
            </div>
            <div className="search-preview-qtag">Q{previewData.qIdx + 1} · {MOCK_QUESTIONS[previewData.qIdx]?.text.slice(0, 40)}…</div>
            <div className="search-preview-text">{previewData.answer}</div>
            <div className="search-preview-hint">텍스트를 길게 눌러 원하는 부분을 복사하세요</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 어노테이션 목록 시트 ─────────────────────────────────────────────────────
function AnnotateSheetContent({ annotations, onDelete }) {
  if (!annotations.length) {
    return <div className="tool-sheet-content"><div className="search-hint">주석이 없습니다</div></div>
  }
  return (
    <div className="tool-sheet-content">
      <div className="annotate-list">
        {annotations.map(ann => (
          <div key={ann.id} className="annotate-item">
            <div className="annotate-color-dot" style={{ background: ann.color }} />
            <div className="annotate-body">
              <div className="annotate-quoted">"{ann.text?.slice(0, 36)}{ann.text?.length > 36 ? '…' : ''}"</div>
              {ann.memo && <div className="annotate-memo-text">{ann.memo}</div>}
            </div>
            <button className="annotate-del tap" onClick={() => onDelete(ann.id)}><CloseIcon /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 어노테이션 오버레이 텍스트 영역 ─────────────────────────────────────────
function AnnotatedTextArea({ value, onChange, onMouseUp, annotations, className, placeholder, autoFocus, innerRef }) {
  const overlayRef = useRef(null)
  const hasAnns    = (annotations || []).length > 0

  const handleScroll = (e) => {
    if (overlayRef.current) overlayRef.current.scrollTop = e.target.scrollTop
  }

  const segments = useMemo(() => buildAnnotatedSegments(value || '', annotations || []), [value, annotations])

  return (
    <div className="annotated-wrapper">
      {hasAnns && (
        <div ref={overlayRef} className="annotation-overlay" aria-hidden="true">
          {segments.map((seg, i) =>
            seg.annotation
              ? <mark key={i} style={{ backgroundColor: seg.annotation.color + '66' }}>{seg.text}</mark>
              : <span key={i}>{seg.text}</span>
          )}
        </div>
      )}
      <textarea
        ref={innerRef}
        className={className}
        value={value}
        onChange={onChange}
        onMouseUp={onMouseUp}
        onScroll={handleScroll}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={hasAnns ? { background: 'transparent' } : {}}
      />
    </div>
  )
}

// ─── 텍스트 선택 플로팅 툴바 ─────────────────────────────────────────────────
function SelectionToolbar({ mouseX, mouseY, onAction }) {
  const [mode, setMode] = useState('main') // 'main' | 'colors' | 'memo'
  const [memoText, setMemoText] = useState('')

  const toolbarWidth = mode === 'colors' ? 230 : mode === 'memo' ? 230 : 240
  const rawLeft = mouseX - toolbarWidth / 2
  const left    = Math.max(8, Math.min(rawLeft, (window.innerWidth || 430) - toolbarWidth - 8))
  const top     = Math.max(60, mouseY - 54)

  return (
    <div className="sel-toolbar" style={{ left, top }} onMouseDown={e => e.preventDefault()}>
      {mode === 'main' && (
        <div className="sel-toolbar__row">
          <button className="sel-tb-btn tap" onClick={() => setMode('memo')}>메모</button>
          <span className="sel-tb-sep" />
          <button className="sel-tb-btn sel-tb-btn--hl tap" onClick={() => setMode('colors')}>A</button>
          <span className="sel-tb-sep" />
          <button className="sel-tb-btn sel-tb-btn--bold tap" onClick={() => onAction('bold')}>B</button>
          <span className="sel-tb-sep" />
          <button className="sel-tb-btn sel-tb-btn--italic tap" onClick={() => onAction('italic')}>I</button>
          <span className="sel-tb-sep" />
          <button className="sel-tb-btn tap" onClick={() => onAction('copy')}>복사</button>
        </div>
      )}
      {mode === 'colors' && (
        <div className="sel-toolbar__colors">
          <button className="sel-back-btn tap" onClick={() => setMode('main')}>‹</button>
          {HIGHLIGHT_COLORS.map(c => (
            <button key={c} className="sel-color-dot tap" style={{ background: c }}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onAction('highlight', c); setMode('main') }} />
          ))}
        </div>
      )}
      {mode === 'memo' && (
        <div className="sel-toolbar__memo">
          <button className="sel-back-btn tap" onClick={() => setMode('main')}>‹</button>
          <input className="sel-memo-input" placeholder="메모 내용…"
            value={memoText} onChange={e => setMemoText(e.target.value)} autoFocus
            onKeyDown={e => e.key === 'Enter' && onAction('memo', memoText)} />
          <button className="sel-memo-save tap" onClick={() => onAction('memo', memoText)}>저장</button>
        </div>
      )}
    </div>
  )
}

// ─── 카테고리 선택 모달 ───────────────────────────────────────────────────────
function CategoryModal({ currentCategory, onSelect, onClose, onAddCategory, onDeleteCategory }) {
  const [selected,   setSelected]   = useState(currentCategory || CATS[0] || '')
  const [editMode,   setEditMode]   = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)

  const handleSelect = (cat) => {
    if (editMode) return
    setSelected(cat)
    setTimeout(() => onSelect(cat), 150)
  }

  const handleDelete = (cat, e) => {
    e.stopPropagation()
    if (selected === cat) setSelected(CATS.filter(c => c !== cat)[0] || '')
    onDeleteCategory(cat)
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
          <div className="modal-title-row">
            <div className="modal-title">카테고리 저장</div>
            <button className="modal-edit-toggle tap" onClick={e => { e.stopPropagation(); setEditMode(v => !v) }}>
              {editMode ? '완료' : '편집'}
            </button>
          </div>
          <div className="modal-categories">
            {CATS.map(cat => {
              const s = BADGE_STYLES[cat] || { color:'#888', bg:'#f0f0f0' }
              const isSel = selected === cat && !editMode
              return (
                <div key={cat} className="modal-cat-row">
                  <button className={`modal-cat-btn tap ${isSel?'modal-cat-btn--selected':''} ${editMode?'modal-cat-btn--dim':''}`}
                    style={{ backgroundColor:s.bg, color:s.color, outline:isSel?`2.5px solid ${s.color}`:'none' }}
                    onClick={() => handleSelect(cat)}>
                    <span className="modal-cat-dot" style={{ backgroundColor:s.color }} />
                    {cat}
                  </button>
                  {editMode && (
                    <button className="modal-cat-del tap" onClick={e => handleDelete(cat, e)}>✕</button>
                  )}
                </div>
              )
            })}
          </div>
          {!editMode && (
            <button className="modal-add-btn tap" onClick={e => { e.stopPropagation(); setShowAddCat(true) }}>
              <AddIcon /> 카테고리 추가
            </button>
          )}
        </div>
      </div>
      {showAddCat && (
        <AddCategoryModal onClose={() => setShowAddCat(false)}
          onAdd={cat => { onAddCategory(cat); setShowAddCat(false) }} />
      )}
    </>
  )
}

// ─── 태그 편집 모달 (이름 + 색상) ───────────────────────────────────────────
function RenameTagModal({ tag, onClose, onRename }) {
  const s = BADGE_STYLES[tag.label] || { color:'#888', bg:'#f0f0f0' }
  const [name,          setName]          = useState(tag.label)
  const [selectedColor, setSelectedColor] = useState(s.color)
  return (
    <div className="modal-overlay" style={{ zIndex:600 }} onClick={onClose}>
      <div className="modal-card add-cat-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">태그 편집</div>
        <div className="add-cat-field">
          <span className="add-cat-label">이름</span>
          <input className="add-cat-input" value={name}
            onChange={e => setName(e.target.value)} autoFocus
            style={{ borderColor: selectedColor }}
            onKeyDown={e => { if (e.key==='Enter' && name.trim()) onRename(name.trim(), selectedColor) }} />
        </div>
        <div className="add-cat-colors">
          <span className="add-cat-label">색상</span>
          <div className="add-cat-color-row">
            {CAT_COLORS.map(c => (
              <button key={c} className="add-cat-color-dot tap"
                style={{ backgroundColor:c, outline:selectedColor===c?`2.5px solid ${c}`:'2.5px solid transparent', outlineOffset:'2px' }}
                onClick={() => setSelectedColor(c)} />
            ))}
          </div>
        </div>
        <div className="add-cat-actions">
          <button className="add-cat-cancel tap" onClick={onClose}>취소</button>
          <button className="add-cat-create tap"
            style={{ background: selectedColor }}
            disabled={!name.trim()}
            onClick={() => { if (name.trim()) onRename(name.trim(), selectedColor) }}>
            변경
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 새 카테고리 추가 모달 ────────────────────────────────────────────────────
function AddCategoryModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#7084fa')

  return (
    <div className="modal-overlay" style={{ zIndex:600 }} onClick={onClose}>
      <div className="modal-card add-cat-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">새 카테고리</div>
        <div className="add-cat-field">
          <span className="add-cat-label">이름</span>
          <input className="add-cat-input" placeholder="팀워크 경험"
            value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="add-cat-colors">
          <span className="add-cat-label">색상</span>
          <div className="add-cat-color-row">
            {CAT_COLORS.map(c => (
              <button key={c} className="add-cat-color-dot tap"
                style={{ backgroundColor:c, outline:selectedColor===c?`2.5px solid ${c}`:'2.5px solid transparent', outlineOffset:'2px' }}
                onClick={() => setSelectedColor(c)} />
            ))}
          </div>
        </div>
        <div className="add-cat-actions">
          <button className="add-cat-cancel tap" onClick={onClose}>취소</button>
          <button className="add-cat-create tap" disabled={!name.trim()}
            onClick={() => { if (name.trim()) onAdd({ label:name.trim(), color:selectedColor, bg:lightenColor(selectedColor) }) }}>
            만들기
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 라이브러리 편집 화면 ─────────────────────────────────────────────────────
function EditView({ item, onClose, onGoToDocs, onSave, onAddCategory, onDeleteCategory, libraryItems, appAnswers }) {
  const [title,       setTitle]       = useState(item?.title   ?? '')
  const [content,     setContent]     = useState(item?.content ?? '')
  const [showModal,   setShowModal]   = useState(false)
  const [history,     setHistory]     = useState([item?.content ?? ''])
  const [histIdx,     setHistIdx]     = useState(0)

  // 라이브러리 시트
  const [showLibSheet,   setShowLibSheet]   = useState(false)
  const [insertedIds,    setInsertedIds]    = useState(new Set())
  const [proposalBlocks, setProposalBlocks] = useState([])
  const [previewItem,    setPreviewItem]    = useState(null)

  // 툴 시트 상태
  const [activeSheet,       setActiveSheet]       = useState(null)
  const [selectedSentences, setSelectedSentences] = useState([])
  const [aiInput,           setAiInput]           = useState('')
  const [aiLoading,         setAiLoading]         = useState(false)
  const [spellLoading,      setSpellLoading]      = useState(false)
  const [spellErrors,       setSpellErrors]       = useState([])

  // 어노테이션 (하이라이트 + 메모)
  const [annotations, setAnnotations] = useState([])

  // 텍스트 선택 툴바
  const [selectionInfo, setSelectionInfo] = useState(null)
  const [selMouseX,     setSelMouseX]     = useState(0)
  const [selMouseY,     setSelMouseY]     = useState(0)
  const [toast,         setToast]         = useState(null)
  const textareaRef = useRef(null)

  const pushHistory = v => { const n=[...history.slice(0,histIdx+1),v]; setHistory(n); setHistIdx(n.length-1) }
  const handleUndo = () => { if(histIdx<=0)return; const i=histIdx-1; setHistIdx(i); setContent(history[i]) }
  const handleRedo = () => { if(histIdx>=history.length-1)return; const i=histIdx+1; setHistIdx(i); setContent(history[i]) }

  const toggleSheet = (name) => {
    if (name === 'spell') {
      setActiveSheet('spell'); setSpellLoading(true); setSpellErrors([])
      fetch('/api/spell-check', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:content}) })
        .then(r => r.json())
        .then(d => { setSpellErrors(d.errors||[]); setSpellLoading(false) })
        .catch(() => { setSpellErrors(getMockSpellErrors(content)); setSpellLoading(false) })
    } else {
      setActiveSheet(prev => prev === name ? null : name)
      if (name !== 'ai') setSelectedSentences([])
    }
    setSelectionInfo(null)
  }

  const handleInsert = (libItem) => {
    if (insertedIds.has(libItem.id)) return
    setProposalBlocks(prev => [...prev, { id:Date.now(), content:libItem.content, itemId:libItem.id }])
    setInsertedIds(prev => new Set([...prev, libItem.id]))
  }
  const handleAccept = (blockId) => {
    const block = proposalBlocks.find(b => b.id===blockId)
    if (block) { const nc = content ? content+'\n\n'+block.content : block.content; setContent(nc); pushHistory(nc) }
    setProposalBlocks(prev => prev.filter(b => b.id!==blockId))
  }
  const handleReject = (blockId) => {
    const block = proposalBlocks.find(b => b.id===blockId)
    if (block) setInsertedIds(prev => { const n=new Set(prev); n.delete(block.itemId); return n })
    setProposalBlocks(prev => prev.filter(b => b.id!==blockId))
  }

  const handleAIApply = async (action) => {
    if (!selectedSentences.length) return
    setAiLoading(true)
    try {
      const resp = await fetch('/api/ai-assist', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sentences: selectedSentences, action })
      })
      const data = await resp.json()
      if (data.result) {
        const first = selectedSentences[0], last = selectedSentences[selectedSentences.length-1]
        const si = content.indexOf(first), ei = content.lastIndexOf(last) + last.length
        if (si >= 0 && ei > si) {
          const nc = content.slice(0, si) + data.result + content.slice(ei)
          setContent(nc); pushHistory(nc)
        }
      } else {
        showToast(data.error || 'AI 오류')
      }
    } catch { showToast('서버 연결 실패') }
    setAiLoading(false); setSelectedSentences([]); setActiveSheet(null)
  }

  const handleSpellApply   = (err) => {
    setContent(c => { const n=c.replace(err.original, err.correction); pushHistory(n); return n })
    setSpellErrors(prev => prev.filter(e => e !== err))
  }
  const handleSpellDismiss = (err) => setSpellErrors(prev => prev.filter(e => e !== err))

  // 텍스트 선택 툴바
  const handleTextMouseUp = (e) => {
    const mx = e.clientX, my = e.clientY
    requestAnimationFrame(() => {
      const ta = textareaRef.current; if (!ta) return
      const start = ta.selectionStart, end = ta.selectionEnd
      if (start >= end) { setSelectionInfo(null); return }
      setSelMouseX(mx); setSelMouseY(my)
      setSelectionInfo({ text: ta.value.substring(start, end), start, end })
    })
  }
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }
  const replaceSelection = (replacement) => {
    if (!selectionInfo) return
    const { start, end } = selectionInfo
    const nc = content.slice(0, start) + replacement + content.slice(end)
    setContent(nc); pushHistory(nc); setSelectionInfo(null)
  }
  const handleSelectionAction = (action, value) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(selectionInfo?.text||'').catch(()=>{})
        setSelectionInfo(null); break
      case 'bold':      replaceSelection(`**${selectionInfo.text}**`); break
      case 'italic':    replaceSelection(`*${selectionInfo.text}*`); break
      case 'highlight':
        setAnnotations(prev => [...prev, { id:Date.now(), text:selectionInfo.text, color:value, memo:null }])
        setSelectionInfo(null); break
      case 'memo':
        setAnnotations(prev => [...prev, { id:Date.now(), text:selectionInfo.text, color:'#ffd04a', memo:value||'' }])
        if (value?.trim()) showToast('메모 저장됨')
        setSelectionInfo(null); break
    }
  }

  const extraButtons = (
    <>
      <div className="edit-tool-sep" />
      <button className="edit-tool-btn tap" style={{ opacity:histIdx<=0?.35:1 }} onClick={handleUndo}><UndoIcon /></button>
      <button className="edit-tool-btn tap" style={{ opacity:histIdx>=history.length-1?.35:1 }} onClick={handleRedo}><RedoIcon /></button>
    </>
  )

  return (
    <div className="app edit-app">
      <div className="lib-view-header">
        <button className="lib-view-tab tap" onClick={onGoToDocs}>작성한 서류</button>
        <button className="lib-view-tab lib-view-tab--active">라이브러리</button>
      </div>
      <div className="edit-toolbar">
        <button className="edit-close tap" onClick={onClose}><CloseIcon /></button>
        <input className="edit-title-input" placeholder="문항 제목을 입력하세요."
          value={title} onChange={e => setTitle(e.target.value)} />
        <button className="edit-save-btn tap" onClick={() => setShowModal(true)}>저장</button>
      </div>

      {/* 제안 블록 */}
      {proposalBlocks.length > 0 && (
        <div className="doc-proposals">
          {proposalBlocks.map(block => (
            <div key={block.id} className="proposal-block">
              <div className="proposal-handle">⋮⋮</div>
              <div className="proposal-content">{block.content}</div>
              <button className="proposal-accept tap" onClick={() => handleAccept(block.id)}>✓</button>
              <button className="proposal-reject tap" onClick={() => handleReject(block.id)}>✗</button>
            </div>
          ))}
        </div>
      )}

      {/* 본문 영역 */}
      {activeSheet === 'ai' ? (
        <SentenceSelectView text={content} selectedSentences={selectedSentences}
          onToggle={s => setSelectedSentences(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])} />
      ) : activeSheet === 'spell' ? (
        <HighlightedText text={content} errors={spellErrors} />
      ) : (
        <AnnotatedTextArea innerRef={textareaRef} className="edit-textarea" value={content}
          onChange={e => { setContent(e.target.value); pushHistory(e.target.value) }}
          onMouseUp={handleTextMouseUp} annotations={annotations}
          placeholder="내용을 입력하세요." autoFocus />
      )}

      {/* 하단 툴바 / 바텀시트 */}
      {activeSheet ? (
        <div className="tool-sheet">
          <div className="tool-sheet-handle" />
          <ToolSheetBar activeSheet={activeSheet} onSheetChange={toggleSheet}
            onLibrary={() => { setActiveSheet(null); setShowLibSheet(true) }}
            extraButtons={extraButtons} onClose={() => setActiveSheet(null)} />
          {activeSheet === 'ai' && (
            <AISheetContent selectedSentences={selectedSentences} aiInput={aiInput}
              setAiInput={setAiInput} onApply={handleAIApply} loading={aiLoading} />
          )}
          {activeSheet === 'spell' && (
            <SpellSheetContent loading={spellLoading} errors={spellErrors}
              onApply={handleSpellApply} onDismiss={handleSpellDismiss} />
          )}
          {activeSheet === 'search'   && <SearchSheet appAnswers={appAnswers||{}} />}
          {activeSheet === 'annotate' && <AnnotateSheetContent annotations={annotations} onDelete={id => setAnnotations(p=>p.filter(a=>a.id!==id))} />}
        </div>
      ) : (
        <div className="edit-bottom-bar">
          <button className="edit-tool-btn tap" onClick={() => setShowLibSheet(true)}><BookIcon size={22} color="#757575" /></button>
          <button className="edit-tool-btn tap" onClick={() => toggleSheet('ai')}><WandIcon /></button>
          <button className="edit-tool-btn tap" onClick={() => toggleSheet('spell')}><SpellcheckIcon /></button>
          <button className="edit-tool-btn tap" onClick={() => toggleSheet('search')}><SearchIcon size={22} color="#757575" /></button>
          {annotations.length > 0 && <button className="edit-tool-btn tap" onClick={() => toggleSheet('annotate')}><NotesIcon color="#ff6813" /></button>}
          <div className="edit-tool-sep" />
          <button className="edit-tool-btn tap" style={{ opacity:histIdx<=0?.35:1 }} onClick={handleUndo}><UndoIcon /></button>
          <button className="edit-tool-btn tap" style={{ opacity:histIdx>=history.length-1?.35:1 }} onClick={handleRedo}><RedoIcon /></button>
        </div>
      )}

      {showLibSheet && (
        <LibraryBottomSheet libraryItems={libraryItems||[]} insertedIds={insertedIds}
          onInsert={handleInsert} onPreview={setPreviewItem} onClose={() => setShowLibSheet(false)} />
      )}
      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      {showModal && (
        <CategoryModal currentCategory={item?.category}
          onSelect={cat => onSave({ id:item?.id??Date.now(), category:cat, title:title.trim()||'제목 없음', content })}
          onClose={() => setShowModal(false)}
          onAddCategory={onAddCategory} onDeleteCategory={onDeleteCategory} />
      )}
      {selectionInfo && (
        <SelectionToolbar mouseX={selMouseX} mouseY={selMouseY}
          onAction={handleSelectionAction} onClose={() => setSelectionInfo(null)} />
      )}
      {toast && <div className="app-toast">{toast}</div>}
    </div>
  )
}

// ─── 라이브러리 항목 미리보기 모달 ───────────────────────────────────────────
function PreviewModal({ item, onClose }) {
  const s = BADGE_STYLES[item.category] || { color:'#888', bg:'#f0f0f0' }
  return (
    <div className="modal-overlay" style={{ zIndex:700 }} onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-modal__header">
          <span className="lib-badge" style={{ color:s.color, backgroundColor:s.bg }}>
            <span className="lib-badge__dot" style={{ backgroundColor:s.color }} />{item.category}
          </span>
          <button className="preview-modal__close tap" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="preview-modal__title">{item.title}</div>
        <div className="preview-modal__content">{item.content}</div>
      </div>
    </div>
  )
}

// ─── 라이브러리 바텀시트 ──────────────────────────────────────────────────────
function LibraryBottomSheet({ libraryItems, insertedIds, onInsert, onPreview, onClose }) {
  const [filter, setFilter] = useState(0)
  const libFilters = getLibFilters(libraryItems)

  const filteredItems = useMemo(() =>
    filter===0 ? libraryItems : libraryItems.filter(i => i.category===libFilters[filter]?.label),
    [filter, libraryItems]
  )

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="lib-sheet">
        <div className="lib-sheet-handle" />
        <div className="lib-sheet-filters">
          {libFilters.map((f,i) => (
            <button key={f.label} className={`lib-chip tap ${filter===i?'lib-chip--active':''}`} onClick={() => setFilter(i)}>
              {f.label}&nbsp;&nbsp;{f.count}
            </button>
          ))}
        </div>
        <div className="lib-sheet-grid">
          {filteredItems.map(item => {
            const s = BADGE_STYLES[item.category] || { color:'#888', bg:'#f0f0f0' }
            const isInserted = insertedIds.has(item.id)
            return (
              <div key={item.id} className={`lib-card tap-card ${isInserted?'lib-card--inserted':''}`}
                onClick={() => onInsert(item)}>
                <div className="lib-card__top">
                  <span className="lib-badge" style={{ color:s.color, backgroundColor:s.bg }}>
                    <span className="lib-badge__dot" style={{ backgroundColor:s.color }} />{item.category}
                  </span>
                  <button className="preview-btn tap" onClick={e => { e.stopPropagation(); onPreview(item) }}>
                    <SearchIcon size={14} color="#aaaaaa" />
                  </button>
                </div>
                <div className={`lib-card__title ${isInserted?'lib-card__title--inserted':''}`}>{item.title}</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── 서류 상세 편집 화면 ──────────────────────────────────────────────────────
function DocDetailView({ app, onBack, onGoToLibrary, libraryItems, answers, onAnswersChange, appAnswers }) {
  const [currentQ,       setCurrentQ]       = useState(0)
  const [showLibSheet,   setShowLibSheet]   = useState(false)
  const [insertedIds,    setInsertedIds]    = useState(new Set())
  const [proposalBlocks, setProposalBlocks] = useState([])
  const [previewItem,    setPreviewItem]    = useState(null)

  // 툴 시트 상태
  const [activeSheet,       setActiveSheet]       = useState(null)
  const [selectedSentences, setSelectedSentences] = useState([])
  const [aiInput,           setAiInput]           = useState('')
  const [aiLoading,         setAiLoading]         = useState(false)
  const [spellLoading,      setSpellLoading]      = useState(false)
  const [spellErrors,       setSpellErrors]       = useState([])

  // 어노테이션 (하이라이트 + 메모)
  const [annotations, setAnnotations] = useState([])

  // 되돌리기 / 다시하기
  const [qHistory, setQHistory] = useState([answers[0] || ''])
  const [qHistIdx, setQHistIdx] = useState(0)

  // 텍스트 선택 툴바
  const [selectionInfo, setSelectionInfo] = useState(null)
  const [selMouseX,     setSelMouseX]     = useState(0)
  const [selMouseY,     setSelMouseY]     = useState(0)
  const [toast,         setToast]         = useState(null)
  const textareaRef = useRef(null)

  const question  = MOCK_QUESTIONS[currentQ]
  const ans       = answers[currentQ] || ''
  const charCount = ans.length
  const progress  = Math.min(charCount / question.maxChars, 1)

  // 문항 전환 시 히스토리 초기화
  useEffect(() => {
    setQHistory([answers[currentQ] || ''])
    setQHistIdx(0)
    setSelectedSentences([])
    setAnnotations([])
  }, [currentQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const pushHistory = (val) => {
    const n = [...qHistory.slice(0, qHistIdx + 1), val]
    setQHistory(n); setQHistIdx(n.length - 1)
  }
  const handleUndo = () => {
    if (qHistIdx <= 0) return
    const i = qHistIdx - 1; setQHistIdx(i)
    const next = [...answers]; next[currentQ] = qHistory[i]; onAnswersChange(next)
  }
  const handleRedo = () => {
    if (qHistIdx >= qHistory.length - 1) return
    const i = qHistIdx + 1; setQHistIdx(i)
    const next = [...answers]; next[currentQ] = qHistory[i]; onAnswersChange(next)
  }

  const toggleSheet = (name) => {
    if (name === 'spell') {
      setActiveSheet('spell'); setSpellLoading(true); setSpellErrors([])
      fetch('/api/spell-check', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:ans}) })
        .then(r => r.json())
        .then(d => { setSpellErrors(d.errors||[]); setSpellLoading(false) })
        .catch(() => { setSpellErrors(getMockSpellErrors(ans)); setSpellLoading(false) })
    } else {
      setActiveSheet(prev => prev === name ? null : name)
      if (name !== 'ai') setSelectedSentences([])
    }
    setSelectionInfo(null)
  }

  const handleInsert = (item) => {
    if (insertedIds.has(item.id)) return
    setProposalBlocks(prev => [...prev, { id:Date.now(), content:item.content, itemId:item.id }])
    setInsertedIds(prev => new Set([...prev, item.id]))
  }
  const handleAccept = (blockId) => {
    const block = proposalBlocks.find(b => b.id===blockId)
    if (block) {
      const next = [...answers]; next[currentQ] = ans ? ans+'\n\n'+block.content : block.content
      onAnswersChange(next); pushHistory(next[currentQ])
    }
    setProposalBlocks(prev => prev.filter(b => b.id!==blockId))
  }
  const handleReject = (blockId) => {
    const block = proposalBlocks.find(b => b.id===blockId)
    if (block) setInsertedIds(prev => { const n=new Set(prev); n.delete(block.itemId); return n })
    setProposalBlocks(prev => prev.filter(b => b.id!==blockId))
  }

  const handleAIApply = async (action) => {
    if (!selectedSentences.length) return
    setAiLoading(true)
    try {
      const resp = await fetch('/api/ai-assist', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sentences: selectedSentences, action })
      })
      const data = await resp.json()
      if (data.result) {
        const first = selectedSentences[0], last = selectedSentences[selectedSentences.length-1]
        const si = ans.indexOf(first), ei = ans.lastIndexOf(last) + last.length
        if (si >= 0 && ei > si) {
          const newAns = ans.slice(0, si) + data.result + ans.slice(ei)
          const next = [...answers]; next[currentQ] = newAns
          onAnswersChange(next); pushHistory(newAns)
        }
      } else {
        showToast(data.error || 'AI 오류')
      }
    } catch { showToast('서버 연결 실패') }
    setAiLoading(false); setSelectedSentences([]); setActiveSheet(null)
  }

  const handleSpellApply = (err) => {
    const next = [...answers]; next[currentQ] = ans.replace(err.original, err.correction)
    onAnswersChange(next); pushHistory(next[currentQ])
    setSpellErrors(prev => prev.filter(e => e !== err))
  }
  const handleSpellDismiss = (err) => setSpellErrors(prev => prev.filter(e => e !== err))

  // 텍스트 선택 툴바
  const handleTextMouseUp = (e) => {
    const mx = e.clientX, my = e.clientY
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart, end = ta.selectionEnd
      if (start >= end) { setSelectionInfo(null); return }
      setSelMouseX(mx); setSelMouseY(my)
      setSelectionInfo({ text: ta.value.substring(start, end), start, end })
    })
  }
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }
  const replaceSelection = (replacement) => {
    if (!selectionInfo) return
    const { start, end } = selectionInfo
    const newAns = ans.slice(0, start) + replacement + ans.slice(end)
    const next = [...answers]; next[currentQ] = newAns
    onAnswersChange(next); pushHistory(newAns); setSelectionInfo(null)
  }
  const handleSelectionAction = (action, value) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(selectionInfo?.text||'').catch(()=>{})
        setSelectionInfo(null); break
      case 'bold':   replaceSelection(`**${selectionInfo.text}**`); break
      case 'italic': replaceSelection(`*${selectionInfo.text}*`); break
      case 'highlight':
        setAnnotations(prev => [...prev, { id:Date.now(), text:selectionInfo.text, color:value, memo:null }])
        setSelectionInfo(null); break
      case 'memo':
        setAnnotations(prev => [...prev, { id:Date.now(), text:selectionInfo.text, color:'#ffd04a', memo:value||'' }])
        if (value?.trim()) showToast('메모 저장됨')
        setSelectionInfo(null); break
    }
  }

  const extraButtons = (
    <>
      <button className="edit-tool-btn tap" style={{ opacity:qHistIdx<=0?.35:1 }} onClick={handleUndo}><UndoIcon /></button>
      <button className="edit-tool-btn tap" style={{ opacity:qHistIdx>=qHistory.length-1?.35:1 }} onClick={handleRedo}><RedoIcon /></button>
      <div className="edit-tool-sep" />
      <button className="doc-job-btn tap">공고 보기</button>
    </>
  )

  return (
    <div className="app doc-detail-app">
      <div className="lib-view-header">
        <button className="lib-view-tab lib-view-tab--active tap" onClick={onBack}>작성한 서류</button>
        <button className="lib-view-tab tap" onClick={onGoToLibrary}>라이브러리</button>
      </div>

      <div className="edit-toolbar">
        <button className="edit-close tap" onClick={onBack}><CloseIcon /></button>
        <div className="doc-company-name">{app.company}</div>
        <button className="edit-save-btn tap">저장</button>
      </div>

      <div className="doc-question-area">
        <div className="doc-question-text">{question.text}</div>
        <div className="doc-progress-row">
          <div className="doc-progress-bar"><div className="doc-progress-fill" style={{ width:`${progress*100}%` }} /></div>
          <span className="doc-char-count">{charCount}/{question.maxChars}자</span>
        </div>
        <div className="doc-page-dots">
          <button className="doc-arrow tap" onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ===0}>‹</button>
          {MOCK_QUESTIONS.map((_,i) => (
            <button key={i} className={`doc-dot tap ${i===currentQ?'doc-dot--active':''}`} onClick={() => setCurrentQ(i)} />
          ))}
          <button className="doc-arrow tap" onClick={() => setCurrentQ(q => Math.min(MOCK_QUESTIONS.length-1, q+1))} disabled={currentQ===MOCK_QUESTIONS.length-1}>›</button>
        </div>
      </div>

      <div className="doc-divider" />

      {proposalBlocks.length > 0 && (
        <div className="doc-proposals">
          {proposalBlocks.map(block => (
            <div key={block.id} className="proposal-block">
              <div className="proposal-handle">⋮⋮</div>
              <div className="proposal-content">{block.content}</div>
              <button className="proposal-accept tap" onClick={() => handleAccept(block.id)}>✓</button>
              <button className="proposal-reject tap" onClick={() => handleReject(block.id)}>✗</button>
            </div>
          ))}
        </div>
      )}

      {/* 본문 영역 */}
      {activeSheet === 'ai' ? (
        <SentenceSelectView text={ans} selectedSentences={selectedSentences}
          onToggle={s => setSelectedSentences(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])} />
      ) : activeSheet === 'spell' ? (
        <HighlightedText text={ans} errors={spellErrors} />
      ) : (
        <AnnotatedTextArea innerRef={textareaRef} className="doc-textarea" value={ans}
          onChange={e => {
            const val = e.target.value
            const n = [...answers]; n[currentQ] = val; onAnswersChange(n)
            pushHistory(val)
          }}
          onMouseUp={handleTextMouseUp} annotations={annotations}
          placeholder="내용을 입력하세요." />
      )}

      {/* 하단 툴바 / 바텀시트 */}
      {activeSheet ? (
        <div className="tool-sheet">
          <div className="tool-sheet-handle" />
          <ToolSheetBar activeSheet={activeSheet} onSheetChange={toggleSheet}
            onLibrary={() => { setActiveSheet(null); setShowLibSheet(true) }}
            extraButtons={extraButtons} onClose={() => setActiveSheet(null)} />
          {activeSheet === 'ai' && (
            <AISheetContent selectedSentences={selectedSentences} aiInput={aiInput}
              setAiInput={setAiInput} onApply={handleAIApply} loading={aiLoading} />
          )}
          {activeSheet === 'spell' && (
            <SpellSheetContent loading={spellLoading} errors={spellErrors}
              onApply={handleSpellApply} onDismiss={handleSpellDismiss} />
          )}
          {activeSheet === 'search'   && <SearchSheet appAnswers={appAnswers||{}} />}
          {activeSheet === 'annotate' && <AnnotateSheetContent annotations={annotations} onDelete={id => setAnnotations(p=>p.filter(a=>a.id!==id))} />}
        </div>
      ) : (
        <div className="doc-bottom-bar">
          <button className="edit-tool-btn tap" onClick={() => setShowLibSheet(true)}><BookIcon size={22} color="#757575" /></button>
          <button className="edit-tool-btn tap" onClick={() => toggleSheet('ai')}><WandIcon /></button>
          <button className="edit-tool-btn tap" onClick={() => toggleSheet('spell')}><SpellcheckIcon /></button>
          <button className="edit-tool-btn tap" onClick={() => toggleSheet('search')}><SearchIcon size={22} color="#757575" /></button>
          {annotations.length > 0 && <button className="edit-tool-btn tap" onClick={() => toggleSheet('annotate')}><NotesIcon color="#ff6813" /></button>}
          <div className="doc-bar-spacer" />
          <button className="edit-tool-btn tap" style={{ opacity:qHistIdx<=0?.35:1 }} onClick={handleUndo}><UndoIcon /></button>
          <button className="edit-tool-btn tap" style={{ opacity:qHistIdx>=qHistory.length-1?.35:1 }} onClick={handleRedo}><RedoIcon /></button>
          <div className="edit-tool-sep" />
          <button className="doc-job-btn tap">공고 보기</button>
        </div>
      )}

      {showLibSheet && (
        <LibraryBottomSheet libraryItems={libraryItems} insertedIds={insertedIds}
          onInsert={handleInsert} onPreview={setPreviewItem} onClose={() => setShowLibSheet(false)} />
      )}
      {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}

      {selectionInfo && (
        <SelectionToolbar mouseX={selMouseX} mouseY={selMouseY}
          onAction={handleSelectionAction} onClose={() => setSelectionInfo(null)} />
      )}
      {toast && <div className="app-toast">{toast}</div>}
    </div>
  )
}

// ─── 메인 앱 ──────────────────────────────────────────────────────────────────
export default function App() {
  const [catsData, setCatsData] = useState(() => {
    const saved = loadState('ji_catsData', null)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      CATS = saved.map(c => c.label)
      saved.forEach(c => { BADGE_STYLES[c.label] = { color:c.color, bg:c.bg } })
      return saved
    }
    return DEFAULT_CATS
  })

  const [libraryItems, setLibraryItems] = useState(() => loadState('ji_library',  INIT_LIBRARY))
  const [appAnswers,   setAppAnswers]   = useState(() => loadState('ji_answers',  {}))
  const [cardStatuses, setCardStatuses] = useState(() => loadState('ji_statuses', {}))

  const [view,        setView]        = useState('main')
  const [mainTab,     setMainTab]     = useState('docs')
  const [editingItem, setEditingItem] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [activeNav,   setActiveNav]   = useState(2)

  // 작성한 서류 탭 상태
  const [docsStatusFilter, setDocsStatusFilter] = useState(null)
  const [docsSearch,       setDocsSearch]       = useState('')
  const [sortOption,       setSortOption]       = useState('수정일순')
  const [sortOpen,         setSortOpen]         = useState(false)
  const [cardDropdown,     setCardDropdown]     = useState(null)

  // 라이브러리 탭 상태
  const [libFilter,      setLibFilter]      = useState(0)
  const [libSearch,      setLibSearch]      = useState('')
  const [libMenu,        setLibMenu]        = useState(null)
  const [tagItem,        setTagItem]        = useState(null)
  const [libTagEditMode, setLibTagEditMode] = useState(false)
  const [renamingTag,    setRenamingTag]    = useState(null)

  useEffect(() => { saveState('ji_catsData',  catsData)     }, [catsData])
  useEffect(() => { saveState('ji_library',   libraryItems) }, [libraryItems])
  useEffect(() => { saveState('ji_answers',   appAnswers)   }, [appAnswers])
  useEffect(() => { saveState('ji_statuses',  cardStatuses) }, [cardStatuses])

  useEffect(() => {
    const close = () => { setSortOpen(false); setCardDropdown(null); setLibMenu(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const stop = e => e.stopPropagation()

  const handleAddCategory = ({ label, color, bg }) => {
    if (CATS.includes(label)) return
    CATS = [...CATS, label]; BADGE_STYLES[label] = { color, bg }
    setCatsData(prev => [...prev, { label, color, bg }])
  }
  const handleDeleteCategory = (label) => {
    CATS = CATS.filter(c => c !== label)
    setCatsData(prev => prev.filter(c => c.label !== label))
    if (libFilter > 0) setLibFilter(0)
  }

  const handleRenameTag = (oldLabel, newLabel, newColor) => {
    if (!newLabel.trim()) { setRenamingTag(null); return }
    const trimmed = newLabel.trim()
    const oldStyle = BADGE_STYLES[oldLabel] || { color:'#888', bg:'#f0f0f0' }
    const newStyle = newColor ? { color: newColor, bg: lightenColor(newColor) } : oldStyle
    CATS = CATS.map(c => c === oldLabel ? trimmed : c)
    BADGE_STYLES[trimmed] = newStyle
    if (trimmed !== oldLabel) delete BADGE_STYLES[oldLabel]
    setCatsData(prev => prev.map(c => c.label === oldLabel ? { ...c, label: trimmed, color: newStyle.color, bg: newStyle.bg } : c))
    setLibraryItems(prev => prev.map(i => i.category === oldLabel ? { ...i, category: trimmed } : i))
    setRenamingTag(null)
  }

  const goToMain   = (tab = mainTab) => { setMainTab(tab); setView('main') }
  const goToEdit   = (item)          => { setEditingItem(item); setView('edit') }
  const goToNew    = ()              => { setEditingItem(null); setView('edit') }
  const goToDetail = (card)          => { setSelectedApp(card); setView('docDetail') }

  const handleSave = upd => {
    setLibraryItems(prev => {
      const idx = prev.findIndex(i => i.id===upd.id)
      if (idx>=0) { const n=[...prev]; n[idx]=upd; return n }
      return [...prev, upd]
    })
    goToMain('library')
  }

  const handleAnswersChange = next => setAppAnswers(prev => ({ ...prev, [selectedApp.id]: next }))

  const handleLibMenuAction = (opt, item) => {
    setLibMenu(null)
    if (opt==='편집')       goToEdit(item)
    else if (opt==='삭제')  setLibraryItems(p => p.filter(i => i.id!==item.id))
    else if (opt==='복사') {
      const copy = { ...item, id:Date.now(), title:item.title+' (복사)' }
      setLibraryItems(p => { const n=[...p], idx=p.findIndex(i=>i.id===item.id); n.splice(idx+1,0,copy); return n })
    }
    else if (opt==='태그 변경') setTagItem(item)
  }

  const libFiltersMain = getLibFilters(libraryItems)

  const filteredApps = useMemo(() => {
    let apps = ALL_APPLICATIONS
    if (docsStatusFilter) apps = apps.filter(a => (cardStatuses[a.id]??a.originalStatus)===docsStatusFilter)
    if (docsSearch.trim()) apps = apps.filter(a => a.company.includes(docsSearch))
    return apps
  }, [docsStatusFilter, docsSearch, cardStatuses])

  const filteredLib = useMemo(() => {
    let items = libFilter===0 ? libraryItems : libraryItems.filter(i => i.category===libFiltersMain[libFilter]?.label)
    if (libSearch.trim()) items = items.filter(i => i.title.includes(libSearch)||i.content.includes(libSearch))
    return items
  }, [libFilter, libraryItems, libSearch, catsData])

  // ── 라우팅 ──
  if (view==='docDetail' && selectedApp) {
    return (
      <DocDetailView key={selectedApp.id} app={selectedApp}
        onBack={() => goToMain('docs')} onGoToLibrary={() => goToMain('library')}
        libraryItems={libraryItems} appAnswers={appAnswers}
        answers={appAnswers[selectedApp.id]||['','','','']}
        onAnswersChange={handleAnswersChange} />
    )
  }

  if (view==='edit') {
    return (
      <EditView item={editingItem}
        onClose={() => goToMain('library')} onGoToDocs={() => goToMain('docs')}
        onSave={handleSave} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory}
        libraryItems={libraryItems} appAnswers={appAnswers} />
    )
  }

  // ── 메인 화면 ──
  return (
    <div className="app">
      <MainTabHeader activeTab={mainTab} onChange={setMainTab} />

      {mainTab === 'docs' && (
        <>
          <div className="lib-view-search">
            <SearchIcon />
            <input className="lib-view-search__input" placeholder="검색"
              value={docsSearch} onChange={e => setDocsSearch(e.target.value)} />
            <button className="lib-view-add tap"><PlusIcon /></button>
          </div>
          <div className="lib-view-filters">
            <button className={`lib-chip tap ${docsStatusFilter===null?'lib-chip--active':''}`}
              onClick={() => setDocsStatusFilter(null)}>전체&nbsp;&nbsp;{ALL_APPLICATIONS.length}</button>
            {STATUS_TABS.map(tab => {
              const count = ALL_APPLICATIONS.filter(a => (cardStatuses[a.id]??a.originalStatus)===tab).length
              return (
                <button key={tab} className={`lib-chip tap ${docsStatusFilter===tab?'lib-chip--active':''}`}
                  onClick={() => setDocsStatusFilter(tab)}>{tab}&nbsp;&nbsp;{count}</button>
              )
            })}
          </div>
          <section className="section section--gray" style={{ flex:1, overflowY:'auto' }}>
            <div className="sort-row" onClick={stop}>
              <button className="sort-btn tap" onClick={() => setSortOpen(o=>!o)}>
                {sortOption} <ChevronIcon size={14} up={sortOpen} />
              </button>
              {sortOpen && (
                <div className="dropdown">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt} className={`dropdown-item tap ${sortOption===opt?'dropdown-item--active':''}`}
                      onClick={() => { setSortOption(opt); setSortOpen(false) }}>{opt}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="card-list">
              {filteredApps.length === 0
                ? <div className="empty-state">해당 서류가 없습니다.</div>
                : filteredApps.map(card => {
                    const status = cardStatuses[card.id] ?? card.originalStatus
                    const ans = appAnswers[card.id] || []
                    const done = ans.filter(a => a && a.length > 0).length
                    return (
                      <div key={card.id} className="app-card app-card--doc tap-card" onClick={() => goToDetail(card)}>
                        <div className="app-card__left">
                          <div className="app-card__company">{card.company}</div>
                          <div className="app-card__meta">
                            <span className="app-card__deadline">{card.deadline}</span>
                            <span className="app-card__remaining">{card.remaining}</span>
                          </div>
                          <div className="app-card__doc-progress">
                            <div className="app-card__doc-bar">
                              <div className="app-card__doc-fill" style={{ width:`${(done/MOCK_QUESTIONS.length)*100}%` }} />
                            </div>
                            <span className="app-card__doc-count">{done}/{MOCK_QUESTIONS.length} 문항</span>
                          </div>
                        </div>
                        <div className="app-card__divider" />
                        <div className="app-card__status-wrap" onClick={stop}>
                          <button className="app-card__status-btn tap"
                            onClick={() => setCardDropdown(cardDropdown===card.id?null:card.id)}>
                            {status} <ChevronIcon size={10} up={cardDropdown===card.id} />
                          </button>
                          {cardDropdown === card.id && (
                            <div className="dropdown dropdown--right">
                              {STATUS_TABS.map(s => (
                                <button key={s} className={`dropdown-item tap ${status===s?'dropdown-item--active':''}`}
                                  onClick={() => { setCardStatuses(p=>({...p,[card.id]:s})); setCardDropdown(null) }}>{s}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
              }
            </div>
          </section>
        </>
      )}

      {mainTab === 'library' && (
        <>
          <div className="lib-view-search">
            <SearchIcon />
            <input className="lib-view-search__input" placeholder="검색"
              value={libSearch} onChange={e => setLibSearch(e.target.value)} />
            <button className="lib-view-add tap" onClick={goToNew}><PlusIcon /></button>
          </div>
          <div className="lib-view-filters-row">
            <div className="lib-view-filters">
              {libFiltersMain.map((f,i) => (
                <div key={f.label} className="lib-chip-wrap">
                  <button
                    className={`lib-chip ${libTagEditMode && i>0 ? 'lib-chip--edit-mode' : 'tap'} ${libFilter===i?'lib-chip--active':''}`}
                    onClick={() => {
                      if (libTagEditMode && i > 0) setRenamingTag(f)
                      else setLibFilter(i)
                    }}>
                    {f.label}&nbsp;&nbsp;{f.count}
                  </button>
                  {libTagEditMode && i > 0 && (
                    <button className="lib-chip-x tap" onClick={e => { e.stopPropagation(); handleDeleteCategory(f.label) }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="lib-tag-edit-toggle tap" onClick={() => setLibTagEditMode(v => !v)}>
              {libTagEditMode ? '완료' : '편집'}
            </button>
          </div>
          <section className="section section--gray" style={{ flex:1, overflowY:'auto' }}>
            <div className="lib-grid">
              {filteredLib.length === 0
                ? <div className="empty-state" style={{ gridColumn:'1/-1' }}>항목이 없습니다.</div>
                : filteredLib.map(item => {
                    const badge = BADGE_STYLES[item.category] || {}
                    return (
                      <div key={item.id} className="lib-card tap-card" onClick={() => goToEdit(item)}>
                        <div className="lib-card__top">
                          <span className="lib-badge" style={{ color:badge.color, backgroundColor:badge.bg }}>
                            <span className="lib-badge__dot" style={{ backgroundColor:badge.color }} />{item.category}
                          </span>
                          <div className="lib-card__more" onClick={stop}>
                            <button className="more-btn tap" onClick={() => setLibMenu(libMenu===item.id?null:item.id)}><MoreVertIcon /></button>
                            {libMenu === item.id && (
                              <div className="dropdown dropdown--right">
                                {['편집','삭제','복사','태그 변경'].map(opt => (
                                  <button key={opt} className={`dropdown-item tap ${opt==='삭제'?'dropdown-item--danger':''}`}
                                    onClick={() => handleLibMenuAction(opt, item)}>{opt}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="lib-card__title">{item.title}</div>
                      </div>
                    )
                  })
              }
            </div>
          </section>
        </>
      )}

      <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />

      {tagItem && (
        <CategoryModal currentCategory={tagItem.category}
          onSelect={cat => { setLibraryItems(p=>p.map(i=>i.id===tagItem.id?{...i,category:cat}:i)); setTagItem(null) }}
          onClose={() => setTagItem(null)}
          onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />
      )}
      {renamingTag && (
        <RenameTagModal tag={renamingTag} onClose={() => setRenamingTag(null)}
          onRename={(newLabel, newColor) => handleRenameTag(renamingTag.label, newLabel, newColor)} />
      )}
    </div>
  )
}
