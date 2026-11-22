// 引擎测试：用 jsdom 把补丁脚本真跑一遍，断言界面上该变的中文都变了、不该动的都没动。
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const script = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-cn.js'), 'utf8')
const mainShim = fs.readFileSync(path.join(__dirname, '..', 'dist', 'freebuff-zh-main.js'), 'utf8')

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
  <span id="step">Step 2 of 5</span>
  <span id="soon">in 10 minutes</span>
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

// jsdom 没有 Notification：自己造一个把构造参数记下来的假的，用来验证「通知真的被翻译」。
const notified = []
class FakeNotification {
  constructor(title, options) {
    notified.push({ title, options })
  }
}
Object.defineProperty(FakeNotification, 'permission', { get: () => 'granted' })
FakeNotification.requestPermission = () => Promise.resolve('granted')
window.Notification = FakeNotification

window.eval(script)

setTimeout(() => {
  const doc = window.document
  const text = (sel) => doc.querySelector(sel)?.textContent
  const all = doc.body.textContent.replace(/\s+/g, ' ').trim()
  const input = doc.getElementById('search')
  const textarea = doc.querySelector('textarea')
  const nav = doc.querySelector('nav')

  // 主世界的 shim 与引擎走同一套桥接：先装 shim，再构造通知。
  window.eval(mainShim)
  const firstWrap = window.Notification
  window.eval(mainShim)
  const repeatedShim = window.Notification
  if (firstWrap !== repeatedShim) throw new Error('shim 重复执行时换了包装对象')
  new window.Notification('New chat', { body: 'Copied' })
  new window.Notification('Build finished', { body: 'zzz no dict hit' })
  new window.Notification('Settings – Appearance', { body: 'Build failed – see logs' })
  const first = notified[0] || {}
  const second = notified[1] || {}
  const third = notified[2] || {}

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
    ['步骤规则', doc.getElementById('step').textContent === '第 2 步，共 5 步'],
    ['未来时间规则', doc.getElementById('soon').textContent === '10 分钟后'],
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
    ['通知被主世界 shim 包装', typeof window.Notification === 'function' && window.Notification.__freebuffZh === true],
    // 真正的「只包装一次」：重复执行 shim 不会换掉同一个包装对象。
    ['通知只包装一次', repeatedShim === window.Notification && window.__freebuffZhMain === true],
    ['通知用例条数', notified.length === 3],
    ['通知标题翻译', first.title === '新建对话'],
    ['通知正文翻译', Boolean(first.options) && first.options.body === '已复制'],
    ['未命中的通知正文原样', Boolean(second.options) && second.options.body === 'zzz no dict hit'],
    // 正文不按分隔符拆段：整句没命中就原样返回，不会拼成半中半英。
    ['正文不拆段翻译', Boolean(third.options) && third.options.body === 'Build failed – see logs'],
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
}, 2600)
