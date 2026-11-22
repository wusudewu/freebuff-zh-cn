// 多路由漏译巡检：把补丁注入几个公开路由，收集仍然没被翻译的短英文，输出成待翻译清单。
// 用法：node routes.test.js [--export ../scratch/misses.json]
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const CHROME = require('./chrome').resolveChrome()
const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')
// /models 已下线（HTTP 404，测到的是「页面不存在」），从列表里去掉；
// /store 是正常的 SPA 页面（200），引擎能装上，别因为某次跑出 0 就当它失效。
const ROUTES = ['/', '/app', '/chat', '/pricing', '/store', '/cli', '/desktop']
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
      // 不靠固定 sleep：等引擎真的开始翻（首屏 load 可能很晚），再给 1.5 秒收尾。
      await page.waitForFunction(() => window.__FREEBUFF_ZH__ && window.__FREEBUFF_ZH__.stats().applied > 0, { timeout: 25000 }).catch(() => {})
      await new Promise((r) => setTimeout(r, 1500))
      const state = await page.evaluate(() => {
        const api = window.__FREEBUFF_ZH__
        const text = document.body.innerText || ''
        const words = [...new Set((text.match(/\b[A-Z][A-Za-z'’-]*(?: [A-Za-z'’-]+){0,5}\b/g) || []))]
        return { stats: api ? api.stats() : null, chinese: /[\u4e00-\u9fff]/.test(text), words: words.slice(0, 400), length: text.length }
      })
      perRoute[route] = state
      const patchState = state.stats ? '在' : '未装'
      console.log(`${route.padEnd(10)} 补丁${patchState}  已翻译 ${String(state.stats?.applied ?? 0).padStart(4)}  未命中 ${String(state.stats?.misses ?? 0).padStart(4)}  中文 ${state.chinese ? '有' : '无'}  文本 ${state.length}`)
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
