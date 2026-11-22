// 词表质检：地区用词、标点、机器味、空值、长度异常。只报告，不改写。
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dictDir = path.join(root, 'dict')

const TRADITIONAL = ['設定', '登入', '檔案', '程式', '專案', '伺服器', '網路', '預設', '檢視', '執行', '連線', '資訊', '軟體', '硬體', '使用者', '瀏覽', '儲存', '選單', '視窗', '滑鼠', '剪貼', '範本', '最佳化', '啟動', '關閉', '開啟', '上傳', '下載', '搜尋', '篩選']
// 术语口径（与 docs/style-guide.md 对齐）：禁用词 → 正确说法。
// english 限定「原文确实是这个词」；keep 是豁免条件，按英文原文判断（译文里的中文词判断不了语境）。
const BANNED_TERMS = [
  { banned: '账户', correct: '账号', english: /account/i, keep: (key) => /balance|billing|credit|invoice/i.test(key) },
  {
    banned: '聊天',
    correct: '对话',
    english: /chat/i,
    // 产品名里的 chat 指具体产品，保留原词
    keep: (key) => /Teams|Discord|WeChat|Slack|WhatsApp|Telegram/i.test(key),
  },
  {
    banned: '暂存',
    correct: '预发布',
    english: /staging/i,
    // staging 环境才要求「预发布」；Git 的 stage/staged 用「暂存」是正确的
    keep: (key) => /stage|git|commit|index|branch|diff/i.test(key),
  },
]
const MACHINE = ['将会', '对于', '使得', '的的', '通过…来', '被…', '进行了', '一个的', '分叉']
const issues = []

for (const file of fs.readdirSync(dictDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(dictDir, file), 'utf8'))
  for (const [key, value] of Object.entries(data)) {
    if (key === '$meta') continue
    const add = (kind, detail) => issues.push({ file, kind, key, value, detail })
    if (typeof value !== 'string' || !value.trim()) add('空译文', '')
    if (value === key) add('译文与原文相同', '')
    for (const word of TRADITIONAL) if (value.includes(word)) add('繁体/地区词', word)
    for (const word of MACHINE) if (value.includes(word)) add('机器味', word)
    if (/[\u4e00-\u9fff][,;:!?]/.test(value)) add('半角标点', '汉字后紧跟半角标点')
    if (/[,;:!?][\u4e00-\u9fff]/.test(value)) add('半角标点', '半角标点后紧跟汉字')
    if (/[\u4e00-\u9fff]\s+[\u4e00-\u9fff]/.test(value)) add('汉字间空格', '')
    if (value.length <= 6 && /。$/.test(value) && !/[.!?…]$/.test(key)) add('短标签带句号', '')
    if (value.length > 2.4 * Math.max(key.length, 6) && value.length > 14) add('长度异常', `${key.length} → ${value.length}`)
    if (/[。]{2,}/.test(value)) add('重复句号', '')
    if ((value.match(/的/g) || []).length >= 3) add('的太多（直译腔）', '')
    // 「进行中」是「In progress」的正常标签，不是翻译腔的「进行+X」结构。
    if (/^(请)?(进行|对.{0,6}进行)/.test(value) && !/^进行中$/.test(value)) add('机器味起步', '')
    for (const term of BANNED_TERMS) {
      if (!value.includes(term.banned)) continue
      if (!term.english.test(key)) continue
      if (term.keep && term.keep(key)) continue
      add('术语不符', `${term.banned} → ${term.correct}`)
    }
    if (/[一-鿿]{2,}的[一-鿿]{2,}的[一-鿿]{2,}/.test(value)) add('名词堆叠', '')
    if (/^(可以|你可以|您)/.test(value)) add('称呼/语气', '')
    // 原文键以空格结尾说明这是拼接片段（"Connect your " + 名字），译文以「的」收尾是对的。
    const fragment = /\s$/.test(key)
    if (!fragment && value.length <= 10 && /的$/.test(value) && !/[。？]$/.test(value) && !/^(我的|你的|他的|她的|它的|共享给我的)/.test(value)) add('短标签悬空', '')
    if (/\.\.\./.test(value)) add('省略号写法', '')
    if (/[一-鿿]\?/.test(value)) add('半角问号', '')
    // 只查半角直引号贴着汉字的情况；弯引号 “” 是好排版，不该报。
    if (/[一-鿿]["']|["'][一-鿿]/.test(value)) add('半角引号', '')
  }
}

const byKind = {}
for (const issue of issues) (byKind[issue.kind] ||= []).push(issue)
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n== ${kind} (${list.length})`)
  for (const issue of list.slice(0, 30)) console.log(`  ${issue.file}\t${JSON.stringify(issue.key)} => ${JSON.stringify(issue.value)}\t${issue.detail}`)
  if (list.length > 30) console.log(`  … 另有 ${list.length - 30} 条`)
}
console.log(`\n合计问题 ${issues.length} 条`)
if (issues.length) process.exitCode = 1
