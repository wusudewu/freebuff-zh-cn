// 安装器的文件手术层：两处注入 + 几张原生文案表，全部带成对 marker、锚点断言、语法门与哈希。
// 用法（由 FreebuffZhPatch.ps1 调用）：
//   node tools/patch-app.mjs apply   --app-dir <dir> --asset <js> --backup <dir>
//   node tools/patch-app.mjs restore --app-dir <dir> --backup <dir>
//   node tools/patch-app.mjs refresh --app-dir <dir> --asset <js>
//   node tools/patch-app.mjs verify  --app-dir <dir>
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import vm from 'node:vm'
import { loadContents, writeAsar, listEntries, assertRepackable, checkIntegrity } from './asar.mjs'

const HTML_START = '<!-- freebuff-zh:start -->'
const HTML_END = '<!-- freebuff-zh:end -->'
const JS_START = '/* freebuff-zh:start */'
const JS_END = '/* freebuff-zh:end */'

const HOSTED_MODULE = 'electron/hosted-workspace.cjs'
const SHELL_HTML = 'orchestrator/ui/index.html'
const SHELL_ASSET = 'orchestrator/ui/freebuff-zh-cn.js'
const HOSTED_ASSET = 'freebuff-zh/freebuff-zh-cn.js'
const MAIN_ASSET = 'freebuff-zh/freebuff-zh-main.js'
const HARVEST_ASSET = 'freebuff-zh/harvest.js'

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
const jsonOut = args['json-out']
if (args['json-out'] !== undefined && (!jsonOut || String(jsonOut).startsWith('--'))) {
  console.error('--json-out 需要一个文件路径')
  process.exit(2)
}
const command = args._[0]
const appDir = args['app-dir']
if (!command || !appDir) {
  console.error('用法: patch-app.mjs <apply|restore|refresh|verify> --app-dir <目录> [--asset <js>] [--backup <目录>]')
  process.exit(2)
}

const resourcesDir = path.join(appDir, 'resources')
const asarPath = path.join(resourcesDir, 'app.asar')
const shellHtmlPath = path.join(resourcesDir, ...SHELL_HTML.split('/'))
const shellAssetPath = path.join(resourcesDir, ...SHELL_ASSET.split('/'))
const hostedAssetPath = path.join(resourcesDir, ...HOSTED_ASSET.split('/'))
const mainAssetPath = path.join(resourcesDir, ...MAIN_ASSET.split('/'))
const harvestAssetPath = path.join(resourcesDir, ...HARVEST_ASSET.split('/'))

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
    "        const zhMainAsset = zhPath.join(zhDir, 'freebuff-zh-main.js')",
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
    '          try {',
    "            const zhMainSource = zhFs.readFileSync(zhMainAsset, 'utf8')",
    '            win.webContents.executeJavaScript(zhMainSource, true).then(',
    "              () => zhLog('main shim ready'),",
    "              (error) => zhLog('main shim failed: ' + (error && error.message)),",
    '            )',
    '          } catch (error) {',
    "            zhLog('main shim threw: ' + (error && error.message))",
    '          }',
    '          if (!zhDebug) return',
    '          let rounds = 0',
    '          if (zhDumpTimer) clearInterval(zhDumpTimer)',
    '          const timer = setInterval(() => {',
    '            rounds += 1',
    '            if (rounds > 8 || win.isDestroyed()) {',
    '              clearInterval(timer)',
    '              zhDumpTimer = null',
    '              return',
    '            }',
    '            const dumpCode = ' + "'(globalThis.__FREEBUFF_ZH__ && __FREEBUFF_ZH__.dump()) || null'",
    '            win.webContents',
    '              .executeJavaScriptInIsolatedWorld(1001, [{ code: dumpCode }])',
    "              .then((dump) => zhLog('dump ' + win.webContents.getURL() + ' ' + JSON.stringify(dump)), () => {})",
    '              .catch(() => {})',
    '          }, 10000)',
    '          zhDumpTimer = timer',
    '        }',
    '        let zhHarvestDone = false',
    "        const zhHarvest = () => {",
    '          if (zhHarvestDone) return',
    "          if (!zhFs.existsSync(zhPath.join(zhStateDir, 'harvest'))) return",
    '          zhHarvestDone = true',
    '          try {',
    "            const zhCode = zhFs.readFileSync(zhPath.join(zhDir, 'harvest.js'), 'utf8')",
    '            setTimeout(() => {',
    '              if (win.isDestroyed()) return',
    '              win.webContents.executeJavaScriptInIsolatedWorld(1001, [{ code: zhCode }]).then(',
    "                (result) => {",
    "                  zhFs.writeFileSync(zhPath.join(zhStateDir, 'harvest.json'), JSON.stringify(result, null, 2))",
    "                  try { zhFs.rmSync(zhPath.join(zhStateDir, 'harvest'), { force: true }) } catch (error) {}",
    "                  zhLog('harvest written, marker removed')",
    '                },',
    "                (error) => zhLog('harvest failed: ' + (error && error.message)),",
    '              ).catch(() => {})',
    '            }, 7000)',
    '          } catch (error) {}',
    '        }',
    '        let zhDumpTimer = null',
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

