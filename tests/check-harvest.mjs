// 巡检差集：把 harvest.json 里抓到的每条界面文本丢给补丁的 translate()，列出还没被翻译的。
// 用法：node tools/check-harvest.mjs [--export out.json]
import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

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

for (const screen of data.screens || []) {
  if (screen.missing) continue
  const values = [...(screen.nodes || []), ...(screen.attrs || [])]
  const open = []
  for (const value of values) {
    const text = String(value).replace(/\s+/g, ' ').trim()
    if (text.length < 2 || text.length > 160) continue
    if (!/[A-Za-z]{2,}/.test(text)) continue
    if (/[\u4e00-\u9fff]/.test(text)) continue
    if (SKIP.some((re) => re.test(text))) continue
    if (text.includes('__next_f') || text.includes('self.')) continue
    if (KNOWN_BRANDS.test(text)) continue
    const translated = api.translate(text)
    if (translated === null) {
      open.push(text)
      misses.set(text, (misses.get(text) || 0) + 1)
    }
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

if (exportPath) {
  fs.writeFileSync(path.resolve(root, exportPath), JSON.stringify([...misses.keys()].sort(), null, 1))
  console.log(`\n已导出到 ${exportPath}`)
}
