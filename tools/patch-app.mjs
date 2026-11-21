// 安装器的文件手术层：只做两处注入，全部带成对 marker、哈希与锚点断言。
// 用法（由 FreebuffZhPatch.ps1 调用）：
//   node tools/patch-app.mjs apply   --app-dir <dir> --asset <js> --backup <dir>
//   node tools/patch-app.mjs restore --app-dir <dir> --backup <dir>
//   node tools/patch-app.mjs verify  --app-dir <dir>
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import vm from 'node:vm'
import { loadContents, writeAsar } from './asar.mjs'

const HTML_START = '<!-- freebuff-zh:start -->'
const HTML_END = '<!-- freebuff-zh:end -->'
const JS_START = '/* freebuff-zh:start */'
const JS_END = '/* freebuff-zh:end */'

const HOSTED_MODULE = 'electron/hosted-workspace.cjs'
const SHELL_HTML = 'orchestrator/ui/index.html'
const SHELL_ASSET = 'orchestrator/ui/freebuff-zh-cn.js'
const HOSTED_ASSET = 'freebuff-zh/freebuff-zh-cn.js'

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg.startsWith('--')) out[arg.slice(2)] = argv[i + 1]
    else out._.push(arg)
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const command = args._[0]
const appDir = args['app-dir']
if (!command || !appDir) {
  console.error('用法: patch-app.mjs <apply|restore|verify> --app-dir <目录> [--asset <js>] [--backup <目录>]')
  process.exit(2)
}

const resourcesDir = path.join(appDir, 'resources')
const asarPath = path.join(resourcesDir, 'app.asar')
const shellHtmlPath = path.join(resourcesDir, ...SHELL_HTML.split('/'))
const shellAssetPath = path.join(resourcesDir, ...SHELL_ASSET.split('/'))
const hostedAssetPath = path.join(resourcesDir, ...HOSTED_ASSET.split('/'))

function eolOf(text) {
  return text.includes('\r\n') ? '\r\n' : '\n'
}

function injectionBlock(eol) {
  const lines = [
    JS_START,
    '      try {',
    "        const zhFs = require('node:fs')",
    "        const zhPath = require('node:path')",
    "        const zhDir = zhPath.join(process.resourcesPath, 'freebuff-zh')",
    "        const zhAsset = zhPath.join(zhDir, 'freebuff-zh-cn.js')",
    "        const zhStateDir = zhPath.join(process.env.LOCALAPPDATA || '', 'FreebuffZh')",
    "        const zhDebugPath = zhPath.join(zhStateDir, 'debug')",
    "        const zhDebug = zhFs.existsSync(zhDebugPath) || zhFs.existsSync(zhPath.join(zhDir, 'debug'))",
    '        const zhLog = (message) => {',
    '          if (!zhDebug) return',
    '          try {',
    "            zhFs.appendFileSync(zhPath.join(process.env.LOCALAPPDATA || zhDir, 'FreebuffZh', 'debug.log'), new Date().toISOString() + ' ' + message + String.fromCharCode(10))",
    '          } catch (error) {}',
    '        }',
    '        const zhInject = () => {',
    '          if (win.isDestroyed()) return',
    '          try {',
    "            const zhSource = zhFs.readFileSync(zhAsset, 'utf8')",
    '            win.webContents.executeJavaScriptInIsolatedWorld(1001, [{ code: zhSource }]).then(',
    "              () => zhLog('injected ' + win.webContents.getURL()),",
    "              (error) => zhLog('inject failed: ' + (error && error.message)),",
    '            )',
    '            zhLog(' + "'dom-ready '" + ' + win.webContents.getURL())',
    '          } catch (error) {',
    "            zhLog('inject threw: ' + (error && error.message))",
    '          }',
    '          if (!zhDebug) return',
    '          let rounds = 0',
    '          const timer = setInterval(() => {',
    '            rounds += 1',
    '            if (rounds > 8 || win.isDestroyed()) {',
    '              clearInterval(timer)',
    '              return',
    '            }',
    '            const dumpCode = ' + "'(globalThis.__FREEBUFF_ZH__ && __FREEBUFF_ZH__.dump()) || null'",
    '            win.webContents',
    '              .executeJavaScriptInIsolatedWorld(1001, [{ code: dumpCode }])',
    "              .then((dump) => zhLog('dump ' + win.webContents.getURL() + ' ' + JSON.stringify(dump)), () => {})",
    '              .catch(() => {})',
    '          }, 10000)',
    '        }',
    "        const zhHarvest = () => {",
    "          if (!zhFs.existsSync(zhPath.join(zhStateDir, 'harvest'))) return",
    "          try {",
    "            const zhCode = zhFs.readFileSync(zhPath.join(zhDir, 'harvest.js'), 'utf8')",
    "            setTimeout(() => {",
    "              if (win.isDestroyed()) return",
    '              win.webContents.executeJavaScriptInIsolatedWorld(1001, [{ code: zhCode }]).then(',
    "                (result) => zhFs.writeFileSync(zhPath.join(zhStateDir, 'harvest.json'), JSON.stringify(result, null, 2)),",
    "                (error) => zhLog('harvest failed: ' + (error && error.message)),",
    '              ).catch(() => {})',
    '            }, 7000)',
    '          } catch (error) {}',
    '        }',
    "        win.webContents.on('dom-ready', () => { zhInject(); zhHarvest() })",
    '      } catch (error) {}',
    JS_END,
  ]
  return lines.join(eol)
}

