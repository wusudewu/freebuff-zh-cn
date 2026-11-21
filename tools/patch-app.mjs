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
  try {
    new vm.Script(patchedHosted, { filename: HOSTED_MODULE })
  } catch (error) {
    throw new Error(`注入后的 ${HOSTED_MODULE} 语法错误: ${error.message}`)
  }
  contents.set(hostedIndex, Buffer.from(patchedHosted, 'utf8'))

  const tempAsar = asarPath + '.zh-new'
  writeAsar(tempAsar, header, contents)

  const check = loadContents(tempAsar)
  const roundTrip = check.contents.get(hostedIndex).toString('utf8')
  if (roundTrip !== patchedHosted) throw new Error('重新打包后读取的模块内容不一致')
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
