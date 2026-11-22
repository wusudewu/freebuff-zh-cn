// 原生文案替换表：纯数据，安装器与测试共用（测试用它构造合成 asar）。
export const MENU_EDITS = [
  // 原生菜单：Electron 的 role 只给英文标签，所以既要换 label，也要把整块 editMenu 展开。
  ["label: 'Check for Updates…'", "label: '检查更新…'", 2],
  ["label: 'Settings…'", "label: '设置…'", 2],
  ["label: `Quit ${appName}`", "label: `退出 ${appName}`", 1],
  ["label: 'File'", "label: '文件'", 1],
  ["label: 'New Tab'", "label: '新建标签页'", 1],
  ["label: 'Reopen Closed Tab'", "label: '重新打开关闭的标签页'", 1],
  ["label: 'Open Project…'", "label: '打开项目…'", 1],
  ["label: 'Move Tab to New Window'", "label: '把标签页移到新窗口'", 1],
  ["label: 'Close Tab'", "label: '关闭标签页'", 1],
  ["label: 'Close Window'", "label: '关闭窗口'", 1],
  ["label: 'Quit',", "label: '退出',", 1],
  ["label: 'View'", "label: '视图'", 1],
  ["label: 'Reload App'", "label: '重新加载应用'", 1],
  ["{ role: 'toggleDevTools' }", "{ role: 'toggleDevTools', label: '开发者工具' }", 1],
  ["{ role: 'togglefullscreen' }", "{ role: 'togglefullscreen', label: '切换全屏' }", 1],
  ["label: 'Window', submenu: [{ role: 'minimize' }, { role: 'zoom' }]",
    "label: '窗口', submenu: [{ role: 'minimize', label: '最小化' }, { role: 'zoom', label: '缩放' }]", 1],
  ["label: 'Help'", "label: '帮助'", 1],
  ["{ role: 'editMenu' },",
    "{ label: '编辑', submenu: [" +
      "{ role: 'undo', label: '撤销' }, " +
      "{ role: 'redo', label: '重做' }, " +
      "{ type: 'separator' }, " +
      "{ role: 'cut', label: '剪切' }, " +
      "{ role: 'copy', label: '复制' }, " +
      "{ role: 'paste', label: '粘贴' }, " +
      "{ role: 'selectAll', label: '全选' }] },", 1],
]

export const DIALOG_EDITS = {
  'electron/main.cjs': [
    ["title: 'Quit Freebuff?'", "title: '退出 Freebuff？'", 1],
    ["message: 'Freebuff is still working.'", "message: 'Freebuff 还在工作中。'", 1],
    ["detail: 'Any agent still working in this chat will be interrupted.'", "detail: '这个对话里还在工作的智能体会被打断。'", 1],
    ["buttons: ['Cancel', 'Quit anyway']", "buttons: ['取消', '仍然退出']", 1],
    ["title: 'Attach files or folders'", "title: '添加文件或文件夹'", 1],
    ["title: 'Attach images'", "title: '添加图片'", 1],
    ["buttonLabel: 'Attach'", "buttonLabel: '添加'", 2],
    ["title: 'Open a project folder'", "title: '打开项目文件夹'", 1],
    ["buttonLabel: 'Open'", "buttonLabel: '打开'", 1],
    ["title: 'Export thread as Markdown'", "title: '把会话导出为 Markdown'", 1],
    ["title: 'Freebuff failed to start'", "title: 'Freebuff 启动失败'", 1],
    ["dialog.showErrorBox('Freebuff failed to start'", "dialog.showErrorBox('Freebuff 启动失败'", 2],
    ["title: 'Choose a disposable test project'", "title: '选择一个临时测试项目'", 1],
    ["title: 'Test agentic skill in Desktop'", "title: '在桌面版中测试智能体技能'", 1],
  ],
  'electron/hosted-workspace.cjs': [
    ["buttons: ['OK'], noLink: true }", "buttons: ['确定'], noLink: true }", 1],
    ["message: 'This repair is not available here.'", "message: '这个修复在这里不可用。'", 1],
  ],
  'electron/quit-copy.cjs': [
    [
      "'The next time you open Freebuff, interrupted turns continue automatically from their latest ' +",
      "'下次打开 Freebuff 时，被中断的轮次会从最近保存的步骤自动继续。' +",
      1,
    ],
    [
      "'saved step. Completed steps, conversation context, and changes already written to your files are kept.'",
      "'已完成的步骤、对话上下文，以及已经写入文件的改动都会保留。'",
      1,
    ],
    ["`Quitting stops the agents now. ${RESUMES}`", "`现在退出会立刻停止智能体。${RESUMES}`", 1],
    [
      "? `Quitting ends ${sponsoredRuns[0]}’s sponsored task, and it won’t resume.`",
      "? `退出会结束 ${sponsoredRuns[0]} 的赞助任务，且不会恢复。`",
      1,
    ],
    [
      ": `Quitting ends ${sponsoredRuns.length} sponsored tasks, and they won’t resume.`",
      ": `退出会结束 ${sponsoredRuns.length} 个赞助任务，且不会恢复。`",
      1,
    ],
    [
      '`${ends} Any other agents stop too; their interrupted turns continue the next time you open ` +',
      '`${ends} 其他智能体也会停止；被中断的轮次会在下次打开 ` +',
      1,
    ],
    [
      "'Freebuff. Changes already written to your files are kept.'",
      "'Freebuff 时继续。已经写入文件的改动会保留。'",
      1,
    ],
  ],
  'electron/consent-window.html': [
    ['<span id="title">Approve this connector?', '<span id="title">批准这个连接器？', 1],
    ['<summary id="more-label">See the exact instructions', '<summary id="more-label">查看具体指令', 1],
    ['data-sq>Cancel', 'data-sq>取消', 1],
    ['data-sq>Approve', 'data-sq>批准', 1],
  ],
}

export const ZOOM_EDITS = [
  ["label: 'Actual Size'", "label: '实际大小'", 1],
  ["label: 'Zoom In'", "label: '放大'", 3],
  ["label: 'Zoom Out'", "label: '缩小'", 1],
]

