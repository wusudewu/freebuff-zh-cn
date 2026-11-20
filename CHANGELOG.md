# 更新日志

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
