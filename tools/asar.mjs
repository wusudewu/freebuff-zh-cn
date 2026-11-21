// Minimal ASAR read/write, no dependencies.
// Format: [uint32 4][uint32 headerPickleSize][uint32 payloadSize][uint32 jsonSize][json][files...]
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ALIGN = 4

export function readAsar(file) {
  const buf = fs.readFileSync(file)
  if (buf.readUInt32LE(0) !== 4) throw new Error('不是有效的 asar 文件（长度前缀不符）')
  const headerPickleSize = buf.readUInt32LE(4)
  const jsonSize = buf.readUInt32LE(12)
  const json = buf.subarray(16, 16 + jsonSize).toString('utf8')
  const header = JSON.parse(json)
  const baseOffset = 8 + headerPickleSize
  return { buf, header, baseOffset }
}

function walk(node, rootPath, out) {
  for (const name of Object.keys(node.files)) {
    const child = node.files[name]
    const rel = rootPath ? `${rootPath}/${name}` : name
    if (child.files) walk(child, rel, out)
    else out.push({ rel, entry: child })
  }
  return out
}

export function listEntries(header) {
  return walk(header, '', [])
}

// Electron 把 unpacked 文件的真实内容放在 app.asar.unpacked/，asar 里的 offset/size 只是占位：
// 按 offset 读出来的是垃圾字节。整体 integrity（macOS 的 asar 完整性校验）也是另一套格式。
// 两种都超出本工具的能力，宁可拒绝，也不写出坏包。
export function assertRepackable(header) {
  if (header.integrity) throw new Error('asar 带整体 integrity 字段（Electron 的 asar 完整性校验），本工具不支持重打包')
  for (const { rel, entry } of listEntries(header)) {
    if (entry.unpacked) throw new Error(`asar 含 unpacked 条目（${rel}），本工具不支持重打包`)
  }
}

// 每个条目的 integrity = { algorithm, hash(整文件), blockSize, blocks[](按块) }，全部小写十六进制。
export function computeIntegrity(data, template) {
  const algorithm = String((template && template.algorithm) || 'sha256').toLowerCase()
  const blockSize = Number((template && template.blockSize) || 4194304)
  const hash = crypto.createHash(algorithm).update(data).digest('hex')
  const blocks = []
  for (let offset = 0; offset < data.length; offset += blockSize) {
    blocks.push(crypto.createHash(algorithm).update(data.subarray(offset, offset + blockSize)).digest('hex'))
  }
  return { ...template, algorithm: template && template.algorithm ? template.algorithm : 'SHA256', hash, blocks }
}

export function checkIntegrity(entry, data) {
  const it = entry.integrity
  if (!it) return true
  const next = computeIntegrity(data, it)
  if (next.hash !== it.hash) return false
  if (next.blocks.length !== (it.blocks || []).length) return false
  return next.blocks.every((block, index) => block === it.blocks[index])
}

// contents: Map<rel, Buffer>
// options.original: Map<rel, Buffer> —— 原包里没被改动的文件保持原 integrity 字段不动，未改动的包可逐字节复原。
export function writeAsar(file, header, contents, options = {}) {
  assertRepackable(header)
  const original = options.original || null
  const entries = listEntries(header)
  let offset = 0
  const chunks = []
  for (const { rel, entry } of entries) {
    const data = contents.get(rel)
    if (!data) throw new Error(`缺少文件内容: ${rel}`)
    if (entry.integrity && original) {
      const before = original.get(rel)
      if (!before || !before.equals(data)) entry.integrity = computeIntegrity(data, entry.integrity)
    }
    entry.size = data.length
    entry.offset = String(offset)
    offset += data.length
    chunks.push(data)
  }
  const body = Buffer.concat(chunks)
  const json = Buffer.from(JSON.stringify(header), 'utf8')
  // Header pickle: [uint32 payloadSize][uint32 jsonLength][json padded to 4]
  // payloadSize counts every byte after itself, so it includes the jsonLength field.
  const jsonPadded = Math.ceil(json.length / ALIGN) * ALIGN
  const payloadSize = 4 + jsonPadded
  const headerSize = 4 + payloadSize
  const pickle = Buffer.alloc(headerSize)
  pickle.writeUInt32LE(payloadSize, 0)
  pickle.writeUInt32LE(json.length, 4)
  json.copy(pickle, 8)
  const prefix = Buffer.alloc(8)
  prefix.writeUInt32LE(4, 0)
  prefix.writeUInt32LE(headerSize, 4)
  fs.writeFileSync(file, Buffer.concat([prefix, pickle, body]))
}

export function unpackTo(file, dir) {
  const { buf, header, baseOffset } = readAsar(file)
  assertRepackable(header)
  for (const { rel, entry } of listEntries(header)) {
    const dest = path.join(dir, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, buf.subarray(baseOffset + Number(entry.offset), baseOffset + Number(entry.offset) + entry.size))
  }
  return header
}

export function loadContents(file) {
  const { buf, header, baseOffset } = readAsar(file)
  const map = new Map()
  const meta = new Map()
  for (const { rel, entry } of listEntries(header)) {
    map.set(rel, buf.subarray(baseOffset + Number(entry.offset), baseOffset + Number(entry.offset) + entry.size))
    meta.set(rel, entry)
  }
  return { header, contents: map, meta }
}
