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
| 原生菜单（文件/编辑/视图/窗口/帮助、缩放） | ✅ | 直接在 `app.asar` 里替换菜单 label，并把 `editMenu` 展开成中文项 |
| 原生对话框（退出确认、附加文件、打开文件夹、导出会话、启动失败、MCP 同意） | ✅ | 锚点断言替换主进程里的字面量 |
| 托盘图标、系统级通知、Stripe 支付页 | ❌ | 系统或第三方页面，补丁够不到 |
| 品牌、模型名、模板名、代码与用户内容 | ❌ | 有意保留原文 |

界面上的动态内容（对话正文、智能体输出、文件名、项目名）一律不动——补丁只把"已知的界面文案"换成中文，词表里没有的字符串原样保留。

## 原理

```
Freebuff\resources\
├─ orchestrator\ui\index.html            ← 注入点 1：加一行 <script src="/freebuff-zh-cn.js">
├─ orchestrator\ui\freebuff-zh-cn.js     ← 汉化脚本（本地启动页用）
├─ app.asar 内 electron\hosted-workspace.cjs
│     ↑ 注入点 2：成对 marker 之间约 50 行钩子（注入引擎 + 主世界脚本 + 巡检 + 调试日志）
└─ freebuff-zh\freebuff-zh-cn.js         ← 汉化脚本（主界面用，同一份文件）
```

汉化脚本是一层运行时 DOM 翻译：

- 词表是「英文原文 → 中文」的白名单，只做精确匹配 + 少量带变量规则（`Collapse {0}`、`{0} minutes ago`、`Daily hours: {0} of {1} remaining` 等）；
- **只改文本节点的 `nodeValue` 和少数属性**（`placeholder`、`aria-label`、`title`、`alt` 等），绝不新增、移动、删除节点——改结构会让 React 抛 `removeChild` 异常并白屏；
- 属性翻译有个例外：**`textarea` 整体跳过**（那是用户输入区，占位符也保持英文），所以 `<input>` 的 placeholder 会翻、`<textarea>` 的不会；
- `code / pre / textarea / contenteditable / .cm-editor / .xterm` 与 `[data-freebuff-zh-skip]` 子树一律跳过；
- 首屏在 `load` 之后再等 1.2 秒才开始翻译，避开 Next.js 的水合（hydration）对比，否则 React 会报 `#418` 文本不匹配；`load` 被图片/统计脚本拖住时，最多等 4 秒就开跑；
- 之后由 `MutationObserver` 跟随 React 的增量渲染继续翻译。

## 实测覆盖

| 界面 | 命中 / 未命中 | 未命中的是什么 |
| --- | --- | --- |
| 主界面（freebuff.com 应用壳、侧边栏、标签栏、模板区、余额） | 137 / 4 | Freebuff、Crosscut、Look Out Below、Puffwork（品牌与模板名） |
| 设置（通用/账号/外观/用量/账单/赚取/模型提供商/开发者 API/项目设置/技能/产物） | 剩余 0 条界面文案 | 只剩主题名、模型名、价格 |
| 集成与 MCP 面板 | 剩余 0 条界面文案 | 只剩应用名 |
| 模型选择器、文件/终端/变更/产物面板、模板库、邀请、账号菜单 | 剩余 0 条界面文案 | 只剩主题名、模型名、价格 |
| 商店页 `/store`（周边商品、FAQ） | 90 / 23 | 商品名与品牌名 |
| 官网首页 `/` | 162 / 45 | 营销长句、演示对话、品牌名 |
| 桌面版落地页 `/desktop` | 162 / 45 | 同上（与首页同一套页面） |
| 定价页 `/pricing` | 46 / 44 | 营销长句、方案名 |
| CLI 页 `/cli` | 101 / 40 | 示例代码、营销长句 |
| 应用页 `/app` | 92 / 9 | 品牌名 |
| 对话页 `/chat` | 8 / 5 | 品牌名（未登出时只有很短的占位页） |

> 这些数字来自 `tests/routes.test.js`，跑法见 `tests/README.md`；未命中里绝大多数是品牌、商品名、示例代码，属于有意保留英文的部分。

## 已知情况

