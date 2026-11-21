// 主世界小补丁：页面自己的代码在主世界构造 Notification，隔离世界的 window 够不到，
// 所以由注入钩子把它放进主世界，翻译请求再通过「DOM 属性 + 同步事件」问隔离世界的引擎。
;(() => {
  'use strict'
  if (window.__freebuffZhMain) return
  window.__freebuffZhMain = true

  const IN = 'data-freebuff-zh-in'
  const OUT = 'data-freebuff-zh-out'
  const KIND = 'data-freebuff-zh-kind'
  const EVENT = 'freebuff-zh:translate'

  // 两个世界不共享 JS 对象，字符串只能借 DOM 属性往返；dispatchEvent 是同步的，
  // 隔离世界处理完才返回，所以这里读得到答案。
  const ask = (text, kind) => {
    if (typeof text !== 'string' || !text) return text
    const root = document.documentElement
    if (!root) return text
    let answer = null
    try {
      root.setAttribute(IN, text)
      root.setAttribute(KIND, kind)
      document.dispatchEvent(new Event(EVENT))
      answer = root.getAttribute(OUT)
    } catch (error) {
      answer = null
    } finally {
      root.removeAttribute(IN)
      root.removeAttribute(OUT)
      root.removeAttribute(KIND)
    }
    return typeof answer === 'string' && answer.length > 0 ? answer : text
  }

  const Native = window.Notification
  if (typeof Native !== 'function' || Native.__freebuffZh) return

  const wrapped = new Proxy(Native, {
    construct(target, args) {
      const title = args[0]
      const options = args[1]
      const nextTitle = typeof title === 'string' ? ask(title, 'title') : title
      let nextOptions = options
      if (options && typeof options === 'object' && typeof options.body === 'string') {
        nextOptions = { ...options, body: ask(options.body, 'body') }
      }
      return Reflect.construct(target, [nextTitle, nextOptions])
    },
  })
  wrapped.__freebuffZh = true
  try {
    window.Notification = wrapped
  } catch (error) {}
})()
