# 更新日志

## 0.1.0 · 2026-11-21

首个可用版本，适配 Freebuff Desktop **0.0.204**。

**注入**

- 本地启动/登录窗口：在 `resources\orchestrator\ui\index.html` 插入一行 `script`（成对 marker）。
- 主界面：在 `app.asar` 的 `electron/hosted-workspace.cjs` 里插入 20 行钩子（成对 marker），
  页面 `dom-ready` 时把脚本注入托管窗口的隔离世界；`app.asar` 重打包后做回读校验与语法检查。

**词表**

- 1,220 条精确映射 + 28 条带变量规则，覆盖应用框架（侧边栏、标签栏、面板、模板区）、
  设置与账号、广告与推广、文件/终端/变更面板、模型选择、登录页。
- 内置质检：地区用词（繁体/台湾用语）、半角标点、机器味（进行/将会/对于）、长度异常。

**引擎**

- 只改文本节点与属性，不动 DOM 结构；`code/pre/textarea/contenteditable/.cm-editor/.xterm` 跳过。
- 首屏等 `load` 后再延 1.2 秒，避开 Next.js 水合并发期（否则 React `#418`）。
- 中文项目名混排的句式（`Collapse 汉化项目`）允许走规则，其余含中文的串不查表。

**测试**

- `tests/`：引擎 30 项断言、结构不变、8 类对抗输入、900 行分片、性能（40 行 668ms / 1200 行 2292ms）。
- `tests/integration.test.js`：真实 Chrome 分别加载本地启动页与 freebuff.com，
  **与「不注入」基线对比 JS 异常数量**（补丁不新增异常），并断言翻译命中数。