- **Freebuff 更新会覆盖补丁**：`app.asar` 与 `resources\orchestrator\ui` 都在更新范围内，重跑 `安装.cmd` 即可。版本不在 `supported-versions.json` 里时脚本会拒绝安装并要求加 `-Force`。
- **页面语言里仍会剩英文**：品牌、模型名、模板名、代码片段、用户在界面上自己的内容（项目名、对话内容）。这是设计如此，不是漏翻。
- **多语言内容不会被"翻译"**：补丁是词表替换，不是机器翻译；界面新增文案要等词表更新。
- 首次打开主界面时，英文会先出现约 1 秒再变中文（为了避开 hydration）；这 1 秒内触发的系统通知也不会被翻译。
- **能力边界**：工具只认「普通 asar」（文件内容全在包里）。如果上游把发行包改成 `unpacked` 条目或带整体 `integrity` 字段的形式，安装会明确报错停下（`asar 含 unpacked 条目…` / `asar 带整体 integrity 字段…`），不会写出坏包——那时需要更新 `tools/asar.mjs`。

## 开发

```
npm run build            # dict/*.json → dist/freebuff-zh-cn.js（有冲突直接失败、不落盘）
node tools/audit.mjs     # 地区用词、标点、机器味、长度检查
cd tests && npm install

npm test                 # 离线八件：构建 / 安装器错误路径 / asar 手术往返 / 引擎 / 结构 / 对抗 / 分片 / 性能（jsdom，约一分钟）
npm run test:browser      # 真实 Chrome：本地页 + freebuff.com，和基线比 JS 异常数
npm run test:inspect      # 真实 Chrome 的巡检工具：routes（漏译清单）/ shot（截图）/ control（对照）
npm run test:all          # 上面全部（需要本机装了 Chrome）
```

目录结构：

```
dict/            词表批次 18 个：00-core / 05-datetime / 10-chrome / 15-nouns / 20-ui / 25-more / 30-shell / 40-common /
                 50-site / 60-errors / 70-deep / 80-integrations / 85-countries / 90-account / 95-last /
                 97-runtime / 99-final，外加 _rules.json（带变量规则）
src/engine.js    引擎模板（构建时注入词表与规则）
tools/           build / audit / patch-app（注入与还原）/ asar 读写 / gen-main-strings / style-history / coverage
tests/           jsdom 引擎测试 + Chrome 集成测试
dist/            构建产物（安装器只认这里）
FreebuffZhPatch.ps1   安装器：Install / Restore / Status / Verify
```

页面里的调试口（浏览器控制台可用）：

```js
__FREEBUFF_ZH__.stats()      // { applied, misses, entries }
__FREEBUFF_ZH__.dump()       // 已翻译条数 + 未命中的英文清单
__FREEBUFF_ZH__.translate('New chat')   // 单条试译，返回中文或 null
__FREEBUFF_ZH__.setEnabled(false)       // 立刻停翻（断开 observer、清空队列）；true 重新扫一遍
__FREEBUFF_ZH__.dispose()               // 卸载观察器与通知桥（升版重注入时自动用到）
```

安装器的几条底线（沿用 Capy 中文补丁的经验）：

1. 装前备份并校验哈希；装后校验注入结果（两处 marker、原生菜单/对话框文案锚点、三个脚本文件）；
2. 只在「当前 `app.asar`/`index.html` 还是上次装出来的那份」时才用备份重打；Freebuff 原地更新过就拒绝，避免把新版本降级回旧备份（`-Force` 可越过，风险自明）；
3. app.asar 只在内存里改模块，重打包后**逐文件回读比对**并重算每条的 `integrity` 哈希，被改的 `.cjs` 全部过 `vm.Script` 语法检查；
4. 所有写入都是「临时文件 → 读回校验 → 原子替换」，失败不留 `.zh-new` / `.zh-tmp` 残片。

## 开发调试开关（平时请保持关闭）

这两个开关都是 `%LOCALAPPDATA%\FreebuffZh` 下的空文件，只在开发时需要：

| 开关 | 作用 | 怎么关 |
| --- | --- | --- |
| `debug` | 把注入/巡检日志写进 `debug.log` | 删掉这个空文件（再删 `debug.log`） |
| `harvest` | 打开应用后自动点开约 21 处界面，把整页可见文本写进 `harvest.json` | **一次性**：注入钩子跑完就删掉开关；`harvest.json` 需要手动删除 |

`harvest.json` 含当时界面的全部可见文本（包括对话内容），属于本地临时数据，看完就删；`node tests/check-harvest.mjs` 用它算漏译差集。

## 许可

补丁代码以 MIT 许可发布；Freebuff 软件与商标归 Freebuff, Inc. 所有。
