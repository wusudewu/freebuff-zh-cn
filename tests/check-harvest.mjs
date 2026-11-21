// 巡检差集：把 harvest.json 里抓到的每条界面文本丢给补丁的 translate()，列出还没被翻译的。
// 用法：node tools/check-harvest.mjs [--export out.json]
import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

const verbose = process.argv.includes('--verbose')

const root = path.resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const exportIndex = args.indexOf('--export')
const exportPath = exportIndex >= 0 ? args[exportIndex + 1] : null
const harvestPath = path.join(process.env.LOCALAPPDATA || '', 'FreebuffZh', 'harvest.json')
if (!fs.existsSync(harvestPath)) {
  console.log('没有找到巡检快照：' + harvestPath)
  process.exit(0)
}

const script = fs.readFileSync(path.join(root, 'dist', 'freebuff-zh-cn.js'), 'utf8')
const dom = new JSDOM('<body></body>', { runScripts: 'dangerously' })
const { window } = dom
window.eval(script)
const api = window.__FREEBUFF_ZH__
if (!api || typeof api.translate !== 'function') {
  console.log('引擎没有暴露 translate()，先运行 npm run build')
  process.exit(1)
}

const SKIP = [
  /^https?:\/\//,
  /^[\w.+-]+@[\w.-]+$/,
  /^[a-z0-9][a-z0-9._-]*$/, // 标识符/包名/版本
  /\d+\.\d+\.\d+/,
  /^#[0-9a-f]{3,8}$/i,
  /^(surface|accent|text|border|muted|background):/i,
]
const KNOWN_BRANDS = /^(Freebuff|Buffy|Claude Code|Codex|Cursor|Cline|Roo|GitHub|Discord|MCP|Exa|Archil|Respan|Surge|Specific|CodeRabbit|Infisical|Supabase|AWS|Linear|Notion|Vercel|Neon|Render|Railway|Fly|Unsplash|Calibri|Inter|Consolas|GLM|Gmail|Slack|Drive|Notion|Stripe|Square|Zoom|Box|Canva|Asana|ClickUp|Airtable|Outlook|Teams|Dropbox|OneDrive|SharePoint|HubSpot|Salesforce|Attio|Pipedrive|Zendesk|Intercom|QuickBooks|Brex|Gumroad|Mixpanel|Amplitude|Tavily|Firecrawl|ElevenLabs|OpenAI|Perplexity|PostHog|Sentry|GitHub|Google|Meta|Facebook|Instagram|LinkedIn|YouTube|Reddit|X)$/

const data = JSON.parse(fs.readFileSync(harvestPath, 'utf8'))
const perTarget = new Map()
const misses = new Map()
const filtered = []
console.log(`快照来源：${data.at || '未知时间'} · ${data.href || '未知页面'} · 补丁在位：${data.patch ? '是' : '否'}`)
console.log('注意：探针驱动的会话里，功能测试本身也会产生界面串；判读「待办」时要区分测试残留与稳态流量。')

for (const screen of data.screens || []) {
  if (screen.missing) continue
  const values = [...(screen.nodes || []), ...(screen.attrs || [])]
  const open = []
  for (const value of values) {
    const text = String(value).replace(/\s+/g, ' ').trim()
    if (text.length < 2 || text.length > 160) continue
    if (!/[A-Za-z]{2,}/.test(text)) continue
    if (/[\u4e00-\u9fff]/.test(text)) continue
    if (SKIP.some((re) => re.test(text))) {
      filtered.push({ text, reason: '规则过滤' })
      continue
    }
    if (text.includes('__next_f') || text.includes('self.')) {
      filtered.push({ text, reason: '框架脚本残留' })
      continue
    }
    if (KNOWN_BRANDS.test(text)) {
      filtered.push({ text, reason: '品牌/应用名' })
      continue
    }
    const translated = api.translate(text)
    if (translated === null) {
      open.push(text)
      misses.set(text, (misses.get(text) || 0) + 1)
    } else filtered.push({ text, reason: '已翻译' })
  }
  perTarget.set(screen.target, open)
}

let total = 0
for (const [target, open] of perTarget) {
  total += open.length
  const label = target === '__settings_root__' ? '设置总览' : target
  console.log(`${String(open.length).padStart(3)}  ${label}`)
  for (const text of open.slice(0, 6)) console.log('       ' + text)
}
console.log(`\n合计待翻译 ${misses.size} 条（按出现次数）`)
for (const [text, count] of [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60)) console.log(`  ${String(count).padStart(3)}  ${text}`)

const byReason = new Map()
for (const item of filtered) byReason.set(item.reason, (byReason.get(item.reason) || 0) + 1)
console.log('\n过滤统计（可追溯，不静默丢弃）：')
for (const [reason, count] of [...byReason.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(count).padStart(4)}  ${reason}`)
if (verbose) {
  console.log('\n过滤明细：')
  for (const item of filtered) console.log(`  ${item.reason.padEnd(12)} ${item.text}`)
}

if (exportPath) {
  const payload = {
    source: { at: data.at, href: data.href, patch: data.patch },
    misses: [...misses.keys()].sort(),
    filtered: filtered.map((item) => item.text).sort(),
  }
  fs.writeFileSync(path.resolve(root, exportPath), JSON.stringify(payload, null, 1))
  console.log(`\n已导出到 ${exportPath}（含 misses 与 filtered 两段，便于回溯）`)
}