function stripMarked(text, start, end) {
  let out = text
  for (;;) {
    const from = out.indexOf(start)
    if (from === -1) return out
    const to = out.indexOf(end, from)
    if (to === -1) return out
    out = out.slice(0, from) + out.slice(to + end.length)
  }
}

function patchHostedModule(source) {
  const stripped = stripMarked(source, JS_START, JS_END)
  const eol = eolOf(stripped)
  const anchor = '      attachWindow(win)' + eol
  const count = stripped.split(anchor).length - 1
  if (count !== 1) throw new Error(`锚点 attachWindow(win) 命中 ${count} 次，拒绝改动`)
  const block = injectionBlock(eol)
  return stripped.replace(anchor, anchor + block + eol)
}

const MENU_EDITS = [
  // 原生菜单：Electron 的 role 只给英文标签，所以既要换 label，也要把整块 editMenu 展开。
  ["label: 'Check for Updates…'", "label: '检查更新…'", 2],
  ["label: 'Settings…'", "label: '设置…'", 2],
  ["label: `Quit ${appName}`", "label: `退出 ${appName}`", 1],
  ["label: 'File'", "label: '文件'", 1],
  ["label: 'New Tab'", "label: '新建标签页'", 1],
  ["label: 'Reopen Closed Tab'", "label: '重新打开关闭的标签页'", 1],
  ["label: 'Open Project…'", "label: '打开项目…'", 1],
  ["label: 'Move Tab to New Window'", "label: '把标签页移到新窗口'", 1],
  ["label: 'Close Tab'", "label: '关闭标签页'", 1],
  ["label: 'Close Window'", "label: '关闭窗口'", 1],
  ["label: 'Quit',", "label: '退出',", 1],
  ["label: 'View'", "label: '视图'", 1],
  ["label: 'Reload App'", "label: '重新加载应用'", 1],
  ["{ role: 'toggleDevTools' }", "{ role: 'toggleDevTools', label: '开发者工具' }", 1],
  ["{ role: 'togglefullscreen' }", "{ role: 'togglefullscreen', label: '切换全屏' }", 1],
  ["label: 'Window', submenu: [{ role: 'minimize' }, { role: 'zoom' }]",
    "label: '窗口', submenu: [{ role: 'minimize', label: '最小化' }, { role: 'zoom', label: '缩放' }]", 1],
  ["label: 'Help'", "label: '帮助'", 1],
  ["{ role: 'editMenu' },",
    "{ label: '编辑', submenu: [" +
      "{ role: 'undo', label: '撤销' }, " +
      "{ role: 'redo', label: '重做' }, " +
      "{ type: 'separator' }, " +
      "{ role: 'cut', label: '剪切' }, " +
      "{ role: 'copy', label: '复制' }, " +
      "{ role: 'paste', label: '粘贴' }, " +
      "{ role: 'selectAll', label: '全选' }] },", 1],
]

