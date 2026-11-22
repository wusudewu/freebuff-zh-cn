/*
 * Freebuff 简体中文界面补丁 · 运行时 DOM 汉化层
 * 只改已有文本节点与属性，不新增、不移动、不删除任何 DOM 节点。
 * 不联网、不上报，不读取账号或会话数据。
 * 由 FreebuffZhPatch.ps1 安装，构建自 src/engine.js + dict/*.json。
 * 作者：wusudewu
 */
;(() => {
  'use strict'

  const PATCH_ID = 'freebuff-zh-cn'
  const PATCH_VERSION = '__PATCH_VERSION__'
  const existing = globalThis.__FREEBUFF_ZH__
  if (existing && existing.id === PATCH_ID && existing.version === PATCH_VERSION) return
  if (existing && existing.dispose) {
    try {
      existing.dispose()
    } catch (error) {}
  }

  const DICT = __DICT__
  const RULES = __RULES__

  const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/
  const SPACE = /\s+/g
  const DISABLE_KEY = 'freebuff-zh:disabled'

  const ATTRS = [
    'placeholder',
    'aria-label',
    'aria-placeholder',
    'aria-valuetext',
    'aria-description',
    'title',
    'data-tooltip',
    'data-placeholder',
    'alt',
  ]
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'KBD', 'SAMP', 'SVG', 'CANVAS', 'MATH', 'TEMPLATE'])
  const SKIP_SELECTOR =
    '[contenteditable=""],[contenteditable="true"],[data-freebuff-zh-skip],.monaco-editor,.cm-editor,.cm-content,.xterm,.xterm-helper-textarea,[data-stream-word]'

  function isDisabled() {
    try {
      return window.localStorage.getItem(DISABLE_KEY) === '1'
    } catch (error) {
      return false
    }
  }

  /* ---------------------------------------------------------------- 词表 */

  const exact = new Map()
  const collapsed = new Map()
  for (const key of Object.keys(DICT)) {
    const value = DICT[key]
    if (!value) continue
    exact.set(key, value)
    const norm = key.replace(SPACE, ' ').trim()
    if (!collapsed.has(norm)) collapsed.set(norm, value)
  }

  const COUNT_UNITS = {
    chats: '个对话',
    threads: '个会话',
    projects: '个项目',
    agents: '个智能体',
    subagents: '个子智能体',
    models: '个模型',
    messages: '条消息',
    turns: '轮',
    files: '个文件',
    folders: '个文件夹',
    lines: '行',
    steps: '个步骤',
    tools: '个工具',
    skills: '个技能',
    plugins: '个插件',
    servers: '个服务器',
    results: '条结果',
    matches: '条匹配',
    errors: '个错误',
    warnings: '个警告',
    checks: '项检查',
    images: '张图片',
    videos: '个视频',
    documents: '份文档',
    branches: '个分支',
    commits: '个提交',
    sessions: '个会话',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒',
    days: '天',
    weeks: '周',
    months: '个月',
    tokens: '个 Token',
    credits: '点额度',
    freebucks: 'Freebucks',
    workspaces: '个工作区',
    tasks: '个任务',
    actions: '个操作',
    items: '项',
    entries: '条',
    rows: '行',
    pages: '页',
    members: '位成员',
    people: '人',
    repos: '个仓库',
    repositories: '个仓库',
    attachments: '个附件',
    shortcuts: '个快捷键',
    characters: '个字符',
  }

  const compiled = []
  for (const rule of RULES) {
    const source = rule[0]
    const target = rule[1]
    let pattern = ''
    for (const ch of source) pattern += ch === '\u0000' ? '(.{1,80}?)' : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    try {
      compiled.push([new RegExp('^' + pattern + '$', 'i'), target])
    } catch (error) {}
  }

  function fill(template, groups) {
    return template.replace(/\{(\d+)\}/g, (whole, index) =>
      groups[Number(index)] === undefined ? whole : groups[Number(index)],
    )
  }

  let recursionDepth = 0

  function inner(rest) {
    if (recursionDepth >= 3) return rest.trim()
    recursionDepth += 1
    try {
      const hit = translateValue(rest)
      return (hit === null ? rest : hit).trim()
    } finally {
      recursionDepth -= 1
    }
  }

  const ELLIPSIS = { '\u2026': '...', '.': '\u2026' }

  function translateValue(raw) {
    if (typeof raw !== 'string' || raw.length === 0) return null
    // 已含中文的字符串（通常是中文项目名被包进英文句式）不做词表查表，
    // 但仍允许走规则，例如“Collapse 汉化项目”→“收起汉化项目”。
    const mixed = CJK.test(raw)
    const lead = raw.match(/^\s*/)[0]
    const trail = raw.match(/\s*$/)[0]
    const core = raw.slice(lead.length, raw.length - trail.length)
    if (core.length === 0) return null

    let out = mixed ? undefined : exact.get(core)
    if (out === undefined && !mixed) out = collapsed.get(core.replace(SPACE, ' ').trim())
    if (out === undefined) {
      const last = core.slice(-1)
      if (ELLIPSIS[last]) {
        const alt = core.slice(0, -1) + ELLIPSIS[last]
        out = exact.get(alt) || collapsed.get(alt)
      }
    }
    if (out === undefined) {
      for (let i = 0; i < compiled.length; i += 1) {
        const match = compiled[i][0].exec(core)
        if (!match) continue
        out = fill(compiled[i][1], match.slice(1).map(inner))
        break
      }
    }
    if (out === undefined && !mixed && /[:：]$/.test(core)) {
      const base = core.slice(0, -1).trim()
      const hit = exact.get(base) || collapsed.get(base)
      if (hit !== undefined) out = hit + '：'
    }
    if (out === undefined && !mixed) {
      const counted = /^([\d][\d,.]*)\s+([A-Za-z][A-Za-z ]*)$/.exec(core)
      if (counted) {
        const unit = COUNT_UNITS[counted[2].toLowerCase().trim()]
        if (unit) out = counted[1] + ' ' + unit
      }
    }
    if (out === undefined) return null
    return lead + out + trail
  }

  /* ---------------------------------------------------------------- 漏译采样 */

  const misses = new Map()
  let applied = 0

  function looksLikeUiText(text) {
    if (text.length < 2 || text.length > 90) return false
    if (!/[A-Za-z]{2,}/.test(text)) return false
    if (!/^[A-Z0-9"'(]/.test(text)) return false
    if (!/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(text) && !/^[A-Z][a-z]{2,}$/.test(text)) return false
    if (/[\\/{}<>=;@#$%^*_|~]/.test(text)) return false
    return true
  }

  function noteMiss(raw) {
    if (misses.size >= 800) return
    const core = raw.replace(SPACE, ' ').trim()
    if (misses.has(core) || !looksLikeUiText(core)) return
    misses.set(core, 1)
  }

  /* ---------------------------------------------------------------- DOM */

  let working = false

  // 不缓存判定结果：元素可能被 React 挪出不翻译的子树（例如把消息从 <pre> 里搬到正文），
  // 缓存住「曾在这个子树里」会让它永远不翻。closest() 本身足够快。
  function skipped(element) {
    if (!element) return false
    return Boolean(element.closest && element.closest(SKIP_SELECTOR))
  }

  function translateTextNode(node) {
    const parent = node.parentElement
    if (!parent) return
    if (SKIP_TAGS.has(parent.tagName)) return
    if (skipped(parent)) return
    const next = parent.tagName === 'TITLE' ? translateTitle(node.nodeValue) : translateValue(node.nodeValue)
    if (next === null || next === node.nodeValue) {
      if (next === null && !working) noteMiss(node.nodeValue)
      return
    }
    working = true
    node.nodeValue = next
    working = false
    applied += 1
  }

  function translateValueAttribute(element) {
    const tag = element.tagName
    if (tag !== 'INPUT') return
    const type = (element.getAttribute('type') || '').toLowerCase()
    if (type !== 'button' && type !== 'submit' && type !== 'reset') return
    const raw = element.getAttribute('value')
    if (!raw) return
    const next = translateValue(raw)
    if (next === null || next === raw) return
    element.setAttribute('value', next)
    applied += 1
  }

  function translateAttributes(element) {
    if (!element.hasAttributes || !element.hasAttributes()) return
    if (skipped(element)) return
    translateValueAttribute(element)
    for (let i = 0; i < ATTRS.length; i += 1) {
      const name = ATTRS[i]
      if (!element.hasAttribute(name)) continue
      const raw = element.getAttribute(name)
      if (!raw) continue
      const next = translateValue(raw)
      if (next === null || next === raw) {
        if (next === null && !working) noteMiss(raw)
        continue
      }
      working = true
      element.setAttribute(name, next)
      working = false
      applied += 1
    }
  }

  function translateTree(root) {
    if (!root) return
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root)
      return
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (SKIP_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT
          if (node.closest && node.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })
    let node = walker.nextNode()
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        translateAttributes(node)
        if (node.shadowRoot) translateTree(node.shadowRoot)
      } else translateTextNode(node)
      node = walker.nextNode()
    }
  }

  function translateTitle(value) {
    if (typeof value !== 'string' || value.length === 0) return null
    const direct = translateValue(value)
    if (direct !== null) return direct
    const parts = value.split(/(\s+[|\u2013\u2014\u00b7-]\s+)/)
    if (parts.length < 3) return null
    let changed = false
    for (let i = 0; i < parts.length; i += 2) {
      const hit = translateValue(parts[i])
      if (hit !== null && hit !== parts[i]) {
        parts[i] = hit
        changed = true
      }
    }
    return changed ? parts.join('') : null
  }

  /* ---------------------------------------------------------------- 调度 */

  let queued = null
  let pending = []
  let pendingSet = new Set()

  function flush() {
    queued = null
    const targets = pending
    pending = []
    pendingSet = new Set()
    for (let i = 0; i < targets.length; i += 1) {
      try {
        translateTree(targets[i])
      } catch (error) {}
    }
  }

  function schedule(target) {
    if (!target) return
    if (pendingSet.has(target)) return
    pendingSet.add(target)
    pending.push(target)
    if (queued !== null) return
    queued = (window.requestIdleCallback || window.requestAnimationFrame || ((fn) => setTimeout(fn, 16)))(flush)
  }

  const nextIdle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn) : (fn) => setTimeout(fn, 16)

  function scanChunked(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (SKIP_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT
          if (node.closest && node.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })
    const step = () => {
      const deadline = performance.now() + 6
      let node = walker.nextNode()
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(node)
        else translateTextNode(node)
        if (performance.now() > deadline) break
        node = walker.nextNode()
      }
      if (node) nextIdle(step)
    }
    step()
  }

  /* ---------------------------------------------------------------- 系统通知 */

  // 通知的 title/body 不走 DOM，页面又是在主世界构造 Notification，隔离世界改 window 无效。
  // 主世界的 shim（resources/freebuff-zh-main.js）通过同步事件把文本递过来，这里作答。
  const NOTIFY_EVENT = 'freebuff-zh:translate'

  function answerNotification() {
    const root = document.documentElement
    if (!root) return
    const raw = root.getAttribute('data-freebuff-zh-in')
    if (raw === null) return
    // 标题可以按分隔符拆段翻（"X — Y" 是标题的常见写法）；正文不拆，
    // 一句没命中就原样返回，避免把 "Build failed – see logs" 拼成半中半英。
    const kind = root.getAttribute('data-freebuff-zh-kind')
    const answer = translateFor(kind === 'body' ? 'body' : 'title', raw)
    root.setAttribute('data-freebuff-zh-out', answer)
  }

  let bridgeInstalled = false

  function installNotificationBridge() {
    if (bridgeInstalled) return
    document.addEventListener(NOTIFY_EVENT, answerNotification, true)
    bridgeInstalled = true
  }

  /* ---------------------------------------------------------------- 启动 */

  let observer = null
  let enabled = !isDisabled()

  function start() {
    if (!enabled || observer) return
    if (document.body.getElementsByTagName('*').length < 1500) translateTree(document.body)
    else scanChunked(document.body)

    const nextTitle = translateTitle(document.title)
    if (nextTitle !== null && nextTitle !== document.title) document.title = nextTitle

    observer = new MutationObserver((mutations) => {
      if (working) return
      for (let i = 0; i < mutations.length; i += 1) {
        const mutation = mutations[i]
        if (mutation.type === 'characterData') {
          schedule(mutation.target)
          continue
        }
        if (mutation.type === 'attributes') {
          schedule(mutation.target)
          continue
        }
        for (let j = 0; j < mutation.addedNodes.length; j += 1) schedule(mutation.addedNodes[j])
      }
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    })

  }

  function dispose() {
    if (observer) observer.disconnect()
    observer = null
    // 升版重注入时，旧引擎的桥要一起撤掉，否则每升一版就多一个 capture 监听。
    if (bridgeInstalled) {
      document.removeEventListener(NOTIFY_EVENT, answerNotification, true)
      bridgeInstalled = false
    }
  }

  function translateFor(kind, text) {
    const raw = String(text)
    const direct = translateValue(raw)
    if (direct !== null) return direct
    if (kind === 'body') return raw
    const titled = translateTitle(raw)
    return titled !== null ? titled : raw
  }

  globalThis.__FREEBUFF_ZH__ = {
    id: PATCH_ID,
    version: PATCH_VERSION,
    entries: exact.size,
    rules: compiled.length,
    stats: () => ({ applied, misses: misses.size, entries: exact.size }),
    dump: () => ({ applied, misses: [...misses.keys()] }),
    translate: (value) => translateValue(value),
    dispose,
    // 运行期开关：关掉立刻停（断开 observer、清空待翻队列），打开则重新扫一遍并接上 observer。
    setEnabled(on) {
      enabled = Boolean(on)
      try {
        if (enabled) window.localStorage.removeItem(DISABLE_KEY)
        else window.localStorage.setItem(DISABLE_KEY, '1')
      } catch (error) {}
      if (!enabled) {
        if (observer) observer.disconnect()
        observer = null
        pending = []
        pendingSet = new Set()
        return false
      }
      if (!observer) start()
      return true
    },
  }

  function boot() {
    // 必须等页面自身的首屏渲染/水合完成后再改文本，否则 React 的水合对比会失败（error #418）。
    const kick = () => {
      if (window.requestIdleCallback) window.requestIdleCallback(() => start(), { timeout: 2000 })
      else setTimeout(start, 250)
    }
    if (document.readyState === 'complete') {
      setTimeout(kick, 1200)
      return
    }
    let scheduled = false
    const go = () => {
      if (scheduled) return
      scheduled = true
      setTimeout(kick, 1200)
    }
    window.addEventListener('load', go, { once: true })
    // load 会被图片、统计脚本拖到十几秒（商店页实测 9 秒还没触发）；给一个 4 秒上限，
    // 到点就开跑：水合在 DOMContentLoaded 后基本已完成，多等这几秒只是防抖。
    setTimeout(go, 4000)
  }

  // 桥要在脚本一落地就挂上：主世界的 shim 可能比首屏翻译更早构造通知。
  try {
    if (document.documentElement) installNotificationBridge()
  } catch (error) {}

  try {
    if (document.body) boot()
    else document.addEventListener('DOMContentLoaded', boot, { once: true })
  } catch (error) {
    if (window.console && console.warn) console.warn('Freebuff 中文补丁：', error && error.message)
  }
})()
