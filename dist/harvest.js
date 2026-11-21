// 界面巡检探针（第二轮）：先进设置，再逐个点击设置分区，抓每个分区的可见文本与属性。
// 只在 %LOCALAPPDATA%\FreebuffZh\harvest 存在时由注入钩子调用；不保存、不删除、不退出登录。
;(() => {
  'use strict'
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const SECTIONS = ['通用', '账号', '外观', '用量', '账单', '赚取', '模型提供商', '开发者 API', '项目设置', '技能', '产物', '键盘快捷键', '通知', '隐私', '高级', '集成', 'MCP']

  const label = (element) => {
    const value = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || ''
    return value.replace(/\s+/g, ' ').trim()
  }

  const snapshot = () => {
    const text = (document.body.innerText || '').replace(/\s+/g, ' ').trim()
    const nodes = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const value = (node.nodeValue || '').replace(/\s+/g, ' ').trim()
      if (value && /[A-Za-z]{2,}/.test(value) && value.length <= 200) nodes.push(value)
      node = walker.nextNode()
    }
    const attrs = []
    for (const element of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
      for (const name of ['aria-label', 'title', 'placeholder']) {
        const value = element.getAttribute(name)
        if (value) attrs.push(value.replace(/\s+/g, ' ').trim())
      }
    }
    return { text: text.slice(0, 14000), nodes: [...new Set(nodes)].slice(0, 600), attrs: [...new Set(attrs)].slice(0, 500) }
  }

  const escape = () => {
    for (const type of ['keydown', 'keyup']) {
      document.dispatchEvent(new KeyboardEvent(type, { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }))
    }
  }

  const clickable = () => [...document.querySelectorAll('[aria-label],[title],button,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"]')]

  const find = (needle) => {
    const wanted = needle.toLowerCase()
    const scored = []
    for (const node of clickable()) {
      const text = label(node).toLowerCase()
      if (!text || text.length > 60) continue
      if (!text.includes(wanted)) continue
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      scored.push({ node, exact: text === wanted ? 0 : 1, length: text.length })
    }
    scored.sort((a, b) => a.exact - b.exact || a.length - b.length)
    return scored[0] ? scored[0].node : null
  }

  return (async () => {
    await sleep(6000)
    const screens = []
    const openSettings = find('设置')
    if (openSettings) {
      openSettings.click()
      await sleep(2000)
    }
    screens.push({ target: '__settings_root__', opened: Boolean(openSettings), ...snapshot() })

    for (const section of SECTIONS) {
      const node = find(section)
      if (!node) {
        screens.push({ target: section, missing: true })
        continue
      }
      try {
        node.scrollIntoView({ block: 'center' })
        node.click()
      } catch (error) {
        screens.push({ target: section, error: String(error && error.message) })
        continue
      }
      await sleep(1600)
      screens.push({ target: section, label: label(node), ...snapshot() })
    }
    escape()
    await sleep(300)
    escape()
    return { href: location.href, at: new Date().toISOString(), patch: Boolean(globalThis.__FREEBUFF_ZH__), screens }
  })()
})()
