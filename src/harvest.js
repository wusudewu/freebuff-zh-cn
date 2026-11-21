// 界面巡检探针（第四轮）：打开新建对话、输入区菜单、标签菜单、模板详情、集成详情、技能、广告向导等界面。
// 只在 %LOCALAPPDATA%\FreebuffZh\harvest 这个「开关文件」存在时由注入钩子调用；写完 harvest.json 后
// 注入钩子会把这个开关删掉，所以它天然是**一次性**的：跑完就失效，重新 touch 才会再跑一次。
// 快照会包含当时界面的全部可见文本（包括当前对话内容），用完请删掉 %LOCALAPPDATA%\FreebuffZh\harvest.json。
// 它只点开界面并取消：不发送消息、不创建项目、不保存、不购买、不退出登录。
;(() => {
  'use strict'
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const STEPS = [
    { name: '新建对话', find: ['新建对话', 'New chat'], open: true },
    { name: '输入区', find: ['输入编程任务', 'Ask Freebuff', '发送消息'], snapshotOnly: true },
    { name: '模型选择器', find: ['模型', '选择模型', 'Model'], close: true },
    { name: '运行位置', find: ['运行位置', '本地', 'Run location'], close: true },
    { name: '添加文件菜单', find: ['添加文件', '添加附件', 'Attach'], close: true },
    { name: '语音输入', find: ['开始语音输入', '语音输入', 'Start dictation'], close: true },
    { name: '对话标签菜单', find: ['对话选项', 'Chat options', '标签页选项'], close: true },
    { name: '模板卡详情', find: ['模板', 'Template'], close: true },
    { name: '集成卡详情', find: ['集成', 'Integrations'], close: true },
    { name: '技能-新建', find: ['技能', 'Skills'], close: true },
    { name: '广告向导', find: ['广告', 'Ad options'], close: true },
    { name: '帮助菜单', find: ['帮助', 'Help'], close: true },
    { name: '通知', find: ['通知', 'Notifications'], close: true },
    { name: '账号菜单', find: ['账号', 'Account'], close: true },
    { name: '键盘快捷键', find: ['键盘快捷键', '快捷键', 'Keyboard shortcuts'], close: true },
    { name: '检查更新', find: ['检查更新', 'Check for updates'], close: true },
    { name: '关于', find: ['关于', 'About'], close: true },
    { name: '文件面板-新建文件', find: ['新建文件', 'New file'], close: true },
    { name: '终端面板-新建终端', find: ['新建终端', 'New terminal'], close: true },
    { name: '变更面板', find: ['变更', 'Changes'], close: false },
    { name: '产物面板-新建', find: ['新建产物', 'New artifact'], close: true },
  ]

  const label = (element) => {
    const value = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || ''
    return value.replace(/\s+/g, ' ').trim()
  }

  const clickable = () =>
    [...document.querySelectorAll('[aria-label],[title],button,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"],[role="combobox"]')]

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
      if (!inScript && value && /[A-Za-z]{2,}/.test(value) && value.length <= 220) nodes.push(value)
      node = walker.nextNode()
    }
    const attrs = []
    for (const element of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
      for (const name of ['aria-label', 'title', 'placeholder']) {
        const value = element.getAttribute(name)
        if (value) attrs.push(value.replace(/\s+/g, ' ').trim())
      }
    }
    return { nodes: [...new Set(nodes)].slice(0, 900), attrs: [...new Set(attrs)].slice(0, 600) }
  }

  const press = (key) => {
    for (const type of ['keydown', 'keyup']) {
      document.dispatchEvent(new KeyboardEvent(type, { key, code: key, keyCode: key === 'Escape' ? 27 : 0, bubbles: true }))
    }
  }

  const closeLayer = async () => {
    for (let i = 0; i < 2; i += 1) {
      const cancel = find(['取消', 'Cancel', '关闭', 'Close'])
      if (cancel) {
        try {
          cancel.click()
        } catch (error) {}
      }
      press('Escape')
      await sleep(400)
    }
  }

  return (async () => {
    await sleep(6000)
    const screens = []
    screens.push({ target: '__initial__', ...snapshot() })
    for (const step of STEPS) {
      const node = find(step.find)
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
      if (step.close) await closeLayer()
    }
    await closeLayer()
    return { href: location.href, at: new Date().toISOString(), patch: Boolean(globalThis.__FREEBUFF_ZH__), screens }
  })()
})()
