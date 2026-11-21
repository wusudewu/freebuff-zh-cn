# 更新日志

## 0.2.3 · 2026-11-21

第九轮（把"剩下的"扫干净）：

- 词表 3,302 → **3,550 条**：补了电子表格函数用途说明（EXACT/TEXT/EDATE/…）、运行时错误与空状态
  （`Couldn't load chats.`、`Couldn't fork this chat.`、`This couldn't be saved…`）、
  推广与推荐规则说明、档位说明（`Default: thinks the task through before answering…`）、下载与更新提示。
- **主进程字符串表**：新增 `tools/gen-main-strings.mjs` 生成 `dist/main-strings.json`，
  把 57 处主进程文案（浏览器配置导入、图形缓存重置、单实例提示、更新器提示、打开方式、渲染进程崩溃）纳入安装流程；
  支持"整句字面量"与"片段"两种锚点，命中数不符即中止。
- 安装器修正：补丁版本变化时自动「还原 → 重打 asar」，不再只刷新词表（否则新增的原生替换不会生效）。

## 0.1.9 · 2026-11-21

- **系统通知也走词表**：网页通知的标题/正文不经过 DOM，原来一律英文。现在引擎包了一层 `Notification` 构造函数，
  用同一张词表翻译 `title` / `options.body`，Windows 通知条同样显示中文（引擎测试新增两项断言）。
- 至此，除系统托盘（本应用没有托盘）与 Stripe 支付页（第三方域名）外，界面层已无未翻译文案。

## 0.1.8 · 2026-11-21

第八轮（把剩下的一并翻掉）：

- 应用名族：Google Drive/Docs/Sheets/Calendar/Analytics/Ads/Slides/Forms/Tasks → 谷歌云端硬盘/文档/表格/日历/分析/广告…，
  Microsoft Teams → 微软 Teams，Meta Ads → Meta 广告，SaaS → SaaS 软件。
- **运行期与交互反馈文案 152 条**（这批以前只在真正跑起来后才出现）：`Sending…`、`Couldn't send. Try again.`、
  `Couldn't stop this response.`、`Files over 512 KB can't be copied`、`This file isn't text…`、权限对话框警示
  `This dialog could not say who is asking — do not approve.`、档位说明 `Max: the most reasoning, slowest replies…` 等。
- 词表 3,150 → **3,302 条**；术语再校一遍：`fork` 统一为派生（分叉已进质检黑名单）。
- 剩下没翻的只剩系统托盘、Windows 系统通知、Stripe 支付页（第三方页面），以及随版本变化、用户看不到的框架内部报错。

## 0.1.7 · 2026-11-21

审查意见落地（可追溯性）：

- `tests/check-harvest.mjs` 不再静默过滤：每条被跳过的串按原因归类计数（品牌/应用名、规则过滤、框架脚本残留、已翻译），
  `--verbose` 逐条列出；导出文件改成 `{source, misses, filtered}` 三段，含快照时间与页面，报告可复现。
- 输出开头打印快照来源，并提示「探针驱动会话会混入测试残留」，避免把测试期噪音当成稳态待办。
- 安装器新增 `%LOCALAPPDATA%\FreebuffZh\install.log`：每次 Install/Restore 的版本判定、备份、注入、刷新都留痕。

## 0.1.6 · 2026-11-21

第七轮（原生窗口层）：

- 装进了**原生菜单**：Alt 菜单栏、右键菜单里的 File/Edit/View/Window/Help 全部中文，
  Edit 菜单由 `role: 'editMenu'` 展开成显式中文项（撤销/重做/剪切/复制/粘贴/全选），
  缩放项（实际大小/放大/缩小）、开发者工具、切换全屏、最小化、缩放也一并换了 label。
- 装进了**原生对话框**：退出确认（标题、正文、按钮）、附加文件/图片、打开项目文件夹、
  导出会话为 Markdown、启动失败提示、MCP 连接器同意窗口（批准/取消/查看具体指令）。
- 安装器新增两段"锚点断言替换"（菜单、对话框），每处都断言命中次数，命中数不符直接中止安装；
  并且全部改在打包前完成，重打包后做回读与语法校验。
- 还原往返验证：native 补丁照样能精确回到原始 `app.asar` 哈希。

## 0.1.5 · 2026-11-21

第六轮（收尾到"只剩专有名词"）：

- 按"除专业术语外全部要中文"的要求，把主题名与模板名也译了：Alpine→阿尔卑斯、Dune→沙丘、Kanagawa→神奈川、
  Violet hour→紫罗兰时刻、Streak Fire→连击火焰、Crosscut→交叉剪辑、Puffwork→泡芙工坊 等 32 个。
- 巡检探针再加 21 个目标（新建对话、输入区菜单、模型选择器、运行位置、添加文件、语音输入、标签菜单、
  模板详情、集成详情、技能、广告向导、帮助、通知、账号菜单、快捷键、检查更新、关于、文件/终端/变更/产物面板）。
- 最后一轮静态收尾补 76 条：表格/电子表格函数说明（SUM、IF、XLOOKUP、TEXTJOIN…）、营销副标题、示例提示词。
- 词表 3,031 → **3,138 条**。巡检差集只剩 11 条：SaaS 与 Google Drive／Docs／Sheets／Ads／Analytics、
  Microsoft Teams、Meta Ads、Perplexity AI 这些应用名——都属专业术语，按约定保留原文。