const DIALOG_EDITS = {
  'electron/main.cjs': [
    ["title: 'Quit Freebuff?'", "title: '退出 Freebuff？'", 1],
    ["message: 'Freebuff is still working.'", "message: 'Freebuff 还在工作中。'", 1],
    ["detail: 'Any agent still working in this chat will be interrupted.'", "detail: '这个对话里还在工作的智能体会被打断。'", 1],
    ["buttons: ['Cancel', 'Quit anyway']", "buttons: ['取消', '仍然退出']", 1],
    ["title: 'Attach files or folders'", "title: '添加文件或文件夹'", 1],
    ["title: 'Attach images'", "title: '添加图片'", 1],
    ["buttonLabel: 'Attach'", "buttonLabel: '添加'", 2],
    ["title: 'Open a project folder'", "title: '打开项目文件夹'", 1],
    ["buttonLabel: 'Open'", "buttonLabel: '打开'", 1],
    ["title: 'Export thread as Markdown'", "title: '把会话导出为 Markdown'", 1],
    ["title: 'Freebuff failed to start'", "title: 'Freebuff 启动失败'", 1],
    ["dialog.showErrorBox('Freebuff failed to start'", "dialog.showErrorBox('Freebuff 启动失败'", 2],
    ["title: 'Choose a disposable test project'", "title: '选择一个临时测试项目'", 1],
    ["title: 'Test agentic skill in Desktop'", "title: '在桌面版中测试智能体技能'", 1],
  ],
  'electron/hosted-workspace.cjs': [
    ["buttons: ['OK'], noLink: true }", "buttons: ['确定'], noLink: true }", 1],
    ["message: 'This repair is not available here.'", "message: '这个修复在这里不可用。'", 1],
  ],
  'electron/quit-copy.cjs': [
    [
      "'The next time you open Freebuff, interrupted turns continue automatically from their latest ' +",
      "'下次打开 Freebuff 时，被中断的轮次会从最近保存的步骤自动继续。' +",
      1,
    ],
    [
      "'saved step. Completed steps, conversation context, and changes already written to your files are kept.'",
      "'已完成的步骤、对话上下文，以及已经写入文件的改动都会保留。'",
      1,
    ],
    ["`Quitting stops the agents now. ${RESUMES}`", "`现在退出会立刻停止智能体。${RESUMES}`", 1],
    [
      "? `Quitting ends ${sponsoredRuns[0]}’s sponsored task, and it won’t resume.`",
      "? `退出会结束 ${sponsoredRuns[0]} 的赞助任务，且不会恢复。`",
      1,
    ],
    [
      ": `Quitting ends ${sponsoredRuns.length} sponsored tasks, and they won’t resume.`",
      ": `退出会结束 ${sponsoredRuns.length} 个赞助任务，且不会恢复。`",
      1,
    ],
    [
      '`${ends} Any other agents stop too; their interrupted turns continue the next time you open ` +',
      '`${ends} 其他智能体也会停止；被中断的轮次会在下次打开 ` +',
      1,
    ],
    [
      "'Freebuff. Changes already written to your files are kept.'",
      "'Freebuff 时继续。已经写入文件的改动会保留。'",
      1,
    ],
  ],
  'electron/consent-window.html': [
    ['<span id="title">Approve this connector?', '<span id="title">批准这个连接器？', 1],
    ['<summary id="more-label">See the exact instructions', '<summary id="more-label">查看具体指令', 1],
    ['data-sq>Cancel', 'data-sq>取消', 1],
    ['data-sq>Approve', 'data-sq>批准', 1],
  ],
}

const ZOOM_EDITS = [
  ["label: 'Actual Size'", "label: '实际大小'", 1],
  ["label: 'Zoom In'", "label: '放大'", 3],
  ["label: 'Zoom Out'", "label: '缩小'", 1],
]

function applyEdits(source, edits, file) {
  let out = source
  for (const [needle, replacement, expected] of edits) {
    const count = out.split(needle).length - 1
    if (count !== expected) throw new Error(`${file}: 锚点 ${JSON.stringify(needle)} 命中 ${count} 次（应为 ${expected}）`)
    out = out.split(needle).join(replacement)
  }
  return out
}