function checkSyntax(source, name) {
  if (!name.endsWith('.cjs') && !name.endsWith('.js') && !name.endsWith('.mjs')) return
  try {
    new vm.Script(source, { filename: name })
  } catch (error) {
    throw new Error(`${name} 语法错误: ${error.message}`)
  }
}

function findKey(contents, name) {
  return [...contents.keys()].find((key) => key.toLowerCase() === name.toLowerCase())
}

// 上游改结构时宁可失败，也不能安安静静少翻一部分。
function requireKey(contents, name) {
  const key = findKey(contents, name)
  if (!key) throw new Error(`app.asar 中找不到 ${name}（Freebuff 可能改了文件结构，需要更新补丁）`)
  return key
}

function editInPlace(contents, key, edits, label) {
  const next = applyEdits(contents.get(key).toString('utf8'), edits, label)
  checkSyntax(next, label)
  contents.set(key, Buffer.from(next, 'utf8'))
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
  const expected = Buffer.isBuffer(data) ? data : Buffer.from(data)
  try {
    fs.writeFileSync(temp, expected)
    const written = fs.readFileSync(temp)
    if (!written.equals(expected)) throw new Error(`写入校验失败: ${file}`)
    fs.renameSync(temp, file)
  } finally {
    if (fs.existsSync(temp)) fs.rmSync(temp, { force: true })
  }
}

function removeStale(dirs) {
  for (const file of dirs) {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true })
  }
}

function copyAssets(assetPath) {
  const asset = fs.readFileSync(assetPath)
  const assetDir = path.dirname(assetPath)
  fs.mkdirSync(path.dirname(shellAssetPath), { recursive: true })
  fs.mkdirSync(path.dirname(hostedAssetPath), { recursive: true })
  atomicWrite(shellAssetPath, asset)
  atomicWrite(hostedAssetPath, asset)
  const mainShim = path.join(assetDir, 'freebuff-zh-main.js')
  if (!fs.existsSync(mainShim)) throw new Error(`找不到主世界脚本: ${mainShim}（先运行 npm run build）`)
  atomicWrite(mainAssetPath, fs.readFileSync(mainShim))
  const harvest = path.join(assetDir, 'harvest.js')
  if (fs.existsSync(harvest)) atomicWrite(harvestAssetPath, fs.readFileSync(harvest))
  return asset
}

