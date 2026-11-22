// 截图核对：把补丁后的界面渲染成 PNG，用于人工确认版式与文案。
// 用法：node shot.test.js
const fs = require('fs')
const path = require('path')
const http = require('http')
const puppeteer = require('puppeteer-core')

const APP_DIR = process.env.FREEBUFF_DIR || path.join(process.env.LOCALAPPDATA || '', 'Programs', '@codebufffreebuff-desktop')
const UI_DIR = path.join(APP_DIR, 'resources', 'orchestrator', 'ui')
const CHROME = require('./chrome').resolveChrome()
const OUT = path.join(__dirname, '..', 'scratch', 'shots')
const MIME = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' }

const server = http.createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0])
  const target = clean === '/' ? path.join(UI_DIR, 'index.html') : path.join(UI_DIR, clean)
  if (!target.startsWith(UI_DIR) || !fs.existsSync(target)) {
    res.writeHead(404)
    res.end('not found')
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' })
  fs.createReadStream(target).pipe(res)
})

;(async () => {
  if (!fs.existsSync(path.join(UI_DIR, 'index.html'))) {
    console.error(`找不到界面目录: ${UI_DIR}`)
    console.error('Freebuff 没装在默认路径时，用 FREEBUFF_DIR 指向应用目录。')
    process.exit(2)
  }
  fs.mkdirSync(OUT, { recursive: true })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const PORT = server.address().port
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 3000))
  await page.screenshot({ path: path.join(OUT, 'shell.png') })
  console.log('shell.png 已保存；页面文字：', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 160))

  const hosted = await browser.newPage()
  await hosted.setViewport({ width: 1440, height: 900 })
  const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')
  await hosted.evaluateOnNewDocument(script)
  await hosted.goto('https://freebuff.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 9000))
  await hosted.screenshot({ path: path.join(OUT, 'hosted.png') })
  console.log('hosted.png 已保存；页面文字：', (await hosted.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 200))

  await browser.close()
  server.close()
})()
