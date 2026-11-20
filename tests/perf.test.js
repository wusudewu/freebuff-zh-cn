// 性能测试：首屏同步翻译耗时，以及大页面的完成时间。
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')

function run(label, rows) {
  const items = Array.from({ length: rows }, (_, i) => `<div class="row"><span>Save</span><span>Cancel</span><span>New project</span><span>Daily hours: 5:00 of 5:00 remaining</span>#${i}</div>`).join('')
  const dom = new JSDOM(`<body><div id="root">${items}</div></body>`, { runScripts: 'dangerously' })
  const { window } = dom
  const started = Date.now()
  window.eval(script)
  return new Promise((resolve) => {
    const poll = setInterval(() => {
      const rowsDone = [...window.document.querySelectorAll('.row')].filter((row) => row.textContent.includes('保存')).length
      if (rowsDone === rows || Date.now() - started > 30000) {
        clearInterval(poll)
        resolve({ label, rows, elapsed: Date.now() - started, rowsDone })
      }
    }, 100)
  })
}

;(async () => {
  const small = await run('首屏', 40)
  const large = await run('大页面', 1200)
  const checks = [
    ['首屏 1.5s 内完成', small.elapsed < 1500],
    ['大页面全覆盖', large.rowsDone === large.rows],
    ['大页面 30s 内完成', large.elapsed < 30000],
  ]
  let failed = 0
  for (const [name, ok] of checks) {
    if (!ok) failed += 1
    console.log((ok ? 'PASS ' : 'FAIL ') + name)
  }
  console.log(`首屏 40 行 ${small.elapsed}ms；大页面 1200 行 ${large.elapsed}ms`)
  process.exit(failed ? 1 : 0)
})()
