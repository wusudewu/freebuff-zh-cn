# Freebuff 汉化补丁 · Windows 简体中文

为 **Freebuff Desktop**（Codebuff 团队的免费 AI 编程智能体）提供非官方简体中文界面。
安装一次，双击即用；随时可以还原英文。

> 补丁只改界面文字：不联网、不上报、不读账号或会话内容。
> Freebuff、Buffy 及各模型/产品名称的所有权归其各自权利人，本项目与 Freebuff 官方无关。

## 三步安装

1. 先装好 Freebuff 官方桌面版，并**完全退出**（含托盘图标）。
2. 把本目录整个解压到任意位置（别放在需要管理员权限的目录里）。
3. 双击 **安装.cmd**，看到「安装完成」后重新打开 Freebuff。

不需要管理员权限，不需要命令行。补丁会备份原文件到 `%LOCALAPPDATA%\FreebuffZh`。

- **查看状态.cmd**：看补丁版本、安装状态、自检结果。
- **恢复英文.cmd**：用备份还原，界面回到英文。
- Freebuff 更新后补丁会被覆盖：重新双击 **安装.cmd** 即可（脚本会检测版本）。

## 覆盖范围与边界

| 位置 | 是否汉化 | 说明 |
| --- | --- | --- |
| 登录 / 启动窗口（本地页面） | ✅ | 注入 `resources\orchestrator\ui\index.html` |
| 主界面（freebuff.com 网页应用） | ✅ | 在 Electron 侧给托管窗口挂注入钩子，逐屏翻译 DOM 文本 |
| 原生菜单、托盘、系统对话框 | ❌ | 由主进程 / 系统绘制，渲染层注入够不到 |
| 品牌、模型名、模板名、代码与用户内容 | ❌ | 有意保留原文 |

界面上的动态内容（对话正文、智能体输出、文件名、项目名）一律不动——补丁只把"已知的界面文案"换成中文，词表里没有的字符串原样保留。

## 原理

```
Freebuff\resources\
├─ orchestrator\ui\index.html            ← 注入点 1：加一行 <script src="/freebuff-zh-cn.js">
├─ orchestrator\ui\freebuff-zh-cn.js     ← 汉化脚本（本地启动页用）
├─ app.asar 内 electron\hosted-workspace.cjs
│     ↑ 注入点 2：成对 marker 之间的 20 行钩子，页面 dom-ready 时把脚本注入托管窗口
└─ freebuff-zh\freebuff-zh-cn.js         ← 汉化脚本（主界面用，同一份文件）
```

汉化脚本是一层运行时 DOM 翻译：

- 词表是「英文原文 → 中文」的白名单，只做精确匹配 + 少量带变量规则（`Collapse {0}`、`{0} minutes ago`、`Daily hours: {0} of {1} remaining` 等）；
- **只改文本节点的 `nodeValue` 和少数属性**（`placeholder`、`aria-label`、`title`、`alt` 等），绝不新增、移动、删除节点——改结构会让 React 抛 `removeChild` 异常并白屏；
- `code / pre / textarea / contenteditable / .cm-editor / .xterm` 与 `[data-freebuff-zh-skip]` 子树一律跳过；
- 首屏在 `load` 之后再等 1.2 秒才开始翻译，避开 Next.js 的水合（hydration）对比，否则 React 会报 `#418` 文本不匹配；
- 之后由 `MutationObserver` 跟随 React 的增量渲染继续翻译。

## 已知情况

- **Freebuff 更新会覆盖补丁**：`app.asar` 与 `resources\orchestrator\ui` 都在更新范围内，重跑 `安装.cmd` 即可。版本不在 `supported-versions.json` 里时脚本会拒绝安装并要求加 `-Force`。
- **页面语言里仍会剩英文**：品牌、模型名、模板名、代码片段、用户在界面上自己的内容（项目名、对话内容）。这是设计如此，不是漏翻。
- **多语言内容不会被"翻译"**：补丁是词表替换，不是机器翻译；界面新增文案要等词表更新。
- 首次打开主界面时，英文会先出现约 1 秒再变中文（为了避开 hydration）。

## 开发

```
npm run build      # dict/*.json → dist/freebuff-zh-cn.js（含冲突检测）
node tools/audit.mjs   # 地区用词、标点、机器味、长度检查
cd tests && npm install && npm test        # 引擎/结构/对抗/分片/性能
cd tests && node integration.test.js       # 真实 Chrome：本地页 + freebuff.com，和基线比错误数
```

目录结构：

```
dict/            词表批次（00-core / 10-chrome / 15-nouns / 20-ui / 30-shell / _rules.json）
src/engine.js    引擎模板（构建时注入词表与规则）
tools/           build / audit / asar 读写 / patch-app（注入与还原）/ collector（本机调试信标）
tests/           jsdom 引擎测试 + Chrome 集成测试
dist/            构建产物（安装器只认这里）
FreebuffZhPatch.ps1   安装器：Install / Restore / Status / Verify
```

安装器的四条底线（沿用 Capy 中文补丁的经验）：

1. 装前备份并校验哈希；装后校验注入结果；
2. 还原前确认 `app.asar` 仍是补丁写入的那份，不覆盖别人的改动；
3. app.asar 只在内存里改一个模块，重打包后**回读校验**，并做语法检查（`vm.Script`）；
4. 所有写入都是「临时文件 → 读回校验 → 原子替换」。

## 许可

补丁代码以 MIT 许可发布；Freebuff 软件与商标归 Freebuff, Inc. 所有。
