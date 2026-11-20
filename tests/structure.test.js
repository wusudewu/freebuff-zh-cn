// 结构测试：翻译只允许改文本与属性，节点数量与子节点身份必须保持不变（防白屏的回归阀）。
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')

const html = `<body>
<div id="a"><span>3</span> <span>chats</span></div>
<div id="b"><span>Show</span> <span>more</span></div>
<button id="c"><svg></svg>Save</button>
<p id="d">Choose where the next message runs.</p>
<div id="e">Daily hours: 5:00 of 5:00 remaining</div>
</body>`

const dom = new JSDOM(html, { runScripts: 'dangerously' })
const { window } = dom
const doc = window.document
const ids = ['a', 'b', 'c', 'd', 'e']
const before = ids.map((id) => {
  const el = doc.getElementById(id)
  return { id, count: el.childNodes.length, kids: Array.from(el.childNodes) }
})
window.eval(script)

setTimeout(() => {
  let structural = 0
  for (const snap of before) {
    const el = doc.getElementById(snap.id)
    if (el.childNodes.length !== snap.count) structural += 1
    for (const kid of snap.kids) if (!el.contains(kid)) structural += 1
  }
  const splitKept = doc.getElementById('a').textContent
  const sentence = doc.getElementById('d').textContent
  const hours = doc.getElementById('e').textContent
  const checks = [
    ['节点结构未变动', structural === 0],
    ['拆分节点仍是两个节点', doc.getElementById('a').children.length === 2],
    ['单节点句子已翻译', /运行/.test(sentence)],
    ['带变量句子已翻译', /每日小时：剩余 5:00 \/ 5:00/.test(hours)],
  ]
  let failed = 0
  for (const [name, ok] of checks) {
    if (!ok) failed += 1
    console.log((ok ? 'PASS ' : 'FAIL ') + name)
  }
  console.log('结构被改动的元素数:', structural)
  console.log('拆分节点:', splitKept)
  process.exit(failed ? 1 : 0)
}, 1000)
