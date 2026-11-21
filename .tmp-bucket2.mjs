import path from 'node:path'
import { loadContents, writeAsar } from './tools/asar.mjs'

const asar = path.join(process.env.LOCALAPPDATA, 'Programs', '@codebufffreebuff-desktop', 'resources', 'app.asar')
const { header, contents } = loadContents(asar)
const key = [...contents.keys()].find((k) => k.toLowerCase() === 'electron/app-menu.cjs')
const src = contents.get(key).toString('utf8')
if (src.split("label: '检查更新…'").length - 1 !== 2) throw new Error('标签数量变了')
contents.set(key, Buffer.from(src.split("label: '检查更新…'").join("label: 'Check for Updates…'"), 'utf8'))
writeAsar(asar, header, contents)
console.log('两处英文标签都塞回去了')
