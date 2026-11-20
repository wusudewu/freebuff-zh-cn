// 一次性词表修订：统一术语、去掉直译腔。改完打印改动条数，并指出没找到的键。
import fs from 'node:fs'
import path from 'node:path'

const dictDir = path.resolve(import.meta.dirname, '..', 'dict')
const fixes = {
  Campaigns: '广告系列',
  'New campaign': '新建广告系列',
  'Campaign assistant': '广告系列助手',
  'Campaign name': '广告系列名称',
  Accounts: '账号',
  'Account changed': '账号已切换',
  'Account standing': '账号状态',
  'Open Account settings': '打开账号设置',
  'Add account': '添加账号',
  'Delete account': '删除账号',
  'Saved to your account.': '已保存到你的账号。',
  'Verify my account': '验证我的账号',
  'Reviewing your account': '正在审核你的账号',
  'Your account is reinstated': '你的账号已恢复',
  'Desktop account changed': '桌面端账号已切换',
  'Buy hours': '购买时长',
  Allowance: '额度',
  'Edited a file': '编辑了文件',
  'No hours returned': '没有返回小时数',
  'Could not dismiss.': '无法忽略。',
  Pinned: '已置顶',
  Unpin: '取消置顶',
  'Toggle left sidebar': '显示或隐藏左侧边栏',
  'Keep Powerful': '保留“Powerful”',
  'Try again to open this page.': '重新打开此页面再试一次。',
  'Try again to open your project.': '重新打开你的项目再试一次。',
  'Smart & Fast': '智能又快速',
  'Smart & fast': '智能又快速',
  'Start from': '起始方式',
  'Untitled dashboard': '无标题仪表盘',
  'Untitled deck': '无标题幻灯片',
  'Untitled design': '无标题设计',
  'Untitled sheet': '无标题表格',
  'Untitled whiteboard': '无标题白板',
  'Untitled check': '无标题检查',
  'A hold has ended. You can still submit while spots remain.': '预留名额已结束。名额还有剩余时仍可提交。',
  'Your hold has ended. You can still submit while spots remain.': '你的预留名额已结束。名额还有剩余时仍可提交。',
  'Get Freebuff on your phone': '在手机上获取 Freebuff',
  'Now, what are we building?': '那么，我们做点什么？',
  'Composer': '输入区',
  'Earn assistant': '赚取助手',
  'Harness': '执行框架',
  'Start a project': '新建项目',
  'Working': '运行中',
}

const missing = new Set(Object.keys(fixes))
let changed = 0
for (const file of fs.readdirSync(dictDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()) {
  const full = path.join(dictDir, file)
  const data = JSON.parse(fs.readFileSync(full, 'utf8'))
  let dirty = false
  for (const [key, value] of Object.entries(fixes)) {
    if (!(key in data)) continue
    missing.delete(key)
    if (data[key] === value) continue
    data[key] = value
    changed += 1
    dirty = true
  }
  if (dirty) fs.writeFileSync(full, JSON.stringify(data, null, 1))
}
console.log(`改了 ${changed} 条；没找到的键 ${missing.size} 条`)
for (const key of missing) console.log('  未找到:', key)
