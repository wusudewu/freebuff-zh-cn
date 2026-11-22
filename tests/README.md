# 测试怎么跑

分两类：**jsdom 那套**只用 Node，改完引擎随手就能跑；**Chrome 那套**要真浏览器，会访问 `freebuff.com`，跑得慢些。

```bash
cd tests
npm test              # jsdom：引擎 / 结构 / 对抗 / 分片 / 性能
npm run test:browser  # Chrome：端到端集成
npm run test:inspect  # Chrome：多路由巡检 + 截图 + 控制台
npm run test:all      # 三套全跑
```

Chrome 不在默认路径时用 `CHROME_PATH` 指定：`CHROME_PATH="D:/Chrome/chrome.exe" npm run test:browser`。

## 文件一览

| 文件 | 测什么 | 需要 |
| --- | --- | --- |
| `patcher.test.js` | apply → verify → restore 往返：marker 成对、原生文案锚点全替换、还原后逐字节回到原样。优先用本机备份的原始包；没有备份时用原生文案表合成最小 asar（`FBZH_FORCE_SYNTH=1` 可强制走合成路径） | Node |
| `installer.test.js` | 安装器错误路径：asar 损坏时 verify 给结论而非抛异常、`--json-out` 缺值报用法错误、Step/Status 不抛 NativeCommandError | Node + PowerShell |
| `build.test.js` | 构建的失败路径：词表冲突必须非零退出且不写产物；无冲突时产物版本与 package 一致 | Node |
| `engine.test.js` | 用 jsdom 把补丁真跑一遍：该变中文的变了、不该动的（代码块、输入框、用户内容）没动 | Node |
| `structure.test.js` | 翻译只允许改文本与属性，节点数量与子节点身份必须不变——防白屏的回归阀 | Node |
| `adversarial.test.js` | 奇怪输入不能把引擎弄崩，也不能污染页面 | Node |
| `chunk.test.js` | 超过 1500 个元素的页面走 `requestIdleCallback` 分片，必须全部覆盖 | Node |
| `perf.test.js` | 首屏同步翻译耗时、大页面完成时间 | Node |
| `integration.test.js` | 在真实页面里 `evaluateOnNewDocument` 注入补丁，端到端断言 | Chrome + 外网 |
| `routes.test.js` | 多路由漏译巡检，输出每个路由的命中/未命中；`--export out.json` 导出待翻清单 | Chrome + 外网 |
| `shot.test.js` | 把补丁后的界面渲染成 PNG，供人工核对版式与文案 | Chrome + 外网 |
| `control.test.js` | 对照跑：带补丁与不带补丁各一遍，收集 `pageerror` / console error，确认补丁不引入报错 | Chrome + 外网 |
| `chrome.js` | 找 Chrome：`CHROME_PATH` → Windows/macOS/Linux 常见安装位置；指错直接报错，四个浏览器测试共用 | — |
| `check-harvest.mjs` | 把 `harvest.json` 里抓到的每条界面文本丢给 `translate()`，列出还没命中的；品牌白名单 `KNOWN_BRANDS` 需随新品牌手工补 | Node |

浏览器那三个脚本读的是 `dist/freebuff-zh-cn.js`，**改完 `src/` 要先 `npm run build`** 再跑，否则测的是旧产物。

## 词表覆盖率报告

读 `%LOCALAPPDATA%\FreebuffZh\debug.log`（由补丁的调试探针写出，只有在
`%LOCALAPPDATA%\FreebuffZh\debug` 文件存在时才记录），把每次界面快照的
「已翻译条数 / 未命中条数」汇总成一张表，并导出去重后的待翻译清单。

```
node tools/coverage.mjs                 # 摘要
node tools/coverage.mjs --export out.json   # 导出未命中的英文串
```

调试探针怎么打开：

```
type nul > "%LOCALAPPDATA%\FreebuffZh\debug"
```

关掉就删掉这个空文件。探针只写本机日志，不发任何网络请求。