## 0.1.4 · 2026-11-21

第五轮（把登录后所有能安全打开的面板走完）：

- 巡检探针扩到 31 个目标：设置全部 12 个分区、模型选择器、文件/终端/变更/产物/概览/云端浏览器、
  新建项目对话框、模板库、邀请好友、集成、MCP、帮助、账号菜单等；实测 32 个界面快照。
- 按差集补 **220 条**：约 190 个国家/地区名（广告定向的国家选择器）、账号与支付（金额、银行卡、区号、
  显示名称、推荐链接、点击次数、Discord 关联）、地区验证说明、模板标题。
- 规则加 `New {0}: start a chat`、`Top-up amount: {0}`，共 55 条。
- 差集只剩 47 条：品牌、主题名、模型名、应用名、价格，以及被拆开的 `left of` 片段。

## 0.1.3 · 2026-11-21

第四轮（登录后界面实测补全）：

- 词表 2,782 → **2,811 条**，规则 46 → 53 条。
- 新增「界面巡检探针」`src/harvest.js`：由注入钩子按关键词自己点开设置、各设置分区、集成与 MCP 面板，
  把每个界面的**精确文本节点与属性**抓成本地快照（`%LOCALAPPDATA%\FreebuffZh\harvest.json`），不新建项目、不删除、不退出登录。
- 新增 `tests/check-harvest.mjs`：把快照里的每条文本丢给补丁的 `translate()` 做差集，列出仍未翻译的串。
- 据此补了 134 条集成/MCP 面板文案（分类、应用说明、API 密钥、自动充值、技能与产物、主题预设等），
  并加 10 条规则（`Connect {0}`、`About {0}`、`All {0} apps`、`{0} preset`、`Day {0}`、`{0}/{1} joined` 等）。
- 继续按差集补了用量/账单/赚取三屏（累计 token、当前/最长连续天数、读缓存、峰值日、提现、排行榜、套餐与计费周期），
  并修了数量规则不吃千分位逗号的问题（`140,220,837 tokens`）。
- 实测差集后剩余 57 条，全部是品牌、模板名、主题名、模型名与价格（有意保留原文）。

## 0.1.2 · 2026-11-21

第三轮（深度补全）：

- 词表 2,223 → **2,650 条**：补上非 props 通道的界面文案——上传/主题/截图校验提示、网络与账号错误、
  月份与星期全表（含缩写）、Fork/派生、本地工作区与项目不可用等。
- 统一「分叉 → 派生」；修正「Trusted by users from」在数字后面接不上的问题（改成「位用户信赖」）。
- 新增 `tests/shot.test.js`：把补丁后的本地启动页与 freebuff.com 渲染成 PNG，用于人工核对版式。

## 0.1.1 · 2026-11-21

首个可用版本，适配 Freebuff Desktop **0.0.204**。

**注入**

- 本地启动/登录窗口：在 `resources\orchestrator\ui\index.html` 插入一行 `script`（成对 marker）。
- 主界面：在 `app.asar` 的 `electron/hosted-workspace.cjs` 里插入 20 行钩子（成对 marker），
  页面 `dom-ready` 时把脚本注入托管窗口的隔离世界；`app.asar` 重打包后做回读校验与语法检查。

**词表**

- 词表分六批：核心、应用框架、常用名词、界面文案、登录页、长尾补全；构建时合并并检测冲突。

- 2,650 条精确映射 + 36 条带变量规则，覆盖应用框架（侧边栏、标签栏、面板、模板区）、
  设置与账号、广告与推广、文件/终端/变更面板、模型选择、登录页。
- 内置质检：地区用词（繁体/台湾用语）、半角标点、机器味（进行/将会/对于）、长度异常。

**引擎**

- 只改文本节点与属性，不动 DOM 结构；`code/pre/textarea/contenteditable/.cm-editor/.xterm` 跳过。
- 首屏等 `load` 后再延 1.2 秒，避开 Next.js 水合并发期（否则 React `#418`）。
- 中文项目名混排的句式（`Collapse 汉化项目`）允许走规则，其余含中文的串不查表。

**0.1.1 修订（本次全面审查）**

- 逐条通读全部词表：统一 20 处术语（campaign→广告系列、account→账号、pinned→已置顶、pinned/unpin 一致、untitled 统一等），
  修掉 9 处直译腔（holds、dismiss、smart & fast、start from、try again to open、proxy 拦截说明等）。
- 新增「常用界面词」与「官网/商店页」两批：登录方式、编辑器/终端/ Git 操作、设置分区、错误提示、站点文案。
- 规则扩到 36 条（`Step {0} of {1}`、`in {0} minutes`、`{0}% complete`、`{0} selected` 等），并补齐 `Delete/Remove/Archive/Discard {0}?` 一问一答句式。
- 新增多路由巡检 `tests/routes.test.js`：把补丁注入 8 个公开路由，导出仍未翻译的英文，用来驱动下一轮词表。

**测试**

- `tests/`：引擎 30 项断言、结构不变、10 项对抗输入、900 行分片、性能（首屏 40 行 1.5s 含 1.2s 水合等待 / 1200 行 3.1s）。
- `tests/integration.test.js`：真实 Chrome 分别加载本地启动页与 freebuff.com，
  **与「不注入」基线对比 JS 异常数量**（补丁不新增异常），并断言翻译命中数。