function apply() {
  const assetPath = args.asset
  const backupDir = args.backup
  if (!assetPath || !backupDir) throw new Error('apply 需要 --asset 与 --backup')
  if (!fs.existsSync(asarPath)) throw new Error(`找不到 app.asar: ${asarPath}`)
  if (!fs.existsSync(shellHtmlPath)) throw new Error(`找不到界面入口: ${shellHtmlPath}`)
  removeStale([asarPath + '.zh-new', asarPath + '.zh-tmp', shellHtmlPath + '.zh-tmp'])

  const asset = fs.readFileSync(assetPath)
  const shellHtml = fs.readFileSync(shellHtmlPath, 'utf8')
  if (shellHtml.includes(HTML_START)) throw new Error('界面入口已有补丁标记，请先执行还原')

  const { header, contents } = loadContents(asarPath)
  assertRepackable(header)
  const originalContents = new Map(contents)

  const hostedKey = requireKey(contents, HOSTED_MODULE)
  const hostedSource = contents.get(hostedKey).toString('utf8')
  if (hostedSource.includes(JS_START)) throw new Error('app.asar 已有补丁标记，请先执行还原')

  fs.mkdirSync(backupDir, { recursive: true })
  fs.copyFileSync(asarPath, path.join(backupDir, 'app.asar'))
  fs.copyFileSync(shellHtmlPath, path.join(backupDir, 'index.html'))

  const originalIndexHash = sha256(fs.readFileSync(shellHtmlPath))
  const originalAppAsarHash = sha256(fs.readFileSync(asarPath))

  const patchedHtml = patchShellHtml(shellHtml)
  const patchedHosted = patchHostedModule(hostedSource)
  checkSyntax(patchedHosted, HOSTED_MODULE)
  contents.set(hostedKey, Buffer.from(patchedHosted, 'utf8'))

  editInPlace(contents, requireKey(contents, 'electron/app-menu.cjs'), MENU_EDITS, 'electron/app-menu.cjs')
  editInPlace(contents, requireKey(contents, 'electron/zoom-menu.cjs'), ZOOM_EDITS, 'electron/zoom-menu.cjs')

  for (const [file, edits] of Object.entries(DIALOG_EDITS)) {
    editInPlace(contents, requireKey(contents, file), edits, file)
  }

  // 主进程字符串表（由 tools/gen-main-strings.mjs 生成）：同样是锚点断言替换。
  const mainStringsPath = path.join(path.dirname(assetPath), 'main-strings.json')
  let mainStringsFiles = 0
  if (fs.existsSync(mainStringsPath)) {
    const table = JSON.parse(fs.readFileSync(mainStringsPath, 'utf8'))
    for (const [file, edits] of Object.entries(table)) {
      editInPlace(contents, requireKey(contents, file), edits, file)
      mainStringsFiles += 1
    }
  }

  const tempAsar = asarPath + '.zh-new'
  try {
    writeAsar(tempAsar, header, contents, { original: originalContents })
    const check = loadContents(tempAsar)
    for (const [rel, expected] of contents) {
      const actual = check.contents.get(rel)
      if (!actual || !actual.equals(expected)) throw new Error(`重新打包后 ${rel} 内容不一致`)
    }
    if (check.contents.size !== contents.size) throw new Error('重新打包后文件数量不一致')
    for (const { rel, entry } of listEntries(check.header)) {
      if (!checkIntegrity(entry, check.contents.get(rel))) throw new Error(`重新打包后 ${rel} 的 integrity 与内容不符`)
    }
    const roundTrip = check.contents.get(hostedKey).toString('utf8')
    if (roundTrip.split(JS_START).length - 1 !== 1) throw new Error('注入块数量不为 1')
    // 先落脚本与界面壳，再原子替换 asar：asar 是唯一让补丁生效的点，
    // 中途被杀的树会停在「脚本已就位、asar 未打」这种可被 Status 认出的状态。
    copyAssets(assetPath)
    atomicWrite(shellHtmlPath, patchedHtml)
    atomicWrite(asarPath, fs.readFileSync(tempAsar))
  } finally {
    removeStale([tempAsar])
  }

  const result = {
    appVersion: readAppVersion(),
    originalIndexHash,
    patchedIndexHash: sha256(fs.readFileSync(shellHtmlPath)),
    originalAppAsarHash,
    patchedAppAsarHash: sha256(fs.readFileSync(asarPath)),
    assetHash: sha256(asset),
    mainHash: fs.existsSync(mainAssetPath) ? sha256(fs.readFileSync(mainAssetPath)) : null,
    mainStringsFiles,
    backupDir,
  }
  console.log(JSON.stringify(result, null, 2))
}

// 只刷新脚本、不动 asar 的路径：词表改了但补丁版本没变时走这里。
function refresh() {
  const assetPath = args.asset
  if (!assetPath) throw new Error('refresh 需要 --asset')
  if (!fs.existsSync(assetPath)) throw new Error(`找不到汉化脚本: ${assetPath}`)
  const asset = copyAssets(assetPath)
  console.log(
    JSON.stringify(
      {
        assetHash: sha256(asset),
        shell: sha256(fs.readFileSync(shellAssetPath)),
        hosted: sha256(fs.readFileSync(hostedAssetPath)),
        main: sha256(fs.readFileSync(mainAssetPath)),
      },
      null,
      2,
    ),
  )
}

function restore() {
  const backupDir = args.backup
  if (!backupDir) throw new Error('restore 需要 --backup')
  const backupAsar = path.join(backupDir, 'app.asar')
  const backupHtml = path.join(backupDir, 'index.html')
  if (!fs.existsSync(backupAsar) || !fs.existsSync(backupHtml)) throw new Error(`备份不完整: ${backupDir}`)
  atomicWrite(asarPath, fs.readFileSync(backupAsar))
  atomicWrite(shellHtmlPath, fs.readFileSync(backupHtml))
  for (const file of [shellAssetPath, hostedAssetPath, mainAssetPath, harvestAssetPath]) {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  }
  console.log(JSON.stringify({ restoredIndexHash: sha256(fs.readFileSync(shellHtmlPath)), restoredAppAsarHash: sha256(fs.readFileSync(asarPath)) }, null, 2))
}

