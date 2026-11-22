// 把 dict/*.json 合并成一张词表，并注入 src/engine.js 模板，产出 dist/freebuff-zh-cn.js
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dictDir = path.join(root, 'dict')
const distDir = path.join(root, 'dist')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/
const files = fs.readdirSync(dictDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

const merged = new Map()
const conflicts = []
const rules = []
let sources = 0

for (const file of files.sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(dictDir, file), 'utf8'))
  for (const [key, value] of Object.entries(data)) {
    if (key === '$meta') continue
    sources += 1
    const en = key.replace(/\s+/g, ' ').trim()
    if (!en) throw new Error(`${file}: 空键`)
    if (CJK.test(en)) throw new Error(`${file}: 英文键里有中文 -> ${en}`)
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${file}: 空译文 -> ${en}`)
    if (!CJK.test(value) && !/^[\x20-\x7e\u00d7]*$/.test(value)) throw new Error(`${file}: 译文既不是中文也不是 ASCII -> ${en}`)
    if (merged.has(en) && merged.get(en) !== value) {
      conflicts.push({ file, en, was: merged.get(en), now: value })
      continue
    }
    merged.set(en, value)
  }
}

const ruleFile = path.join(dictDir, '_rules.json')
if (fs.existsSync(ruleFile)) {
  const data = JSON.parse(fs.readFileSync(ruleFile, 'utf8'))
  for (const rule of data.rules || []) {
    const from = String(rule.from || '')
    const to = String(rule.to || '')
    if (!from.trim() || !to.trim()) throw new Error(`_rules.json: 规则不完整 -> ${JSON.stringify(rule)}`)
    rules.push([from.replace(/\{(\d+)\}/g, '\u0000'), to])
  }
}

const dict = {}
for (const key of [...merged.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) dict[key] = merged.get(key)

const template = fs.readFileSync(path.join(root, 'src', 'engine.js'), 'utf8')
// 替换值一律走函数形式：字符串形式的 replacement 会把译文里的 $&、$`、$'、$1 当捕获组引用吃掉。
const out = template
  .replaceAll('__PATCH_VERSION__', () => pkg.version)
  .replace('__DICT__', () => JSON.stringify(dict))
  .replace('__RULES__', () => JSON.stringify(rules))

if (out.includes('__DICT__') || out.includes('__RULES__') || out.includes('__PATCH_VERSION__')) {
  throw new Error('模板占位符没有被全部替换')
}

// 冲突意味着同一句英文有两个译法、先到先得静默丢一个：这种词表不该被安装。
if (conflicts.length) {
  for (const conflict of conflicts) {
    console.error('CONFLICT', conflict.file, JSON.stringify(conflict.en), '=>', conflict.was, '|', conflict.now)
  }
  throw new Error(`词表冲突 ${conflicts.length} 条：请先消歧，构建未落盘`)
}

fs.mkdirSync(distDir, { recursive: true })
const engineOut = path.join(distDir, 'freebuff-zh-cn.js')
fs.writeFileSync(engineOut, out)
fs.copyFileSync(path.join(root, 'src', 'harvest.js'), path.join(distDir, 'harvest.js'))
fs.copyFileSync(path.join(root, 'src', 'main-world.js'), path.join(distDir, 'freebuff-zh-main.js'))
fs.writeFileSync(
  path.join(distDir, 'patch-meta.json'),
  JSON.stringify({ version: pkg.version, entries: Object.keys(dict).length, rules: rules.length }, null, 2) + String.fromCharCode(10),
)

// 版本号三处（package.json / patch-meta.json / 产物内嵌）必须一致，否则装的是别的版本。
const embedded = fs.readFileSync(engineOut, 'utf8').match(/const PATCH_VERSION = '([^']*)'/)
const meta = JSON.parse(fs.readFileSync(path.join(distDir, 'patch-meta.json'), 'utf8'))
const versions = { package: pkg.version, meta: meta.version, engine: embedded ? embedded[1] : null }
if (versions.meta !== versions.package || versions.engine !== versions.package) {
  throw new Error(`版本号不一致: ${JSON.stringify(versions)}`)
}

console.log(`词表 ${Object.keys(dict).length} 条（源 ${sources} 条，冲突 ${conflicts.length}），规则 ${rules.length} 条`)
console.log(`输出 dist/freebuff-zh-cn.js ${(out.length / 1024).toFixed(1)} KB，版本 ${versions.engine}（三处一致）`)