function patchShellHtml(source) {
  const stripped = stripMarked(source, HTML_START, HTML_END)
  const eol = eolOf(stripped)
  const anchor = '</head>'
  const count = stripped.split(anchor).length - 1
  if (count !== 1) throw new Error(`锚点 </head> 命中 ${count} 次，拒绝改动`)
  const block = HTML_START + '<script src="/freebuff-zh-cn.js" defer></script>' + HTML_END
  return stripped.replace(anchor, '  ' + block + eol + '  ' + anchor)
}

function atomicWrite(file, data) {
  const temp = file + '.zh-tmp'
  fs.writeFileSync(temp, data)
  const written = fs.readFileSync(temp)
  const expected = Buffer.isBuffer(data) ? data : Buffer.from(data)
  if (!written.equals(expected)) throw new Error(`写入校验失败: ${file}`)
  fs.renameSync(temp, file)
}

function apply() {
  const assetPath = args.asset
  const backupDir = args.backup
  if (!assetPath || !backupDir) throw new Error('apply 需要 --asset 与 --backup')
  if (!fs.existsSync(asarPath)) throw new Error(`找不到 app.asar: ${asarPath}`)
  if (!fs.existsSync(shellHtmlPath)) throw new Error(`找不到界面入口: ${shellHtmlPath}`)

  const asset = fs.readFileSync(assetPath)
  const shellHtml = fs.readFileSync(shellHtmlPath, 'utf8')
  if (shellHtml.includes(HTML_START)) throw new Error('界面入口已有补丁标记，请先执行还原')

  const { header, contents } = loadContents(asarPath)
  const hostedIndex = [...contents.keys()].find((key) => key.toLowerCase() === HOSTED_MODULE.toLowerCase())
  if (!hostedIndex) throw new Error(`app.asar 中找不到 ${HOSTED_MODULE}`)
  const hostedSource = contents.get(hostedIndex).toString('utf8')
  if (hostedSource.includes(JS_START)) throw new Error('app.asar 已有补丁标记，请先执行还原')

  fs.mkdirSync(backupDir, { recursive: true })
  fs.copyFileSync(asarPath, path.join(backupDir, 'app.asar'))
  fs.copyFileSync(shellHtmlPath, path.join(backupDir, 'index.html'))

  const originalIndexHash = sha256(fs.readFileSync(shellHtmlPath))
  const originalAppAsarHash = sha256(fs.readFileSync(asarPath))

  const patchedHtml = patchShellHtml(shellHtml)
  const patchedHosted = patchHostedModule(hostedSource)

  const menuKey = [...contents.keys()].find((key) => key.toLowerCase() === 'electron/app-menu.cjs')
  const zoomKey = [...contents.keys()].find((key) => key.toLowerCase() === 'electron/zoom-menu.cjs')
  if (menuKey) contents.set(menuKey, Buffer.from(applyEdits(contents.get(menuKey).toString('utf8'), MENU_EDITS, 'app-menu.cjs'), 'utf8'))
  if (zoomKey) contents.set(zoomKey, Buffer.from(applyEdits(contents.get(zoomKey).toString('utf8'), ZOOM_EDITS, 'zoom-menu.cjs'), 'utf8'))
  for (const [source, name] of [
    [patchedHosted, HOSTED_MODULE],
    [menuKey ? contents.get(menuKey).toString('utf8') : '', 'electron/app-menu.cjs'],
    [zoomKey ? contents.get(zoomKey).toString('utf8') : '', 'electron/zoom-menu.cjs'],
  ]) {
    if (!source) continue
    try {
      new vm.Script(source, { filename: name })
    } catch (error) {
      throw new Error(`注入后的 ${name} 语法错误: ${error.message}`)
    }
  }
  contents.set(hostedIndex, Buffer.from(patchedHosted, 'utf8'))

  for (const [file, edits] of Object.entries(DIALOG_EDITS)) {
    const key = [...contents.keys()].find((name) => name.toLowerCase() === file.toLowerCase())
    if (!key) continue
    contents.set(key, Buffer.from(applyEdits(contents.get(key).toString('utf8'), edits, file), 'utf8'))
  }

  const tempAsar = asarPath + '.zh-new'
  writeAsar(tempAsar, header, contents)

  const check = loadContents(tempAsar)
  const roundTrip = check.contents.get(hostedIndex).toString('utf8')
  if (roundTrip !== contents.get(hostedIndex).toString('utf8')) throw new Error('重新打包后读取的模块内容不一致')
  if (roundTrip.split(JS_START).length - 1 !== 1) throw new Error('注入块数量不为 1')

  atomicWrite(shellHtmlPath, patchedHtml)
  fs.copyFileSync(assetPath, shellAssetPath)
  fs.mkdirSync(path.dirname(hostedAssetPath), { recursive: true })
  fs.copyFileSync(assetPath, hostedAssetPath)
  const harvestPath = path.join(path.dirname(assetPath), 'harvest.js')
  if (fs.existsSync(harvestPath)) fs.copyFileSync(harvestPath, path.join(path.dirname(hostedAssetPath), 'harvest.js'))
  fs.renameSync(tempAsar, asarPath)

  const result = {
    appVersion: readAppVersion(),
    originalIndexHash,
    patchedIndexHash: sha256(fs.readFileSync(shellHtmlPath)),
    originalAppAsarHash,
    patchedAppAsarHash: sha256(fs.readFileSync(asarPath)),
    assetHash: sha256(asset),
    backupDir,
  }
  console.log(JSON.stringify(result, null, 2))
}

