# 词表覆盖率报告

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
