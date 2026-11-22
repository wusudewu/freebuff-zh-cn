// 找到本机 Chrome：优先 CHROME_PATH，其次常见安装位置（Windows / macOS / Linux）。
const fs = require('fs')
const path = require('path')

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

function resolveChrome() {
  // 明确指定了就按指定的来：指错时报错，别静默换成别的浏览器去测。
  if (process.env.CHROME_PATH && !fs.existsSync(process.env.CHROME_PATH)) {
    console.error(`CHROME_PATH 指向的文件不存在: ${process.env.CHROME_PATH}`)
    process.exit(2)
  }
  for (const candidate of CANDIDATES) {
    if (candidate && fs.existsSync(candidate)) return candidate
  }
  console.error('找不到 Chrome。请安装 Google Chrome，或设置环境变量 CHROME_PATH 指向 chrome.exe。')
  process.exit(2)
}

module.exports = { resolveChrome, CANDIDATES }
