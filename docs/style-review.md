# 文风审查记录 · 2026-11-21

范围：全部词表 3,550 条。方法：三名审查者分组通读，**只输出「改过的」条目 + 理由**，保留「看了决定不改」的判断留档，便于复核边界。

改写 **98 条**，另有 29 条「看了不改」留档。

## 改的是哪几类毛病

| 类型 | 例子（英文 → 原译 → 改后） | 理由 |
| --- | --- | --- |
| 搭配不通 | A midweight fleece pullover hoodie for long sessions → 「适合长时间使用」→「适合长时间穿着」 | 衣服用「使用」搭配不对 |
| 英文语序照搬 | Please allow ads on Freebuff. → 「在 Freebuff 上允许广告」→「请允许 Freebuff 展示广告」 | 地点状语前置是英文词序 |
| 定语从句直译 | Gravity JS SDK for retrieving targeted advertisements → 「用于获取定向广告的 Gravity JS SDK」→「用 Gravity JS SDK 获取定向广告」 | 「用于……的……」句式拗口 |
| 逐字映射 | At the start of a block: join it to the one above → 「并入上方块」→「并入上一块」 | the one above 不是「上方块」 |
| 动词误判 | Create projects, branch databases and run SQL from chat. → 「分支数据库」→「为数据库建分支」 | branch 这里作动词 |
| 提示语语气 | Criterion needs a title. → 「条件需要标题。」→「请填写条件标题。」 | 提示要指向动作 |
| 术语一义多译 | bench → 工作台／基准／评测台 → 统一「评测台」 | 同词三译造成歧义 |
| 标点不一致 | No ad selected. / No countries found. | 同组提示都带句号，这两条漏了 |

## 逐条（98 条，节选理由）

| 英文 | 改后 | 修改理由 |
| --- | --- | --- |
| A hold has ended. You can still submit while spots remain. | 预留名额已到期。只要还有名额，仍可提交。 | 「名额已结束」搭配不通，且英文条件从句照搬在句尾 |
| Your hold has ended. You can still submit while spots remain. | 你的预留名额已到期。只要还有名额，仍可提交。 | 同上 |
| Add the bench | 添加评测台 | bench 三译统一 |
| By stack (bench) | 按技术栈（评测台） | 同上 |
| About Auto-renew sessions | 关于自动续订会话 | 与同表「Auto-renew sessions → 自动续订会话」对齐 |
| Pause the queue here until you resume it | 在此暂停队列，等你手动恢复 | 「等你恢复」缺宾语 |
| Report issue or feature | 反馈问题或建议功能 | 「报告问题或功能」等于说要报告一个功能 |
| Add funds | 充值 | 「添加资金」直译 |
| Another tab has that name. | 另一个标签页已占用该名称。 | 「已使用」易与「使用过」混淆 |
| Balanced everyday model | 均衡的日常模型 | 去掉多余量词 |
| Discard saved message | 放弃已保存的消息 | 补宾语 |
| Earn, admin only | 赚取（仅管理员） | 括号改为全角 |
| Feedback is unavailable. You can try again. | 反馈功能暂不可用，请稍后再试。 | 去掉「你可以」 |
| Choose files totaling 100 MB or less. | 请选择总大小不超过 100 MB 的文件。 | 原译「选择的文件总大小不超过…」不像指令 |
| Finish or stop the chat before ending its session. | 结束会话前，请先完成或停止当前对话。 | 语序与语气 |
| The last day of the month a number of months away. | 相隔若干个月，取那个月的最后一天。 | 「A 的 B 的 C」连环 |
| Requests spend a prepaid USD balance. Start with $10 or more | 调用从预付的美元余额扣费，最低充值 $10。 | 「起步充 $10 以上」啰嗦 |

（完整清单见提交记录与 `scratch/style-changes.json`，包含每条的理由。）

## 决定不改的例子

- 「进行中」：状态标签，最自然的说法，机器味检查会误报。
- 「你的队友能看到这个项目的所有对话，以及你之后新开的对话。」：三个「的」但句子本身顺，属于检查器误报。
- 「无法保存，请重试。」「正在加载对话…」：已经是最简说法。

## 复跑

```
npm run build && node tools/audit.mjs
cd tests && node engine.test.js
```
