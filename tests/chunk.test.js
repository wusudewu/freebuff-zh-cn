// 分片测试：超过 1500 个元素的页面走 requestIdleCallback 分片，必须全部覆盖。
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')
const LINES = 900
const items = Array.from({ length: LINES }, (_, i) => `<div class="row"><span>Save</span><span>Cancel</span><span>3 files</span> #${i}</div>`).join('')
const html = `<body><div id="root">${items}</div></body>`

const dom = new JSDOM(html, { runScripts: 'dangerously' })
const { window } = dom
const start = Date.now()
window.eval(script)

const deadline = Date.now() + 15000
const poll = setInterval(() => {
  const rows = window.document.querySelectorAll('.row')
  let done = 0
  for (const row of rows) {
    const text = row.textContent
    if (text.includes('保存') && text.includes('取消') && /3 个文件/.test(text)) done += 1
  }
  if (done === LINES || Date.now() > deadline) {
    clearInterval(poll)
    console.log(`覆盖 ${done}/${LINES} 行，用时 ${Date.now() - start}ms`)
    process.exit(done === LINES ? 0 : 1)
  }
}, 200)