function countOf(text, needle) {
  return text.split(needle).length - 1
}

function verify() {
  const report = { ok: true, problems: [], appVersion: readAppVersion(), anchors: 0 }
  const shellHtml = fs.existsSync(shellHtmlPath) ? fs.readFileSync(shellHtmlPath, 'utf8') : ''
  report.shellMarkers = countOf(shellHtml, HTML_START)
  if (report.shellMarkers !== 1) {
    report.ok = false
    report.problems.push(`界面入口标记数量 ${report.shellMarkers}`)
  }

  let hostedMarkers = 0
  const missingFiles = []
  const absent = []
  const residual = []
  let contents = null
  if (!fs.existsSync(asarPath)) {
    report.ok = false
    report.problems.push('找不到 app.asar')
  } else {
    try {
      contents = loadContents(asarPath).contents
    } catch (error) {
      // asar 损坏/被截断时给结论，不要抛出去——安装器那边会把异常当成自检失败。
      report.ok = false
      report.problems.push(`app.asar 读不出来（${error.message}），请重装 Freebuff`)
      contents = null
    }
  }
  if (contents) {
    const hostedKey = findKey(contents, HOSTED_MODULE)
    if (hostedKey) hostedMarkers = countOf(contents.get(hostedKey).toString('utf8'), JS_START)
    report.hostedMarkers = hostedMarkers
    if (hostedMarkers !== 1) {
      report.ok = false
      report.problems.push(`app.asar 注入标记数量 ${hostedMarkers}`)
    }

    // 原生菜单/对话框/主进程文案：检查替换后的中文文案是否真的在文件里。
    const tables = [
      ['electron/app-menu.cjs', MENU_EDITS],
      ['electron/zoom-menu.cjs', ZOOM_EDITS],
      ...Object.entries(DIALOG_EDITS),
    ]
    const mainStringsPath = args.asset
      ? path.join(path.dirname(args.asset), 'main-strings.json')
      : path.join(import.meta.dirname, '..', 'dist', 'main-strings.json')
    if (fs.existsSync(mainStringsPath)) {
      for (const [file, edits] of Object.entries(JSON.parse(fs.readFileSync(mainStringsPath, 'utf8')))) tables.push([file, edits])
    }
    for (const [file, edits] of tables) {
      const key = findKey(contents, file)
      if (!key) {
        missingFiles.push(file)
        continue
      }
      const source = contents.get(key).toString('utf8')
      for (const [needle, replacement] of edits) {
        if (countOf(source, replacement) === 0) {
          // 译文没出现：这条替换整个没生效，只记「缺失」，不再重复记一笔「残留」。
          absent.push(`${file}: ${replacement.slice(0, 40)}`)
          continue
        }
        report.anchors += 1
        if (needle !== replacement && countOf(source, needle) > 0) residual.push(`${file}: ${needle.slice(0, 40)}`)
      }
    }
    if (missingFiles.length) {
      report.ok = false
      report.problems.push(`asar 里找不到 ${missingFiles.length} 个文件（${missingFiles.slice(0, 3).join('；')}）`)
    }
    if (absent.length) {
      report.ok = false
      report.problems.push(`原生文案缺失 ${absent.length} 处（${absent.slice(0, 3).join('；')}）`)
    }
    if (residual.length) {
      report.ok = false
      report.problems.push(`原文残留 ${residual.length} 处（${residual.slice(0, 3).join('；')}）`)
    }
  }
  report.missing = absent.length
  report.residual = residual.length

  const files = { shell: shellAssetPath, hosted: hostedAssetPath, main: mainAssetPath }
  const hashes = {}
  for (const [name, file] of Object.entries(files)) {
    if (!fs.existsSync(file)) {
      report.ok = false
      report.problems.push(`缺少汉化脚本 ${file}`)
      continue
    }
    hashes[name] = sha256(fs.readFileSync(file))
  }
  report.hashes = hashes
  if (hashes.shell && hashes.hosted && hashes.shell !== hashes.hosted) {
    report.ok = false
    report.problems.push('两处汉化脚本不一致（界面壳与 asar 外挂的那份）')
  }
  console.log(JSON.stringify(report, null, 2))
  // 安装器用 --json-out 读结果：绕开 PowerShell 对原生 stderr/stdout 的编码与引号问题。
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2), 'utf8')
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
  else if (command === 'refresh') refresh()
  else if (command === 'verify') verify()
  else throw new Error(`未知命令: ${command}`)
} catch (error) {
  console.error('错误: ' + error.message)
  process.exit(1)
}
