/*
 * 浏览器集成测试：真实 Chrome 里加载补丁后的界面，和「不注入」的基线对比页面错误，
 * 再检查汉化是否真的发生。宁可对比出「补丁没有引入新错误」，也不假装零错误。
 *   1. 本地启动页：安装目录里的 resources\orchestrator\ui（服务端屏蔽 marker 即可得到基线）
 *   2. 线上主力界面 https://freebuff.com/（evaluateOnNewDocument 模拟 Electron 侧注入）
 * 前置：npm install；本机已安装 Chrome（非默认路径时设置 CHROME_PATH）。
 */
const http = require('http')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const APP_DIR = process.env.FREEBUFF_DIR || path.join(process.env.LOCALAPPDATA || '', 'Programs', '@codebufffreebuff-desktop')
const UI_DIR = path.join(APP_DIR, 'resources', 'orchestrator', 'ui')
const CHROME = require('./chrome').resolveChrome()
const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')

const MIME = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json; charset=utf-8' }

function startServer(root) {
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split('?')[0])
    const baseline = clean.includes('baseline')
    const rel = baseline ? clean.replace('/baseline', '') || '/index.html' : clean
    const target = rel === '/' ? path.join(root, 'index.html') : path.join(root, rel)
    if (!target.startsWith(root) || !fs.existsSync(target)) {
      res.writeHead(404)
      res.end('not found')
      return
    }
    if (path.extname(target) === '.html') {
      let html = fs.readFileSync(target, 'utf8')
      if (baseline) html = html.replace(/<!-- freebuff-zh:start -->[\s\S]*?<!-- freebuff-zh:end -->/, '')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' })
    fs.createReadStream(target).pipe(res)
  })
  // 端口交给系统分配：固定端口在崩溃残留或被占用时只会抛 EADDRINUSE，看不出原因。
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

function collect(page) {
  const bucket = []
  page.on('pageerror', (error) => bucket.push('pageerror: ' + error.message.slice(0, 160)))
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.push('console: ' + message.text().slice(0, 160))
  })
  return bucket
}

async function run(browser, url, { inject, wait }) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const errors = collect(page)
  if (inject) await page.evaluateOnNewDocument(script)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, wait))
  const state = await page.evaluate(() => ({
    text: (document.body.innerText || '').slice(0, 4000),
    stats: window.__FREEBUFF_ZH__ ? window.__FREEBUFF_ZH__.stats() : null,
  }))
  await page.close()
  return { errors, ...state }
}

async function main() {
  // 前置检查：界面目录不存在时后面的断言会以「注入没生效」的样子失败，看不出真实原因。
  if (!fs.existsSync(path.join(UI_DIR, 'index.html'))) {
    console.error(`找不到界面目录: ${UI_DIR}`)
    console.error('Freebuff 没装在默认路径时，用 FREEBUFF_DIR 指向应用目录。')
    process.exit(2)
  }
  const server = await startServer(UI_DIR)
  const PORT = server.address().port
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] })
  const results = []
  try {
    const localBase = await run(browser, `http://127.0.0.1:${PORT}/baseline`, { inject: false, wait: 2500 })
    const localPatched = await run(browser, `http://127.0.0.1:${PORT}/`, { inject: false, wait: 2500 })
    const jsOnly = (list) => list.filter((e) => e.startsWith('pageerror:'))
    console.log('本地基线 JS 异常:', jsOnly(localBase.errors).length, '本地补丁 JS 异常:', jsOnly(localPatched.errors).length)
    results.push(['本地启动页注入生效', Boolean(localPatched.stats)])
    results.push(['本地启动页出现中文', /[\u4e00-\u9fff]/.test(localPatched.text)])
    results.push(['本地启动页没有新增 JS 异常', jsOnly(localPatched.errors).length <= jsOnly(localBase.errors).length])
    if (localPatched.errors.length > localBase.errors.length) console.log(localPatched.errors.slice(0, 5))

    const remoteBase = await run(browser, 'https://freebuff.com/', { inject: false, wait: 12000 })
    const remotePatched = await run(browser, 'https://freebuff.com/', { inject: true, wait: 12000 })
    console.log('线上基线 JS 异常:', jsOnly(remoteBase.errors).length, '线上补丁 JS 异常:', jsOnly(remotePatched.errors).length)
    console.log('（控制台里的资源加载失败不计入：基线同样会因网络抖动出现）')
    results.push(['线上页面注入生效', Boolean(remotePatched.stats)])
    results.push(['线上页面有翻译命中（≥ 30 条）', Boolean(remotePatched.stats && remotePatched.stats.applied >= 30)])
    results.push(['线上页面没有新增 JS 异常', jsOnly(remotePatched.errors).length <= jsOnly(remoteBase.errors).length])
    if (remotePatched.errors.length > remoteBase.errors.length) {
      console.log('基线错误:', JSON.stringify(remoteBase.errors, null, 1))
      console.log('补丁错误:', JSON.stringify(remotePatched.errors, null, 1))
    }
    console.log('线上统计:', JSON.stringify(remotePatched.stats))
    console.log('线上补丁版文本开头:', remotePatched.text.replace(/\s+/g, ' ').slice(0, 240))
  } finally {
    await browser.close()
    server.close()
  }

  let failed = 0
  for (const [name, ok] of results) {
    if (!ok) failed += 1
    console.log((ok ? 'PASS ' : 'FAIL ') + name)
  }
  console.log(failed ? '\nINTEGRATION FAIL' : '\nINTEGRATION PASS')
  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error('集成测试异常：', error)
  process.exit(1)
})
