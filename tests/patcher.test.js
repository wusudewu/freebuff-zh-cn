// 真实 asar 的手术路径回归：apply → verify → restore 一轮往返，文件要逐字节回到原样。
// 用 %LOCALAPPDATA%\FreebuffZh\backup 里的原始包做样本（没有就 SKIP），不去碰正在运行的安装目录。
const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')

const root = path.join(__dirname, '..')
const patchApp = path.join(root, 'tools', 'patch-app.mjs')
const asset = path.join(root, 'dist', 'freebuff-zh-cn.js')
const stateDir = path.join(process.env.LOCALAPPDATA || '', 'FreebuffZh')
const backupRoot = path.join(stateDir, 'backup')

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')

function findOriginalAsar() {
  if (!fs.existsSync(backupRoot)) return null
  const dirs = fs.readdirSync(backupRoot).sort().reverse()
  for (const dir of dirs) {
    const candidate = path.join(backupRoot, dir, 'app.asar')
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

const original = findOriginalAsar()
if (!original) {
  console.log('SKIP 没有找到原始 asar 备份（先安装一次补丁会留下备份）')
  process.exit(0)
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fbzh-patcher-'))
const appDir = path.join(tmp, 'app')
const resources = path.join(appDir, 'resources')
fs.mkdirSync(path.join(resources, 'orchestrator', 'ui'), { recursive: true })
fs.mkdirSync(path.join(resources, 'freebuff-zh'), { recursive: true })

const asar = path.join(resources, 'app.asar')
const html = path.join(resources, 'orchestrator', 'ui', 'index.html')
fs.copyFileSync(original, asar)
fs.writeFileSync(html, '<!doctype html><html><head><title>Freebuff: The free coding agent</title></head><body><div id="root"></div></body></html>')

const originalAsarHash = sha256(fs.readFileSync(asar))
const originalHtmlHash = sha256(fs.readFileSync(html))

function run(command, extra) {
  const args = [patchApp, command, '--app-dir', appDir, ...extra]
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' })
  return { status: result.status, out: result.stdout || '', err: result.stderr || '' }
}

const checks = []
const check = (name, ok, extra) => checks.push({ name, ok, extra })

// 1) apply
const applied = run('apply', ['--asset', asset, '--backup', path.join(tmp, 'backup')])
check('apply 成功', applied.status === 0, applied.err.slice(0, 200))

let report = null
const verified = run('verify', ['--asset', asset])
try { report = JSON.parse(verified.out) } catch (error) { report = null }
check('apply 后 verify 通过', report && report.ok === true, report && JSON.stringify(report.problems || []).slice(0, 200))
check('界面入口出现成对 marker', fs.readFileSync(html, 'utf8').includes('<!-- freebuff-zh:start -->'))
check('asar 里出现注入标记', report && report.hostedMarkers === 1)
check('原生文案锚点全部替换', report && report.anchors > 0 && report.missing === 0 && report.residual === 0, report && `anchors=${report.anchors} missing=${report.missing} residual=${report.residual}`)

// 2) restore
const restored = run('restore', ['--backup', path.join(tmp, 'backup')])
check('restore 成功', restored.status === 0, restored.err.slice(0, 200))
check('app.asar 逐字节回到原样', sha256(fs.readFileSync(asar)) === originalAsarHash)
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
