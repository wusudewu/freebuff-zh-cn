// 安装器错误路径回归：asar 损坏、参数误用、跳过崩溃都要有结论而不是异常。
// 会用到 PowerShell（Windows）；找不到 powershell 时跳过 PS 部分，Node 部分始终运行。
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const root = path.join(__dirname, '..')
const patchApp = path.join(root, 'tools', 'patch-app.mjs')
const ps1 = path.join(root, 'FreebuffZhPatch.ps1')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fbzh-installer-'))

const results = []
const check = (name, ok, extra) => results.push({ name, ok, extra })

function makeBrokenApp() {
  const appDir = path.join(tmp, 'app')
  const resources = path.join(appDir, 'resources')
  fs.mkdirSync(path.join(resources, 'orchestrator', 'ui'), { recursive: true })
  // 200 字节的假 asar：头部 JSON 直接截断，loadContents 会抛「不是有效的 asar」或 JSON 解析错误。
  fs.writeFileSync(path.join(resources, 'app.asar'), Buffer.alloc(200, 0x41))
  fs.writeFileSync(path.join(resources, 'orchestrator', 'ui', 'index.html'), '<html><head></head><body></body></html>')
  return appDir
}

const appDir = makeBrokenApp()

// 1) verify 对损坏的 asar 要给出结论（JSON + 非零退出），而不是抛异常
const jsonFile = path.join(tmp, 'verify.json')
const verify = spawnSync(process.execPath, [patchApp, 'verify', '--app-dir', appDir, '--asset', path.join(root, 'dist', 'freebuff-zh-cn.js'), '--json-out', jsonFile], { encoding: 'utf8', cwd: tmp })
let report = null
try { report = JSON.parse(fs.readFileSync(jsonFile, 'utf8')) } catch (error) { report = null }
check('verify 对损坏 asar 非零退出', verify.status !== 0, `status=${verify.status}`)
check('verify 仍写出 JSON 结论', report !== null)
check('verify 结论说明 asar 读不出来', Boolean(report && (report.problems || []).some((p) => p.includes('读不出来'))), report && JSON.stringify(report.problems))

// 2) 等号形式的参数也要按用法错误处理
const eq = spawnSync(process.execPath, [patchApp, 'verify', '--app-dir', appDir, '--json-out=val'], { encoding: 'utf8', cwd: tmp })
check('--json-out=val 被当成普通值（不误判为缺值）', eq.status === 0 || eq.status === 1, `status=${eq.status}`)
const missing = spawnSync(process.execPath, [patchApp, 'verify', '--app-dir', appDir, '--json-out'], { encoding: 'utf8', cwd: tmp })
check('--json-out 缺值给出用法错误', missing.status === 2 && /需要一个文件路径/.test(missing.stderr || ''), `status=${missing.status}`)

// 3) PowerShell 侧：对损坏 asar 跑 Status，必须是正常结论而不是 NativeCommandError
const hasPowershell = spawnSync('powershell', ['-NoProfile', '-Command', 'exit 0']).status === 0
if (hasPowershell) {
  // 用 -Command 包一层并先把控制台设成 UTF-8，否则 PS 5.1 按 GBK 写中文，断言会看到乱码。
  const command = `[Console]::OutputEncoding=[Text.Encoding]::UTF8; & '${ps1}' -Action Status -AppDir '${appDir}'`
  const status = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], { encoding: 'utf8' })
  const out = `${status.stdout || ''}${status.stderr || ''}`
  check('Status 不再抛 NativeCommandError', !/NativeCommandError/.test(out))
  check('Status 退出码为 0', status.status === 0, `status=${status.status}`)
  check('Status 指出 asar 已损坏', /损坏|读不出来/.test(out), out.split('\n').filter((l) => /损坏|读不出来/.test(l)).join(' | ').slice(0, 160))
} else {
  console.log('SKIP 没有 powershell，跳过安装器脚本侧断言')
}

let failed = 0
for (const { name, ok, extra } of results) {
  if (!ok) failed += 1
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !extra ? '' : ` (${extra})`))
}
console.log('--- 失败:', failed)
fs.rmSync(tmp, { recursive: true, force: true })
process.exit(failed ? 1 : 0)
