// 真实 asar 的手术路径回归：apply → verify → restore 一轮往返，文件要逐字节回到原样。
// 优先用 %LOCALAPPDATA%\FreebuffZh\backup 里的原始包（最真实）；没有备份时用原生文案表
// 合成一个最小 asar，保证在别的机器/CI 上也能真跑，而不是 SKIP 出一盏绿灯。
const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const { pathToFileURL } = require('url')

const root = path.join(__dirname, '..')
const patchApp = path.join(root, 'tools', 'patch-app.mjs')
const distAsset = path.join(root, 'dist', 'freebuff-zh-cn.js')
const stateDir = path.join(process.env.LOCALAPPDATA || '', 'FreebuffZh')
const backupRoot = path.join(stateDir, 'backup')

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')

function findOriginalAsar() {
  if (process.env.FBZH_FORCE_SYNTH) return null
  if (!fs.existsSync(backupRoot)) return null
  for (const dir of fs.readdirSync(backupRoot).sort().reverse()) {
    const candidate = path.join(backupRoot, dir, 'app.asar')
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

async function buildSyntheticAsar(dest) {
  const tables = await import(pathToFileURL(path.join(root, 'tools', 'edit-tables.mjs')).href)
  const asar = await import(pathToFileURL(path.join(root, 'tools', 'asar.mjs')).href)

  // 每张表的 needle 都是代码片段（不是完整语句），所以放进注释里：既保证文件能被 vm.Script 解析，
  // 又让替换照常发生。needle 里没有 /* 或 */，注释包裹是安全的。
  const fields = new Map()
  const push = (file, needle, count) => {
    const list = fields.get(file) || []
    for (let i = 0; i < count; i += 1) list.push(needle)
    fields.set(file, list)
  }
  for (const [needle, , count] of tables.MENU_EDITS) push('electron/app-menu.cjs', needle, count)
  for (const [needle, , count] of tables.ZOOM_EDITS) push('electron/zoom-menu.cjs', needle, count)
  for (const [file, edits] of Object.entries(tables.DIALOG_EDITS)) {
    for (const [needle, , count] of edits) push(file, needle, count)
  }
  // 注入锚点必须在真实语句里，注入块才能插进来。
  fields.set('electron/hosted-workspace.cjs', [
    ...(fields.get('electron/hosted-workspace.cjs') || []),
    '      attachWindow(win)',
  ])

  const NL = String.fromCharCode(10)
  const contents = new Map()
  for (const [file, needles] of fields) {
    if (file.endsWith('.html')) {
      contents.set(file, Buffer.from(needles.join(NL) + NL, 'utf8'))
      continue
    }
    const anchor = needles.filter((needle) => needle.trim() === 'attachWindow(win)')
    const rest = needles.filter((needle) => needle.trim() !== 'attachWindow(win)')
    const body = anchor.length ? `function __freebuffAnchor(win) {${NL}${anchor.join(NL)}${NL}}${NL}` : `function __freebuffPlaceholder() {}${NL}`
    const comment = rest.length ? `/*${NL}${rest.join(NL)}${NL}*/${NL}` : ''
    contents.set(file, Buffer.from(body + comment, 'utf8'))
  }
  contents.set('package.json', Buffer.from(JSON.stringify({ name: 'freebuff', version: '0.0.0-test' }, null, 2) + NL, 'utf8'))

  const header = { files: {} }
  for (const rel of contents.keys()) {
    const parts = rel.split('/')
    let node = header
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (!node.files[parts[i]]) node.files[parts[i]] = { files: {} }
      node = node.files[parts[i]]
    }
    node.files[parts[parts.length - 1]] = { size: 0, offset: '0' }
  }

  asar.writeAsar(dest, header, contents)
}

async function main() {
  const original = findOriginalAsar()
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fbzh-patcher-'))
  const appDir = path.join(tmp, 'app')
  const resources = path.join(appDir, 'resources')
  fs.mkdirSync(path.join(resources, 'orchestrator', 'ui'), { recursive: true })
  fs.mkdirSync(path.join(resources, 'freebuff-zh'), { recursive: true })

  // 把脚本复制到隔离目录，避免 patch-app 读到仓库里的 main-strings.json
  //（那份表对应真实 asar 的十个文件，合成样本里没有它们）。
  const assetDir = path.join(tmp, 'assets')
  fs.mkdirSync(assetDir, { recursive: true })
  const asset = path.join(assetDir, 'freebuff-zh-cn.js')
  fs.copyFileSync(distAsset, asset)
  fs.copyFileSync(path.join(root, 'dist', 'freebuff-zh-main.js'), path.join(assetDir, 'freebuff-zh-main.js'))

  const asarPath = path.join(resources, 'app.asar')
  const html = path.join(resources, 'orchestrator', 'ui', 'index.html')

  if (original) {
    fs.copyFileSync(original, asarPath)
    console.log('样本：本机备份的原始 app.asar')
  } else {
    await buildSyntheticAsar(asarPath)
    console.log('样本：合成的 asar（本机没有备份）')
  }
  fs.writeFileSync(html, '<!doctype html><html><head><title>Freebuff: The free coding agent</title></head><body><div id="root"></div></body></html>')

  const originalAsarHash = sha256(fs.readFileSync(asarPath))
  const originalHtmlHash = sha256(fs.readFileSync(html))

  const run = (command, extra) => {
    const result = spawnSync(process.execPath, [patchApp, command, '--app-dir', appDir, ...extra], { encoding: 'utf8' })
    return { status: result.status, out: result.stdout || '', err: result.stderr || '' }
  }

  const checks = []
  const check = (name, ok, extra) => checks.push({ name, ok, extra })

  const applied = run('apply', ['--asset', asset, '--backup', path.join(tmp, 'backup')])
  check('apply 成功', applied.status === 0, applied.err.slice(0, 200))

  let report = null
  try { report = JSON.parse(run('verify', ['--asset', asset]).out) } catch (error) { report = null }
  check('apply 后 verify 通过', report && report.ok === true, report && JSON.stringify(report.problems || []).slice(0, 200))
  check('界面入口出现成对 marker', fs.readFileSync(html, 'utf8').includes('<!-- freebuff-zh:start -->'))
  check('asar 里出现注入标记', report && report.hostedMarkers === 1)
  check(
    '原生文案锚点全部替换',
    report && report.anchors > 0 && report.missing === 0 && report.residual === 0,
    report && `anchors=${report.anchors} missing=${report.missing} residual=${report.residual}`,
  )

  const restored = run('restore', ['--backup', path.join(tmp, 'backup')])
  check('restore 成功', restored.status === 0, restored.err.slice(0, 200))
  check('app.asar 逐字节回到原样', sha256(fs.readFileSync(asarPath)) === originalAsarHash)
  check('index.html 逐字节回到原样', sha256(fs.readFileSync(html)) === originalHtmlHash)
  check('还原后脚本文件已删除', !fs.existsSync(path.join(resources, 'freebuff-zh', 'freebuff-zh-cn.js')))

  let failed = 0
  for (const { name, ok, extra } of checks) {
    if (!ok) failed += 1
    console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !extra ? '' : ` (${extra})`))
  }
  console.log('--- 失败:', failed)
  fs.rmSync(tmp, { recursive: true, force: true })
  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error('失败', error && error.message)
  process.exit(1)
})
