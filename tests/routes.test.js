// 多路由漏译巡检：把补丁注入几个公开路由，收集仍然没被翻译的短英文，输出成待翻译清单。
// 用法：node routes.test.js [--export ../scratch/misses.json]
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')
const ROUTES = ['/', '/app', '/chat', '/pricing', '/store', '/cli', '/models', '/desktop']
const exportIndex = process.argv.indexOf('--export')
const exportPath = exportIndex > 0 ? process.argv[exportIndex + 1] : null

;(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] })
  const perRoute = {}
  for (const route of ROUTES) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 1400 })
    await page.evaluateOnNewDocument(script)
    try {
      await page.goto('https://freebuff.com' + route, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await new Promise((r) => setTimeout(r, 6000))
      const state = await page.evaluate(() => {
        const api = window.__FREEBUFF_ZH__
        const text = document.body.innerText || ''
        const words = [...new Set((text.match(/\b[A-Z][A-Za-z'’-]*(?: [A-Za-z'’-]+){0,5}\b/g) || []))]
        return { stats: api ? api.stats() : null, chinese: /[\u4e00-\u9fff]/.test(text), words: words.slice(0, 400), length: text.length }
      })
      perRoute[route] = state
      console.log(`${route.padEnd(10)} 已翻译 ${String(state.stats?.applied ?? 0).padStart(4)}  未命中 ${String(state.stats?.misses ?? 0).padStart(4)}  中文 ${state.chinese ? '有' : '无'}  文本 ${state.length}`)
    } catch (error) {
      console.log(`${route.padEnd(10)} 失败：${error.message.slice(0, 80)}`)
      perRoute[route] = { error: error.message, stats: null }
    } finally {
      await page.close()
    }
  }
  await browser.close()

  const seen = new Map()
  for (const [route, state] of Object.entries(perRoute)) {
    for (const word of state.words || []) {
      if (word.length < 3 || word.length > 60) continue
      if (!seen.has(word)) seen.set(word, new Set())
      seen.get(word).add(route)
    }
  }
  const list = [...seen.entries()].map(([word, routes]) => ({ word, routes: [...routes] })).sort((a, b) => a.word.localeCompare(b.word))
  if (exportPath) {
    fs.writeFileSync(exportPath, JSON.stringify(list, null, 1))
    console.log(`\n导出 ${list.length} 条待审英文到 ${exportPath}`)
  } else {
    console.log('\n待审英文（前 120 条）：')
    for (const item of list.slice(0, 120)) console.log('  ' + item.word)
  }
})()
