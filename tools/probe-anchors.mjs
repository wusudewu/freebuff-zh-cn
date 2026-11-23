// 版本升级后的结构探针：把安装器依赖的每个锚点/文件在新 asar 里点一遍，报出缺什么。
import fs from 'node:fs'
import path from 'node:path'
import { loadContents } from './asar.mjs'
import { MENU_EDITS, ZOOM_EDITS, DIALOG_EDITS } from './edit-tables.mjs'

const appDir = process.argv[2] || path.join(process.env.LOCALAPPDATA, 'Programs', '@codebufffreebuff-desktop')
const { contents } = loadContents(path.join(appDir, 'resources', 'app.asar'))
const keys = [...contents.keys()]
const find = (name) => keys.find((k) => k.toLowerCase() === name.toLowerCase())

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

const hosted = find('electron/hosted-workspace.cjs')
if (!hosted) problems.push('缺少 electron/hosted-workspace.cjs')
else {
  const src = contents.get(hosted).toString('utf8')
  const anchors = src.split('      attachWindow(win)').length - 1
  if (anchors !== 1) problems.push(`hosted-workspace.cjs: attachWindow 锚点命中 ${anchors} 次`)
}

check('electron/app-menu.cjs', MENU_EDITS)
check('electron/zoom-menu.cjs', ZOOM_EDITS)
for (const [file, edits] of Object.entries(DIALOG_EDITS)) check(file, edits)

const pkg = contents.get('package.json')
console.log('版本:', pkg ? JSON.parse(pkg.toString('utf8')).version : '读不到')
console.log('条目数:', keys.length)
console.log(problems.length ? `结构问题 ${problems.length} 条:` : '锚点全部命中')
for (const problem of problems) console.log('  - ' + problem)
process.exit(problems.length ? 1 : 0)
