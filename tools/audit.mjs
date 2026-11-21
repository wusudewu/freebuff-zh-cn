// 词表质检：地区用词、标点、机器味、空值、长度异常。只报告，不改写。
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dictDir = path.join(root, 'dict')

const TRADITIONAL = ['設定', '登入', '檔案', '程式', '專案', '伺服器', '網路', '預設', '檢視', '執行', '連線', '資訊', '軟體', '硬體', '使用者', '瀏覽', '儲存', '選單', '視窗', '滑鼠', '剪貼', '範本', '最佳化', '啟動', '關閉', '開啟', '上傳', '下載', '搜尋', '篩選']
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
    if (/^(请)?(进行|对.{0,6}进行)/.test(value)) add('机器味起步', '')
    if (/[一-鿿]{2,}的[一-鿿]{2,}的[一-鿿]{2,}/.test(value)) add('名词堆叠', '')
    if (/^(可以|你可以|您)/.test(value)) add('称呼/语气', '')
    if (value.length <= 10 && /的$/.test(value) && !/[。？]$/.test(value) && !/^(我的|你的|他的|她的|它的|共享给我的)/.test(value)) add('短标签悬空', '')
    if (/\.\.\./.test(value)) add('省略号写法', '')
    if (/[一-鿿]\?/.test(value)) add('半角问号', '')
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
