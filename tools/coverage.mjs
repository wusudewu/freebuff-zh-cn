// 覆盖率报告：把调试探针写出的每次界面快照汇总，导出仍未被翻译的界面英文串。
// 用法：node tools/coverage.mjs [--export out.json] [--log <path>]
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const exportIndex = args.indexOf('--export')
const exportPath = exportIndex >= 0 ? args[exportIndex + 1] : null
const logIndex = args.indexOf('--log')
const logPath = logIndex >= 0 ? args[logIndex + 1] : path.join(process.env.LOCALAPPDATA || '', 'FreebuffZh', 'debug.log')

if (!fs.existsSync(logPath)) {
  console.log(`没有找到调试日志：${logPath}`)
  console.log('先创建调试开关（空文件即可）："%LOCALAPPDATA%\\FreebuffZh\\debug"，再打开 Freebuff 走一遍各个界面。')
  process.exit(0)
}

const dumps = []
for (const line of fs.readFileSync(logPath, 'utf8').split('\n')) {
  const match = line.match(/ dump (\S+) (\{.*\})\s*$/)
  if (!match) continue
  try {
    dumps.push({ href: match[1], ...JSON.parse(match[2]) })
  } catch (error) {}
}

if (!dumps.length) {
  console.log('日志里还没有界面快照。让 Freebuff 开着走一遍界面再来。')
  process.exit(0)
}

const misses = new Map()
let applied = 0
for (const dump of dumps) {
  applied = Math.max(applied, dump.applied || 0)
  for (const text of dump.misses || []) misses.set(text, (misses.get(text) || 0) + 1)
}

const byHref = new Map()
for (const dump of dumps) {
  const prev = byHref.get(dump.href) || { applied: 0, misses: 0, at: '' }
  byHref.set(dump.href, { applied: Math.max(prev.applied, dump.applied || 0), misses: Math.max(prev.misses, (dump.misses || []).length), at: dump.at || '' })
}

console.log('界面快照：', dumps.length, '次；已翻译（最多一次）：', applied, '条；未命中（去重）：', misses.size, '条')
console.log('')
console.log('按页面：')
for (const [href, stat] of byHref) {
  const total = stat.applied + stat.misses
  const ratio = total ? ((stat.applied / total) * 100).toFixed(1) : '0.0'
  console.log(`  ${ratio}%  已翻译 ${stat.applied} / 未命中 ${stat.misses}  ${href}`)
}

const open = [...misses.keys()].filter((text) => !/^[\x20-\x7e]+$/.test(text) || /[A-Za-z]{3,}/.test(text))
console.log('')
console.log('待翻译（前 80 条，按出现次数排序）：')
for (const [text, count] of [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80)) console.log(`  ${String(count).padStart(3)}  ${text}`)

if (exportPath) {
  fs.writeFileSync(path.resolve(root, exportPath), JSON.stringify(open.sort(), null, 1))
  console.log(`\n已导出 ${open.length} 条到 ${exportPath}`)
}
