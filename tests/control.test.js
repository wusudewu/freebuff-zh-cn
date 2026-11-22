const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const CHROME = require('./chrome').resolveChrome()
const withPatch = process.argv[2] === 'patch'
const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')

;(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 120)) })
  if (withPatch) await page.evaluateOnNewDocument(script)
  await page.goto('https://freebuff.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 12000))
  const stats = await page.evaluate(() => (window.__FREEBUFF_ZH__ ? window.__FREEBUFF_ZH__.stats() : null))
  const hydration = errors.filter((e) => e.includes('418') || e.includes('hydrat'))
  console.log(JSON.stringify({ mode: withPatch ? 'patch' : 'baseline', totalErrors: errors.length, hydrationErrors: hydration.length, samples: errors.slice(0, 6), stats }))
  await browser.close()
})()
