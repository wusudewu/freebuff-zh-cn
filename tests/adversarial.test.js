// 对抗测试：奇怪输入不能把引擎弄崩，也不能污染页面。
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')

const long = 'A'.repeat(5000)
const html = `<body>
<div id="dollar">$& $1 $$ Save</div>
<div id="literal">Daily hours: {0} of {1} remaining</div>
<div id="long">${long}</div>
<div id="nested">Collapse Collapse Collapse Collapse Nest</div>
<div id="blank">   </div>
<div id="empty" title=""></div>
<div id="script"><script>var x = "Save"</script>Save</div>
<div id="pre"><pre><code>New chat</code></pre>New chat</div>
<div id="mixed">Collapse 中文项目</div>
</body>`

const dom = new JSDOM(html, { runScripts: 'dangerously' })
const { window } = dom
window.eval(script)

setTimeout(() => {
  const doc = window.document
  const checks = [
    ['$& 原样保留，不被当成替换语法', doc.getElementById('dollar').textContent.includes('$&') && doc.getElementById('dollar').textContent.includes('$1')],
    ['字面占位符不炸', /\{0\}/.test(doc.getElementById('literal').textContent) || doc.getElementById('literal').textContent.includes('每日小时')],
    ['超长文本不炸', doc.getElementById('long').textContent.length >= 5000],
    ['嵌套前缀有深度上限', doc.getElementById('nested').textContent.includes('收起')],
    ['纯空白保持原样', doc.getElementById('blank').textContent === '   '],
    ['空属性不炸', doc.getElementById('empty').getAttribute('title') === ''],
    ['script 内文本不动', doc.querySelector('#script script').textContent.includes('Save')],
    ['pre/code 不动', doc.querySelector('#pre code').textContent === 'New chat'],
    ['中文混排走规则', doc.getElementById('mixed').textContent === '收起中文项目'],
    ['页面没有异常', typeof window.__FREEBUFF_ZH__ === 'object'],
  ]
  let failed = 0
  for (const [name, ok] of checks) {
    if (!ok) failed += 1
    console.log((ok ? 'PASS ' : 'FAIL ') + name)
  }
  process.exit(failed ? 1 : 0)
}, 2600)
