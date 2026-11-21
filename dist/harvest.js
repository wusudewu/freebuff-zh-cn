// 界面巡检探针（第三轮）：把登录后能安全打开的面板与弹窗全部走一遍。
// 只在 %LOCALAPPDATA%\FreebuffZh\harvest 存在时由注入钩子调用；
// 只打开、截图、关掉——不创建项目、不发送消息、不购买、不退出登录。
;(() => {
  'use strict'
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const STEPS = [
    { name: '设置', labels: ['设置', 'Settings'], close: true },
    { name: '设置-通用', labels: ['通用'], close: false },
    { name: '设置-账号', labels: ['账号'], close: false },
    { name: '设置-外观', labels: ['外观'], close: false },
    { name: '设置-用量', labels: ['用量'], close: false },
    { name: '设置-账单', labels: ['账单'], close: false },
    { name: '设置-赚取', labels: ['赚取'], close: false },
    { name: '设置-模型提供商', labels: ['模型提供商', 'Model providers'], close: false },
    { name: '设置-开发者API', labels: ['开发者 API'], close: false },
    { name: '设置-项目设置', labels: ['项目设置'], close: false },
    { name: '设置-技能', labels: ['技能'], close: false },
    { name: '设置-产物', labels: ['产物'], close: false },
    { name: '模型选择器', labels: ['选择模型', '当前模型', '模型', 'Model', 'Choose a model'], close: true },
    { name: '模型-推理强度', labels: ['推理', 'Reasoning'], close: true },
    { name: '文件面板', labels: ['文件', '显示或隐藏文件', 'Files'], close: false },
    { name: '终端面板', labels: ['终端', '显示或隐藏底部终端', 'Terminal'], close: false },
    { name: '变更面板', labels: ['变更', 'Changes'], close: false },
    { name: '产物面板', labels: ['产物', 'Artifacts'], close: false },
    { name: '概览面板', labels: ['概览', 'Overview'], close: false },
    { name: '云端浏览器', labels: ['云端浏览器', 'Cloud browser'], close: false },
    { name: '新建项目对话框', labels: ['新建项目', '添加项目', 'New project'], close: true },
    { name: '模板库', labels: ['模板', '从模板开始', 'Templates'], close: true },
    { name: '邀请好友', labels: ['邀请好友', 'Invite friends'], close: true },
    { name: '集成', labels: ['集成', 'Integrations'], close: true },
    { name: 'MCP', labels: ['MCP'], close: true },
    { name: '帮助', labels: ['帮助', 'Help'], close: true },
    { name: '账号菜单', labels: ['账号', 'Account'], close: true },
    { name: '键盘快捷键', labels: ['键盘快捷键', '快捷键', 'Keyboard shortcuts'], close: true },
    { name: '技能', labels: ['技能', 'Skills'], close: true },
    { name: '反馈', labels: ['反馈', 'Feedback'], close: true },
    { name: '广告选项', labels: ['广告选项', 'Ad options'], close: true },
  ]

  const label = (element) => {
    const value = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || ''
    return value.replace(/\s+/g, ' ').trim()
  }

  const clickable = () =>
    [...document.querySelectorAll('[aria-label],[title],button,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"]')]

  const find = (labels) => {
    const wanted = labels.map((x) => x.toLowerCase())
    const scored = []
    for (const node of clickable()) {
      const text = label(node).toLowerCase()
      if (!text || text.length > 60) continue
      const index = wanted.findIndex((want) => text === want)
      const contains = index === -1 ? wanted.findIndex((want) => text.includes(want)) : -1
      if (index === -1 && contains === -1) continue
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      scored.push({ node, rank: index === -1 ? 10 + contains : index, length: text.length })
    }
    scored.sort((a, b) => a.rank - b.rank || a.length - b.length)
    return scored[0] ? scored[0].node : null
  }

  const snapshot = () => {
    const nodes = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const value = (node.nodeValue || '').replace(/\s+/g, ' ').trim()
      const inScript = node.parentElement && /^(SCRIPT|STYLE)$/.test(node.parentElement.tagName)
      if (!inScript && value && /[A-Za-z]{2,}/.test(value) && value.length <= 200) nodes.push(value)
      node = walker.nextNode()
    }
    const attrs = []
    for (const element of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
      for (const name of ['aria-label', 'title', 'placeholder']) {
        const value = element.getAttribute(name)
        if (value) attrs.push(value.replace(/\s+/g, ' ').trim())
      }
    }
    return { nodes: [...new Set(nodes)].slice(0, 800), attrs: [...new Set(attrs)].slice(0, 600) }
  }

  const escape = () => {
    for (const type of ['keydown', 'keyup']) {
      document.dispatchEvent(new KeyboardEvent(type, { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }))
    }
  }

  return (async () => {
    await sleep(6000)
    const screens = []
    screens.push({ target: '__initial__', ...snapshot() })
    for (const step of STEPS) {
      const node = find(step.labels)
      if (!node) {
        screens.push({ target: step.name, missing: true })
        continue
      }
      try {
        node.scrollIntoView({ block: 'center' })
        node.click()
      } catch (error) {
        screens.push({ target: step.name, error: String(error && error.message) })
        continue
      }
      await sleep(1500)
      screens.push({ target: step.name, label: label(node), ...snapshot() })
      if (step.close) {
        escape()
        await sleep(500)
        escape()
        await sleep(300)
      }
    }
    return { href: location.href, at: new Date().toISOString(), patch: Boolean(globalThis.__FREEBUFF_ZH__), screens }
  })()
})()
