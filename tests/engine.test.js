// 引擎测试：用 jsdom 把补丁脚本真跑一遍，断言界面上该变的中文都变了、不该动的都没动。
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')

const html = `<!DOCTYPE html><html><head><title>Freebuff: The free coding agent</title></head><body>
<nav aria-label="App navigation">
  <a href="/">Home</a>
  <a href="/sites">Sites</a>
  <button aria-label="Collapse left sidebar">Projects</button>
  <button aria-label="Resize left sidebar"></button>
  <button>New project</button>
  <button>New chat</button>
  <button>Integrations</button>
  <button>Settings</button>
</nav>
<header>
  <span>3 chats</span>
  <span>5 minutes ago</span>
  <span>Just now</span>
  <span id="count">12 files</span>
  <span id="hours">Daily hours: 5:00 of 5:00 remaining</span>
  <span id="mixed">Collapse 汉化项目</span>
  <span id="proj">Project actions for freebuff</span>
  <div id="host"></div>
  <input id="valueInput" type="submit" value="Save" />
</header>
<main>
  <h1>What can I help build?</h1>
  <p>Choose where the next message runs.</p>
  <input id="search" placeholder="Search chats" />
  <textarea placeholder="Ask Freebuff to build something"></textarea>
  <button>Close tab</button>
  <button>Toggle files</button>
  <button>Try again</button>
  <code>New chat</code>
  <pre>Settings
Connected</pre>
  <div contenteditable="true">Draft message here</div>
  <span data-freebuff-zh-skip>Do not touch</span>
  <div class="toast">Copied</div>
</main>
<div role="dialog" aria-label="Delete chat?">
  <h3>Delete chat?</h3>
  <button>Cancel</button><button>Delete</button>
</div>
</body></html>`

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://127.0.0.1:8791/' })
const { window } = dom
const host = window.document.getElementById('host')
const shadow = host.attachShadow({ mode: 'open' })
shadow.innerHTML = '<span>New project</span>'
window.eval(script)

setTimeout(() => {
  const doc = window.document
  const text = (sel) => doc.querySelector(sel)?.textContent
  const all = doc.body.textContent.replace(/\s+/g, ' ').trim()
  const input = doc.getElementById('search')
  const textarea = doc.querySelector('textarea')
  const nav = doc.querySelector('nav')

  const checks = [
    ['nav 首页', /首页/.test(nav.textContent)],
    ['nav 站点', /站点/.test(nav.textContent)],
    ['nav 项目', /项目/.test(nav.textContent)],
    ['aria 收起左侧边栏', /收起左侧边栏/.test(nav.querySelectorAll('button')[0].getAttribute('aria-label'))],
    ['aria 调整左侧边栏宽度', /调整左侧边栏宽度/.test(nav.querySelectorAll('button')[1].getAttribute('aria-label'))],
    ['按钮 新建项目', /新建项目/.test(nav.textContent)],
    ['按钮 新建对话', /新建对话/.test(nav.textContent)],
    ['按钮 集成', /集成/.test(nav.textContent)],
    ['按钮 设置', /设置/.test(nav.textContent)],
    ['数量 3 个对话', /3 个对话/.test(all)],
    ['相对时间 5 分钟前', /5 分钟前/.test(all)],
    ['刚刚', /刚刚/.test(all)],
    ['数量 12 个文件', doc.getElementById('count').textContent === '12 个文件'],
    ['每日小时规则', /每日小时：剩余 5:00 \/ 5:00/.test(doc.getElementById('hours').textContent)],
    ['中文项目名走规则', doc.getElementById('mixed').textContent === '收起汉化项目'],
    ['项目操作规则', doc.getElementById('proj').textContent === 'freebuff 的项目操作'],
    ['空状态问句', /想让我帮你做点什么？/.test(all)],
    ['说明句', /选择下一条消息在哪里运行。/.test(all)],
    ['placeholder 搜索对话', /搜索对话/.test(input.placeholder)],
    ['textarea 不动', textarea.placeholder.startsWith('Ask Freebuff')],
    ['code 不动', text('code') === 'New chat'],
    ['pre 不动', text('pre').includes('Settings')],
    ['contenteditable 不动', /Draft message/.test(all)],
    ['skip 属性尊重', /Do not touch/.test(all)],
    ['toast 已复制', /已复制/.test(all)],
    ['对话框', /删除对话？/.test(all)],
    ['title 标签', /免费编程智能体/.test(doc.title)],
    ['input value 属性', doc.getElementById('valueInput').getAttribute('value') === '保存'],
    ['shadow DOM', shadow.textContent === '新建项目'],
    ['nav 无英文残留', !/Home|Sites|Projects|Settings/.test(nav.textContent)],
    ['调试口可用', typeof window.__FREEBUFF_ZH__.stats === 'function' && window.__FREEBUFF_ZH__.stats().applied > 10],
  ]

  let failed = 0
  for (const [name, ok] of checks) {
    if (!ok) failed += 1
    console.log((ok ? 'PASS ' : 'FAIL ') + name)
  }
  console.log('\n--- 渲染后的文本 ---\n' + all)
  console.log('\n--- placeholder:', input.placeholder)
  console.log('--- title:', doc.title)
  console.log('--- 失败:', failed)
  process.exit(failed ? 1 : 0)
}, 1200)
