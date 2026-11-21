// 从 git 历史重建「词表改写清单」：每条改写来自哪个提交、原值、现值。
// 产物写进 docs/style-changes.json（进版本库），不依赖 scratch/ 里的临时文件。
// 用法：node tools/style-history.mjs
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '..')
const dictDir = path.join(root, 'dict')

const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })

const commits = git('log', '--reverse', '--pretty=%H\t%ad', '--date=short', '--', 'dict')
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [hash, date] = line.split('\t')
    return { hash, date }
  })

const files = fs.readdirSync(dictDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()

const readAt = (hash, file) => {
  try {
    return JSON.parse(git('show', `${hash}:dict/${file}`))
  } catch (error) {
    return null
  }
}

const previous = new Map()
const changes = []

for (const commit of commits) {
  for (const file of files) {
    const current = readAt(commit.hash, file)
    if (!current) continue
    const before = previous.get(file) || {}
    for (const [key, value] of Object.entries(current)) {
      if (key === '$meta') continue
      const old = before[key]
      if (old !== undefined && old !== value) {
        changes.push({ commit: commit.hash.slice(0, 7), date: commit.date, file, key, was: old, now: value })
      }
    }
    previous.set(file, current)
  }
}

const out = path.join(root, 'docs', 'style-changes.json')
fs.writeFileSync(out, JSON.stringify({ generatedFrom: 'git log -- dict', total: changes.length, changes }, null, 1))
console.log(`改写 ${changes.length} 条，写入 ${out}`)
