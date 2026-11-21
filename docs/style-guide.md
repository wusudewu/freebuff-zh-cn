# 翻译风格指南

这份文件是词表的"宪法"。新增或修改任何条目之前先看一遍；`tools/audit.mjs` 会把能机器判定的部分卡住，判不了的靠这份文件。

## 一、口径（术语表）

| 英文 | 中文 | 备注 |
| --- | --- | --- |
| project | 项目 | 不要用"专案" |
| chat | 对话 | 不要用"聊天"（Teams/Discord 的产品功能名除外） |
| thread | 会话 | |
| agent | 智能体 | 不要用"代理" |
| model | 模型 | |
| reasoning | 推理 | reasoning effort = 推理强度 |
| workspace | 工作区 | |
| terminal | 终端 | |
| files / changes / artifacts | 文件 / 变更 / 产物 | |
| overview | 概览 | |
| template | 模板 | |
| hours | 小时 | 计费单位 |
| credits | 额度 | |
| prompt | 提示词 | |
| sidebar / panel | 侧边栏 / 面板 | |
| branch / run / skill / session | 分支 / 运行 / 技能 / 会话 | |
| tab | 标签页 | |
| repo / repository | 仓库 | |
| billing / plan / campaign | 账单 / 套餐 / 广告系列 | |
| account | 账号 | 不要用"账户" |
| theme / preset | 主题 / 预设 | |
| streak | 连续天数 | |
| mission | 任务 | mission effort = 任务强度 |
| fork | 派生 | 不要用"分叉" |
| item | 条目 | 不要译成"项目"（会和 project 撞车） |
| harness | 执行框架 | |
| staging | 预发布 | 不要用"暂存" |
| funded | 充值 | 不要用"注资" |

## 二、语气

- **按钮**：祈使句，2–6 字。添加 / 删除 / 重试 / 保存 / 继续 / 取消。
- **提示与错误**：陈述句 + 动作。「无法保存，请重试。」「此文件不是文本，无法在此显示。」
- **说明句**：陈述语气，不用"你可以…""请进行…""将会…"。
- **问句**：用「？」，不用英文问号；不要照搬英文条件从句，先给主句。

## 三、句式

- 不写「A 的 B 的 C」连环：`The value of the first true condition` → 「取第一个成立条件对应的值。」
- 不照搬地点/时间状语前置：`Please allow ads on Freebuff.` → 「请允许 Freebuff 展示广告。」
- 定语从句拆成动宾：`Gravity JS SDK for retrieving targeted advertisements` → 「用 Gravity JS SDK 获取定向广告。」
- 量词别省：`3 threads` → 「3 个会话」，`1 credit` → 「1 点额度」。
- 同一句里不重复同一个副词/量词：「另起一个新块」而不是「另起一个新块」。

## 四、标点与排版

- 中文标点全角：， ： 、 ？ 「」—— 不用 , : ; ? 和半角括号。
- 英文缩写与中文之间留一个空格：`API 密钥`、`MCP 服务器`、`3 天`。
- 短标签（按钮、菜单、表头）不加句号；完整句子加句号。
- 省略号统一用 `…`（U+2026），不用 `...`。
- 品牌与产品名保留英文原样。

## 五、判定边界（什么不翻）

1. 品牌、模型、应用名（Freebuff、GitHub、Gmail、Stripe…）。
2. 技术标识（token、API、URL、JSON、SDK、HTTP、SQL、Markdown、PR）。
3. 代码、路径、命令、正则、变量名、内部键名。
4. 随上游版本变化的框架内部报错（Next.js / Zod / ProseMirror）。
5. 纯数据样例（价格、时间戳、哈希、色值）。

## 六、改完之后

```
npm run build && node tools/audit.mjs
cd tests && node engine.test.js
```

安装到本机：双击 `安装.cmd`（或 `FreebuffZhPatch.ps1 -Action Install`）。
