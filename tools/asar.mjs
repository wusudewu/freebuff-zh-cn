// Minimal ASAR read/write, no dependencies.
// Format: [uint32 4][uint32 headerPickleSize][uint32 payloadSize][uint32 jsonSize][json][files...]
import fs from 'node:fs'
import path from 'node:path'

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

function sortKeys(files) {
  // asar keeps insertion order; ours is deterministic already, but sort for stability
  const sorted = {}
  for (const key of Object.keys(files).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) sorted[key] = files[key]
  return files
}

export function writeAsar(file, header, contents) {
  // contents: Map<rel, Buffer>
  const files = header.files
  const entries = listEntries(header)
  let offset = 0
  const chunks = []
  for (const { rel, entry } of entries) {
    const data = contents.get(rel)
    if (!data) throw new Error(`缺少文件内容: ${rel}`)
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