function restore() {
  const backupDir = args.backup
  if (!backupDir) throw new Error('restore 需要 --backup')
  const backupAsar = path.join(backupDir, 'app.asar')
  const backupHtml = path.join(backupDir, 'index.html')
  if (!fs.existsSync(backupAsar) || !fs.existsSync(backupHtml)) throw new Error(`备份不完整: ${backupDir}`)
  atomicWrite(asarPath, fs.readFileSync(backupAsar))
  atomicWrite(shellHtmlPath, fs.readFileSync(backupHtml))
  for (const file of [shellAssetPath, hostedAssetPath]) {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  }
  console.log(JSON.stringify({ restoredIndexHash: sha256(fs.readFileSync(shellHtmlPath)), restoredAppAsarHash: sha256(fs.readFileSync(asarPath)) }, null, 2))
}

function verify() {
  const report = { ok: true, problems: [], appVersion: readAppVersion() }
  const shellHtml = fs.existsSync(shellHtmlPath) ? fs.readFileSync(shellHtmlPath, 'utf8') : ''
  const markerCount = shellHtml.split(HTML_START).length - 1
  report.shellMarkers = markerCount
  if (markerCount !== 1) {
    report.ok = false
    report.problems.push(`界面入口标记数量 ${markerCount}`)
  }
  let hostedMarkers = 0
  if (fs.existsSync(asarPath)) {
    const { contents } = loadContents(asarPath)
    const key = [...contents.keys()].find((name) => name.toLowerCase() === HOSTED_MODULE.toLowerCase())
    if (key) hostedMarkers = contents.get(key).toString('utf8').split(JS_START).length - 1
  }
  report.hostedMarkers = hostedMarkers
  if (hostedMarkers !== 1) {
    report.ok = false
    report.problems.push(`app.asar 注入标记数量 ${hostedMarkers}`)
  }
  for (const file of [shellAssetPath, hostedAssetPath]) {
    if (!fs.existsSync(file)) {
      report.ok = false
      report.problems.push(`缺少汉化脚本 ${file}`)
    }
  }
  console.log(JSON.stringify(report, null, 2))
  if (!report.ok) process.exitCode = 1
}

function readAppVersion() {
  try {
    const { contents } = loadContents(asarPath)
    const pkg = contents.get('package.json')
    if (pkg) return JSON.parse(pkg.toString('utf8')).version
  } catch (error) {}
  return null
}

try {
  if (command === 'version') console.log(JSON.stringify({ appVersion: readAppVersion() }, null, 2))
  else if (command === 'apply') apply()
  else if (command === 'restore') restore()
  else if (command === 'verify') verify()
  else throw new Error(`未知命令: ${command}`)
} catch (error) {
  console.error('错误: ' + error.message)
  process.exit(1)
}
