// build 的失败路径：词表冲突时必须非零退出、且不写产物（防止带错值的词表被安装）。
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const root = path.join(__dirname, '..')
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'fbzh-build-'))

function stage() {
  for (const dir of ['dict', 'tools', 'src']) fs.mkdirSync(path.join(sandbox, dir), { recursive: true })
  fs.copyFileSync(path.join(root, 'tools', 'build.mjs'), path.join(sandbox, 'tools', 'build.mjs'))
  for (const file of ['engine.js', 'harvest.js', 'main-world.js']) {
    fs.copyFileSync(path.join(root, 'src', file), path.join(sandbox, 'src', file))
  }
  fs.writeFileSync(
    path.join(sandbox, 'package.json'),
    JSON.stringify({ name: 'build-test', version: '9.9.9', type: 'module' }, null, 2),
  )
}

function run() {
  try {
    execFileSync(process.execPath, ['tools/build.mjs'], { cwd: sandbox, encoding: 'utf8', stdio: 'pipe' })
    return 0
  } catch (error) {
    return error.status || 1
  }
}

stage()
fs.writeFileSync(path.join(sandbox, 'dict', '00-a.json'), JSON.stringify({ 'Same line': '同一个' }))
fs.writeFileSync(path.join(sandbox, 'dict', '10-b.json'), JSON.stringify({ 'Same line': '另一个' }))

const conflictCode = run()
const wroteOnConflict = fs.existsSync(path.join(sandbox, 'dist', 'freebuff-zh-cn.js'))

fs.writeFileSync(path.join(sandbox, 'dict', '10-b.json'), JSON.stringify({ 'Same line': '同一个' }))
const okCode = run()
const wroteOnSuccess = fs.existsSync(path.join(sandbox, 'dist', 'freebuff-zh-cn.js'))
const meta = wroteOnSuccess
  ? JSON.parse(fs.readFileSync(path.join(sandbox, 'dist', 'patch-meta.json'), 'utf8'))
  : null

const checks = [
  ['冲突时非零退出', conflictCode !== 0],
  ['冲突时不落盘', wroteOnConflict === false],
  ['无冲突时成功', okCode === 0],
  ['成功时产物版本与 package 一致', meta && meta.version === '9.9.9'],
]

let failed = 0
for (const [name, ok] of checks) {
  if (!ok) failed += 1
  console.log((ok ? 'PASS ' : 'FAIL ') + name)
}
console.log('--- 失败:', failed)
fs.rmSync(sandbox, { recursive: true, force: true })
process.exit(failed ? 1 : 0)
