// 覆盖率收集器：本机 8791 端口，接收补丁页面发来的统计信标（1x1 图片请求）。
// 仅监听 127.0.0.1；把每次上报追加到 scratch/beacons.jsonl，并在控制台打印摘要。
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const logDir = path.join(root, 'scratch')
fs.mkdirSync(logDir, { recursive: true })
const logFile = path.join(logDir, 'beacons.jsonl')
const port = Number(process.argv[2] || 8791)

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1')
  if (url.pathname === '/beacon') {
    let payload = null
    try {
      payload = JSON.parse(url.searchParams.get('payload') || 'null')
    } catch (error) {}
    if (payload) {
      fs.appendFileSync(logFile, JSON.stringify({ at: new Date().toISOString(), ...payload }) + '\n')
      const samples = (payload.samples || []).slice(0, 12).join(' | ')
      console.log(
        `[beacon] applied=${payload.applied} misses=${payload.misses} elements=${payload.elements} entries=${payload.entries} href=${payload.href}`,
      )
      if (samples) console.log(`[misses ] ${samples}`)
    }
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    res.writeHead(200, { 'content-type': 'image/gif', 'cache-control': 'no-store' })
    res.end(pixel)
    return
  }
  res.writeHead(404)
  res.end('not found')
})

server.listen(port, '127.0.0.1', () => console.log(`collector listening on http://127.0.0.1:${port} -> ${logFile}`))
