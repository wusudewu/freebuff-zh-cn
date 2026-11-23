// 版本升级后的结构探针：把安装器依赖的每个锚点/文件在新 asar 里点一遍，报出缺什么。
// 用法：
//   node tools/probe-anchors.mjs                     # 默认安装目录（只在安装前/还原后跑）
//   node tools/probe-anchors.mjs --asar <app.asar>   # 指定原始包（备份目录里的那份）
//   node tools/probe-anchors.mjs --dir <应用目录>
// 注意：对**已打补丁**的 asar 跑没有意义（英文锚点已被换成中文），脚本会直接拒绝并提示去用备份包。
import fs from 'node:fs'
import path from 'node:path'
import { loadContents } from './asar.mjs'
import { MENU_EDITS, ZOOM_EDITS, DIALOG_EDITS } from './edit-tables.mjs'

const argv = process.argv.slice(2)
const argValue = (name) => {
  const index = argv.indexOf(name)
  if (index >= 0) return argv[index + 1]
  const inline = argv.find((arg) => arg.startsWith(`${name}=`))
  return inline ? inline.slice(name.length + 1) : null
}

const explicitAsar = argValue('--asar')
const explicitDir = argValue('--dir')
const appDir = explicitDir || path.join(process.env.LOCALAPPDATA || '', 'Programs', '@codebufffreebuff-desktop')
const asarPath = explicitAsar || path.join(appDir, 'resources', 'app.asar')

if (!fs.existsSync(asarPath)) {
  console.error(`找不到 asar: ${asarPath}`)
  process.exit(2)
}

const { contents } = loadContents(asarPath)
const keys = [...contents.keys()]
const find = (name) => keys.find((k) => k.toLowerCase() === name.toLowerCase())

const hostedKey = find('electron/hosted-workspace.cjs')
if (hostedKey) {
  const src = contents.get(hostedKey).toString('utf8')
  if (src.includes('/* freebuff-zh:start */')) {
    console.error('这个 asar 已经打过补丁（英文锚点已被替换成中文），对它做锚点探针没有意义。')
    console.error('请对原始包运行，例如：')
    console.error('  node tools/probe-anchors.mjs --asar "%LOCALAPPDATA%\\FreebuffZh\\backup\\<版本-时间>\\app.asar"')
    console.error('或者先「恢复英文.cmd」还原后再对安装目录跑。')
    process.exit(2)
  }
}

const problems = []
const check = (file, edits) => {
  const key = find(file)
  if (!key) {
    problems.push(`缺少文件 ${file}`)
    return
  }
  const src = contents.get(key).toString('utf8')
  for (const [needle, , expected] of edits) {
    const count = src.split(needle).length - 1
    if (count !== expected) problems.push(`${file}: 锚点 ${JSON.stringify(needle.slice(0, 60))} 命中 ${count} 次（期望 ${expected}）`)
  }
}

if (!hostedKey) problems.push('缺少 electron/hosted-workspace.cjs')
else {
  const anchors = contents.get(hostedKey).toString('utf8').split('      attachWindow(win)').length - 1
  if (anchors !== 1) problems.push(`hosted-workspace.cjs: attachWindow 锚点命中 ${anchors} 次`)
}

check('electron/app-menu.cjs', MENU_EDITS)
check('electron/zoom-menu.cjs', ZOOM_EDITS)
for (const [file, edits] of Object.entries(DIALOG_EDITS)) check(file, edits)

const pkg = contents.get('package.json')
console.log(`样本: ${asarPath}`)
console.log('版本:', pkg ? JSON.parse(pkg.toString('utf8')).version : '读不到')
console.log('条目数:', keys.length)
console.log(problems.length ? `结构问题 ${problems.length} 条:` : '锚点全部命中')
for (const problem of problems) console.log('  - ' + problem)
process.exit(problems.length ? 1 : 0)
