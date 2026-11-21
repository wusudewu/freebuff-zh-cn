// 生成主进程字符串本地化表：dist/main-strings.json
// 对每条英文原文断言在目标文件里出现的次数，安装器按次数替换，命中数不符即中止。
import fs from 'node:fs'
import path from 'node:path'
import { loadContents } from './asar.mjs'

// 默认读安装目录；装好后要重新生成请传原始备份：node tools/gen-main-strings.mjs <原始 app.asar>
const asarPath =
  process.argv[2] ||
  path.join(process.env.LOCALAPPDATA || '', 'Programs', '@codebufffreebuff-desktop', 'resources', 'app.asar')
const { contents } = loadContents(asarPath)

const MAP = {
  'electron/browser-native.cjs': {
    'Inspect element': '检查元素',
    'Freebuff Browser': 'Freebuff 浏览器',
    'Import signed-in browser sessions': '导入已登录的浏览器会话',
    'Choose a browser profile to copy into this Freebuff profile.': '选择一个浏览器配置文件，复制到这个 Freebuff 配置文件里。',
    'Clear this browser profile’s site data?': '清除这个浏览器配置文件的网站数据？',
    'Cookies and site storage will be removed. Sites in this Freebuff browser profile will sign out.':
      '将删除 Cookie 和网站存储，这个 Freebuff 浏览器配置文件里的站点会退出登录。',
    'Its cookies, site data and imported extensions will be removed.': '它的 Cookie、网站数据和已导入的扩展都会被删除。',
    'Import browser cookies (Netscape cookies.txt or JSON)': '导入浏览器 Cookie（Netscape cookies.txt 或 JSON）',
  },
  'electron/discord-presence.cjs': {
    'Get Freebuff': '获取 Freebuff',
  },
  'electron/display-cache-reset.cjs': {
    'Freebuff could not save the request. Nothing was changed.': 'Freebuff 无法保存请求，什么都没有改动。',
    'Cancelled. The graphics caches stay as they are.': '已取消，图形缓存保持不变。',
    'The previous graphics caches come back the next time Freebuff starts.': '下次启动 Freebuff 时会恢复之前的图形缓存。',
    'There is nothing left to undo.': '没有可撤销的内容了。',
  },
  'electron/hosted-workspace.cjs': {
    'Administrator access requested': '请求管理员权限',
    'Publishing stopped before it finished. Check deployment activity in Manage site, then try again.':
      '发布还没完成就停止了。到“管理站点”查看部署动态，然后重试。',
    'Choose project folder': '选择项目文件夹',
    'Open a local project': '打开本地项目',
    'Choose project': '选择项目',
  },
  'electron/main.cjs': {
    'Desktop Lab test': '桌面版实验室测试',
    'Close this chat?': '关闭这个对话？',
    'Mark as unread': '标记为未读',
    'Rename Tab': '重命名标签页',
    'Export as Markdown…': '导出为 Markdown…',
    'Move to New Window': '移到新窗口',
    'Close Tab': '关闭标签页',
  },
  'electron/open-in.cjs': {
    'Copy path': '复制路径',
    'Could not open that path': '无法打开该路径',
  },
  'electron/orchestrator-failure.cjs': {
    'Freebuff is already open': 'Freebuff 已经打开',
    'Freebuff failed to start': 'Freebuff 启动失败',
    'Freebuff stopped': 'Freebuff 已停止',
    'The Freebuff orchestrator failed to start or stopped unexpectedly.': 'Freebuff 的编排服务启动失败，或意外停止了。',
    '~competing with it for your threads.': '不再和它抢你的会话。',
    '~process is still holding the workspace: quit "bun" in ': '进程还占着工作区：在 ',
    '~, then open Freebuff again.': ' 里退出 "bun"，再重新打开 Freebuff。',
    'Another copy of Freebuff has your workspace open, so this one stopped instead of ':
      '另有一份 Freebuff 已经打开了你的工作区，所以这一份停下来了，',
    'If you can see a Freebuff window, use that one. If you cannot, a leftover background ':
      '如果你能看到 Freebuff 窗口，就用那一个。如果看不到，说明还有残留的后台',
  },
  'electron/linux-launch.cjs': {
    'Freebuff could not start a required subprocess.': 'Freebuff 无法启动所需的子进程。',
  },
  'electron/renderer-health.cjs': {
    'Freebuff window stopped': 'Freebuff 窗口已停止',
    'Reload the window to return to your conversation. Reloading does not restart the agent.':
      '重新加载窗口即可回到对话。重新加载不会重启智能体。',
  },
  'electron/updater.cjs': {
    'Freebuff is up to date.': 'Freebuff 已是最新版本。',
    'Couldn’t check for updates.': '无法检查更新。',
    'Check your connection and try again.': '检查网络后重试。',
    'Freebuff will ask to restart when the download finishes.': '下载完成后 Freebuff 会提示重启。',
    'Restart now to update, or Freebuff restarts into it once it has been idle for a minute.':
      '现在重启即可更新；也可以等 Freebuff 空闲一分钟后自动重启。',
    'The update couldn’t be installed.': '更新安装失败。',
    'Move Freebuff to Applications to update it.': '把 Freebuff 移到“应用程序”文件夹后再更新。',
    'Freebuff can’t update itself while it runs from a disk image or Downloads.':
      'Freebuff 在磁盘映像或“下载”目录里运行时无法自我更新。',
  },
}

const out = {}
for (const [file, pairs] of Object.entries(MAP)) {
  const key = [...contents.keys()].find((name) => name.toLowerCase() === file.toLowerCase())
  if (!key) continue
  const source = contents.get(key).toString('utf8')
  const edits = []
  for (const [english, chinese] of Object.entries(pairs)) {
    const fragment = english.startsWith('~')
    const text = fragment ? english.slice(1) : english
    const needle = fragment ? text : "'" + text + "'"
    const count = source.split(needle).length - 1
    if (count === 0) {
      console.log('未命中，跳过:', file, english)
      continue
    }
    edits.push([needle, fragment ? chinese : "'" + chinese + "'", count])
  }
  if (edits.length) out[file] = edits
}

const dest = path.join(import.meta.dirname, '..', 'dist', 'main-strings.json')
fs.writeFileSync(dest, JSON.stringify(out, null, 1))
const total = Object.values(out).reduce((sum, edits) => sum + edits.reduce((n, [, , c]) => n + c, 0), 0)
console.log(`写入 ${dest}：${Object.keys(out).length} 个文件，${total} 处替换`)
