/*
 * Freebuff 简体中文界面补丁 · 运行时 DOM 汉化层
 * 只改已有文本节点与属性，不新增、不移动、不删除任何 DOM 节点。
 * 不联网、不上报，不读取账号或会话数据。
 * 由 FreebuffZhPatch.ps1 安装，构建自 src/engine.js + dict/*.json。
 * 作者：wusudewu
 */
;(() => {
  'use strict'

  const PATCH_ID = 'freebuff-zh-cn'
  const PATCH_VERSION = '0.1.0'
  const existing = globalThis.__FREEBUFF_ZH__
  if (existing && existing.id === PATCH_ID && existing.version === PATCH_VERSION) return
  if (existing && existing.dispose) {
    try {
      existing.dispose()
    } catch (error) {}
  }

  const DICT = {"(No answer provided)":"（未提供回答）","1 day":"1 天","1 per day":"每天 1 次","1 week":"1 周","1. Review the code":"1. 检查代码","100% free":"100% 免费","10:42 AM":"上午 10:42","12-hour time":"12 小时制","1M context":"100 万上下文","2 per day":"每天 2 次","2 weeks":"2 周","2. Set up your account":"2. 设置账户","3 days":"3 天","3. Verify in your app":"3. 在你的应用中验证","64-bit":"64 位","A crash, error, or UI problem":"崩溃、错误或界面问题","A friend":"朋友","A hold has ended. You can still submit while spots remain.":"冻结已结束。名额还有剩余时仍可提交。","A lower price":"更低的价格","A midweight fleece pullover hoodie for long sessions.":"中厚款抓绒套头连帽衫，适合长时间使用。","A promotional price that goes up when the promotion ends. Open with a US connection or a paid plan. One session a day on every plan.":"促销价，活动结束后上调。需美国网络或付费套餐才能打开。所有套餐每天 1 次会话。","A soft, heavyweight cotton tee with Buffy on it.":"重磅柔软棉质 T 恤，印着 Buffy。","AI APIs":"AI API","AI app or agent":"AI 应用或智能体","AI coworker":"AI 同事","API keys":"API 密钥","API usage":"API 用量","Aborted":"已中止","About Auto-renew sessions":"关于会话自动续期","About Show in Discord status":"关于“在 Discord 状态中显示”","About this section":"关于本节","About your skills":"关于你的技能","Above input":"输入框上方","Accept":"接受","Accept all":"全部接受","Accept and implement":"接受并实施","Access denied":"拒绝访问","Account":"账号","Account changed":"账户已切换","Account standing":"账户状态","Accounts":"账户","Active":"活跃","Activity":"动态","Actual size":"实际大小","Ad":"广告","Ad actions":"广告操作","Ad feedback":"广告反馈","Ad options":"广告选项","Add":"添加","Add SMS verification codes with Surge":"用 Surge 添加短信验证码","Add Specific's project instructions with specific init":"用 specific init 添加 Specific 的项目说明","Add a block below":"在下方添加块","Add a creative":"添加创意","Add account":"添加账户","Add card":"添加银行卡","Add check":"添加检查","Add column":"添加列","Add countries":"添加国家","Add credits":"添加额度","Add custom MCP":"添加自定义 MCP","Add funds":"添加资金","Add more":"添加更多","Add project":"添加项目","Add prompt":"添加提示词","Add prompt + open website":"添加提示词并打开网站","Add repository":"添加仓库","Add row":"添加行","Add series":"添加系列","Add sources after your first message":"首次发送消息后可添加来源","Add streak reminders":"添加连续天数提醒","Add tab":"添加标签页","Add the bench":"添加工作台","Add to dictionary":"添加到词典","Add tracking parameter":"添加跟踪参数","Add your own repository":"添加自己的仓库","Added:":"已添加：","Address":"地址","Admin":"管理员","Admin only":"仅管理员","Administrator request":"管理员请求","Ads":"广告","Advanced":"高级","Advanced Mode":"高级模式","Advanced settings":"高级设置","Advertise":"广告投放","Advertiser":"广告主","Advertiser ads":"广告主的广告","Advertisers":"广告主","After":"之后","Agency":"代理商","Agent instructions":"智能体指令","Agent mode":"智能体模式","Agent skill":"智能体技能","Agent to-do list":"智能体待办列表","Agent working":"智能体运行中","All":"全部","All 100% free.":"全部 100% 免费。","All changes reviewed":"全部变更已审查","All countries":"全部国家","All countries (clear)":"全部国家（清除）","All countries clear":"已清除全部国家","All except these":"除这些之外的全部","All integrations":"全部集成","All interests":"全部兴趣","All models":"全部模型","All overrides cleared":"已清除全部覆盖","All spots taken":"名额已满","Allowance":"免费额度","Already read":"已读","Alt text":"替代文本","Always":"始终","An idea, question, or anything else":"想法、问题，或任何其他内容","An insulated, weatherproof parka for real winters.":"一件保暖防水的派克大衣，真正的冬天也扛得住。","Analytics":"分析","Anchor Alias":"锚点别名","Animate":"动画","Anonymous provider retains prompts":"匿名提供方会保留提示词","Another computer":"另一台电脑","Another tab has that name.":"另一个标签页已使用该名称。","Answer in your own words":"用自己的话回答","Anthropic's most intelligent model":"Anthropic 最智能的模型","App bug":"应用 Bug","App navigation":"应用导航","Appeal":"申诉","Appearance":"外观","Apple M5 Pro chip":"Apple M5 Pro 芯片","Application uses the SDK":"应用使用 SDK","Apply":"应用","Approve as a mission":"批准为任务","Approve build":"批准构建","Approved":"已批准","Apps & downloads":"应用与下载","Apps to connect":"可连接的应用","Apr":"4月","April":"4月","Archil API key (starts key-, not a disk token)":"Archil API 密钥（以 key- 开头，不是磁盘令牌）","Archive":"归档","Archive chat":"归档对话","Archive project":"归档项目","Archived":"已归档","Archived chats":"已归档对话","Area":"面积图","Argentina":"阿根廷","Arguments":"参数","Artifact":"产物","Artifacts":"产物","Ask Buffy":"询问 Buffy","Ask Buffy about this passage":"就这段内容询问 Buffy","Ask Freebuff":"询问 Freebuff","Ask about this chat":"就此对话提问","Ask the project owner for access.":"向项目所有者申请访问权限。","At most":"最多","At most 16 criteria.":"最多 16 个条件。","At the start of a block: join it to the one above":"在块开头：并入上方块","Attach a screenshot":"附加截图","Attach files":"添加文件","Audience":"受众","Audio":"音频","Aug":"8月","August":"8月","Australia":"澳大利亚","Austria":"奥地利","Auth":"认证","Authorization":"授权","Auto":"自动","Auto top-up":"自动充值","Auto-archive chats":"自动归档对话","Auto-archive cloud chats after":"云端对话自动归档时间","Auto-renew sessions":"自动续订会话","Automatically start the next session":"自动开始下一个会话","Average":"平均","AxonStream org JWT token":"AxonStream 组织 JWT 令牌","Back":"返回","Back to":"返回","Back to lab settings":"返回实验室设置","Back to latest":"返回最新","Back to reference":"返回参考","Backward":"后退","Bad result":"结果不佳","Balance":"余额","Balanced":"均衡","Balanced everyday model":"日常均衡模型","Bangladesh":"孟加拉国","Bar":"柱状图","Bar, line or area":"柱状图、折线图或面积图","Batch":"批次","Batch name":"批次名称","Batch runs":"批次运行","Bayer 2 by 2":"Bayer 2×2","Bayer 4 by 4":"Bayer 4×4","Bayer 8 by 8":"Bayer 8×8","Bearer token (optional)":"Bearer 令牌（可选）","Before":"之前","Before and after":"前后对比","Before you keep it":"保留之前","Before you merge":"合并之前","Beginner":"入门","Belarus":"白俄罗斯","Belgium":"比利时","Better models":"更好的模型","Billing":"账单","Binary file":"二进制文件","Blank campaign":"空白广告系列","Blog":"博客","Body":"正文","Bold":"粗体","Both":"两者","Bounties":"悬赏","Branch":"分支","Brazil":"巴西","Breadcrumb":"面包屑","Bring a list item back out":"把列表项移出来","Bring your own idea to life.":"让你的想法落地。","Bronze":"青铜","Browser":"浏览器","Browser access":"浏览器访问","Brush":"画笔","Budget":"预算","Build":"构建","Build with AI. Sign-in, databases, and publishing built in.":"用 AI 构建应用。登录、数据库和发布功能一应俱全。","Bulgaria":"保加利亚","Bulleted list":"项目符号列表","Business":"商业","Button":"按钮","Buy hours":"购买小时","By stack (bench)":"按技术栈（基准）","Bytes":"字节","Cached input (included)":"缓存输入（已包含）","Caching":"缓存","Calendar":"日历","Callout":"提示块","Campaign":"广告系列","Campaign assistant":"广告系列助手","Campaign emails are off.":"广告系列邮件已关闭。","Campaign name":"广告系列名称","Campaigns":"广告活动","Campaigns you create appear here.":"你创建的广告系列会显示在这里。","Canada":"加拿大","Cancel":"取消","Cancel download":"取消下载","Cancel microphone request":"取消麦克风请求","Cancel reading folder":"取消读取文件夹","Cancel transcription":"取消转写","Cancel upload":"取消上传","Canvas is unavailable.":"画布不可用。","Caption":"图注","Card":"卡片","Causes":"原因","Caution":"注意","Cell":"单元格","Change":"更改","Change advertiser":"更换广告主","Change logo":"更换 Logo","Change type":"更改类型","Changes":"变更","Changes needed":"需要修改","Chart":"图表","Chart title":"图表标题","Chart type":"图表类型","Chat":"对话","Chat history pages":"对话历史页数","Chat layout":"对话布局","Chat options":"对话选项","Chat pane":"对话面板","Chat sources":"对话来源","Chat text size":"对话文字大小","Chats":"对话","Chats that finish or need you show up here.":"已结束或需要你处理的对话会显示在这里。","Check again":"重新检查","Check for updates":"检查更新","Check on your agents and reply from your phone.":"在手机上查看智能体并回复。","Checking for updates":"正在检查更新","Checklist":"清单","Checklist options":"清单选项","Chile":"智利","China":"中国","Choose a chat":"选择对话","Choose a chat first":"请先选择对话","Choose a local project":"选择本地项目","Choose a project and start a chat":"选择项目并开始对话","Choose a start date.":"选择开始日期。","Choose any":"任选","Choose at least one file.":"至少选择一个文件。","Choose chat":"选择对话","Choose files":"选择文件","Choose folder":"选择文件夹","Choose image":"选择图片","Choose my own model":"自己选择模型","Choose wallpaper image":"选择壁纸图片","Choose where the next message runs.":"选择下一条消息在哪里运行。","Choose where to publish":"选择发布位置","City":"城市","Claim":"领取","Claim my referral rewards":"领取我的推荐奖励","Claim my referral rewards.":"领取我的推荐奖励。","Clear":"清除","Clear search":"清除搜索","Clear selection":"清除选择","Click a shortcut to change it.":"点击快捷键即可修改。","Climate data story":"气候数据故事","Cline or Roo":"Cline 或 Roo","Close":"关闭","Close Connect to GitHub":"关闭“连接 GitHub”","Close custom MCP":"关闭自定义 MCP","Close doc":"关闭文档","Close feedback":"关闭反馈","Close find":"关闭查找","Close image":"关闭图片","Close image preview":"关闭图片预览","Close legacy projects":"关闭旧版项目","Close mission picker":"关闭任务选择器","Close new project":"关闭新建项目","Close search":"关闭搜索","Close session":"关闭会话","Close sidebar":"关闭侧边栏","Close tab":"关闭标签页","Close this tab once the queue finishes":"队列结束后关闭此标签页","Close update dialog":"关闭更新对话框","Close window":"关闭窗口","Cloud":"云端","Cloud agents":"云端智能体","Cloud browser":"云端浏览器","Cloud chat":"云端对话","Cloud history unavailable":"云端历史不可用","Code":"代码","Code block":"代码块","Code language":"代码语言","Code ready":"代码就绪","Code review":"代码审查","Code, deploy and host your app":"编写、部署并托管你的应用","Codebase contributions":"代码库贡献","Coding agent and model":"编程智能体和模型","Collapse checklist":"收起清单","Collapse left sidebar":"收起左侧边栏","Collapse right panel":"收起右侧面板","Collapse sidebar":"收起侧边栏","Collapsed":"已收起","Colombia":"哥伦比亚","Color":"颜色","Color levels":"色阶","Color themes":"配色主题","Coming soon":"即将推出","Command copied":"命令已复制","Command line":"命令行","Commands":"命令","Comment":"评论","Comment on this passage":"评论这段内容","Comments":"评论","Commit":"提交","Community":"社区","Compacted context":"已压缩上下文","Compactions":"压缩次数","Compacts at":"压缩阈值","Company or project name":"公司或项目名称","Compare":"对比","Completed":"已完成","Completions":"补全","Component":"组件","Composer":"输入框","Compressed archive":"压缩包","Confirm":"确认","Confirm delete preset":"确认删除预设","Connect":"连接","Connect GitHub":"连接 GitHub","Connect GitHub to start a project from your repository.":"连接 GitHub，从你自己的仓库创建项目。","Connect an account to get":"连接账户以获取","Connect an app":"连接应用","Connect folder":"连接文件夹","Connect to GitHub":"连接 GitHub","Connect your":"连接你的","Connect your apps":"连接你的应用","Connected":"已连接","Connected apps":"已连接的应用","Connected just now":"刚刚连接","Connected to GitHub":"已连接 GitHub","Console":"控制台","Containers":"容器","Contents":"目录","Context":"上下文","Continue":"继续","Continue in Cloud":"在云端继续","Continue in Desktop":"在桌面端继续","Continue in browser":"在浏览器中继续","Continue on this computer":"在这台电脑上继续","Continue this project in Desktop":"在桌面端继续此项目","Contribute this project":"贡献此项目","Contribution permission saved":"贡献权限已保存","Control character":"控制字符","Conversation turn":"对话轮次","Copied":"已复制","Copy":"复制","Copy JSON":"复制 JSON","Copy Markdown":"复制 Markdown","Copy a legacy project":"复制旧版项目","Copy as Markdown":"复制为 Markdown","Copy body":"复制正文","Copy code":"复制代码","Copy email address":"复制邮箱地址","Copy install command":"复制安装命令","Copy invite link":"复制邀请链接","Copy link":"复制链接","Copy link to tab":"复制标签页链接","Copy link to this section":"复制本节链接","Copy path":"复制路径","Copy sign-in link":"复制登录链接","Copy title":"复制标题","Copy your referral link":"复制你的推荐链接","Could not add it.":"无法添加。","Could not copy code. Try again.":"无法复制代码，请重试。","Could not copy the link.":"复制链接失败。","Could not delete that item":"无法删除该项目","Could not dismiss.":"无法关闭。","Could not edit that item":"无法编辑该项目","Could not export theme.":"无法导出主题。","Could not import image.":"无法导入图片。","Could not import theme.":"无法导入主题。","Could not load Sites.":"无法加载站点。","Could not load logs script":"无法加载日志脚本","Could not load this data.":"无法加载此数据。","Could not open the folder.":"无法打开该文件夹。","Could not open this chat.":"无法打开该对话。","Could not reach the server":"无法连接服务器","Could not save this theme.":"无法保存此主题。","Could not send ad report":"无法发送广告报告","Could not send the answer.":"无法发送回答。","Could not start sign-in — Freebuff’s local service is not responding. Restart the app.":"无法开始登录——Freebuff 的本地服务没有响应，请重启应用。","Could not start sign-in.":"无法开始登录。","Could not stop.":"无法停止。","Couldn't send that item":"无法发送该项目","Couldn't verify":"无法验证","Couldn’t open Freebuff":"无法打开 Freebuff","Count":"计数","Countries":"国家","Country":"国家","Create":"创建","Create a free":"免费创建","Create a project":"创建项目","Create and push":"创建并推送","Create artifact":"创建产物","Create project":"创建项目","Create projects, branch databases and run SQL from chat.":"在对话中创建项目、分支数据库并运行 SQL。","Create pull request":"创建拉取请求","Create variation":"创建变体","Creative":"创意","Creative agency":"创意工作室","Criterion needs a title.":"条件需要标题。","Croatia":"克罗地亚","Cuba":"古巴","Cumulative provider-reported usage in the current thread transcript.":"当前会话记录中服务商累计上报的用量。","Current selection":"当前选中项","Current theme":"当前主题","Custom":"自定义","Custom MCP":"自定义 MCP","Custom MCP servers":"自定义 MCP 服务器","Custom ad":"自定义广告","Custom ads":"自定义广告","Custom preset required.":"需指定自定义预设。","Custom presets":"自定义预设","Custom servers":"自定义服务器","Custom themes":"自定义主题","Customize":"自定义","Customized":"已自定义","Cut":"剪切","Czechia":"捷克","Daily":"每日","Daily budget":"每日预算","Daily hours":"每日小时","Daily limit reached":"已达每日上限","Dark":"深色","Dark mode toggle":"切换深色模式","Data":"数据","Data grid":"数据表格","Data or ML":"数据或机器学习","Database":"数据库","Date":"日期","Debugging":"调试","Dec":"12月","December":"12月","Deep reasoning":"深度推理","Default":"默认","Default (":"默认（","Default (3)":"默认（3）","Delete":"删除","Delete account":"删除账号","Delete column":"删除列","Delete file":"删除文件","Delete forever":"永久删除","Delete preset":"删除预设","Delete row":"删除行","Delete tab":"删除标签页","Denmark":"丹麦","Deploy this app with Specific":"用 Specific 部署此应用","Deploys":"部署","Describe the issue so we can review it.":"请描述问题，方便我们审核。","Design":"设计","Designs":"设计","Desktop":"桌面端","Desktop account changed":"桌面端账户已切换","Desktop app":"桌面应用","Desktop runtime IPC failed":"桌面端运行时 IPC 失败","Detached HEAD":"分离的 HEAD","Developer":"开发者","Developer API":"开发者 API","Developer at a company":"公司开发者","Developer interests":"开发者兴趣","Developers":"开发者","Diagnostics":"诊断","Dialog":"对话框","Diamond":"钻石","Diff":"差异","Disable":"禁用","Discard":"丢弃","Discard saved message":"丢弃已保存的消息","Discard unsaved settings?":"丢弃未保存的设置？","Disconnect":"断开连接","Disconnect local folder":"断开本地文件夹","Dismiss":"忽略","Dismiss Desktop suggestion":"关闭桌面端建议","Dismiss ad":"关闭广告","Dismiss invitation":"忽略邀请","Dismiss mission":"关闭任务","Dismiss policy update":"关闭政策更新","Dismiss sponsored message":"关闭赞助消息","Dismiss sponsored proposal":"关闭赞助提案","Dithering":"抖动","Divider":"分隔线","Django or FastAPI":"Django 或 FastAPI","Doesn't apply":"不适用","Dollars, negatives red":"美元，负数显示为红色","Domains":"域名","Done":"完成","Download":"下载","Download Desktop":"下载桌面版","Download Freebuff for mobile":"下载 Freebuff 移动版","Download again":"重新下载","Download desktop":"下载桌面版","Download file":"下载文件","Download for":"下载适用于","Download for mobile":"下载手机版","Download manually":"手动下载","Download started":"已开始下载","Download this tab as Markdown":"将此标签页下载为 Markdown","Draft":"草稿","Drag in a chat from this project":"从该项目拖入对话","Drag the row to reorder":"拖动行即可重新排序","Drag to move":"拖动以移动","Draggable":"可拖动","Drop files or folders":"拖入文件或文件夹","Drop screenshots to attach":"拖入截图即可添加附件","Droppable":"可放置","Duplicate":"创建副本","E-commerce":"电商","E.164 number":"E.164 号码","Earlier messages":"更早的消息","Earn":"赚取","Earn assistant":"赚取助手","Earn free usage":"免费赚取时长","Earn more Freebuff usage":"赚取更多 Freebuff 用量","Earn up to":"最多赚取","Earn, admin only":"赚取，仅管理员","Earned":"已获得","Ecuador":"厄瓜多尔","Edit":"编辑","Edit answers":"编辑回答","Edit anytime":"随时可编辑","Edit artifact":"编辑产物","Edit chart":"编辑图表","Edit code":"编辑代码","Edit creatives":"编辑创意","Edit link":"编辑链接","Edit notebook":"编辑笔记本","Edit prompt":"编辑提示词","Edit source":"编辑源码","Edited a file":"编辑了 1 个文件","Edited files":"编辑了文件","Editing":"编辑中","Editing a sent message. Sending replaces it and everything after it.":"正在编辑已发送的消息。发送后将替换该消息及其之后的所有内容。","Education":"教育","Efficient":"高效","Element":"元素","Email":"邮箱","Email support":"邮件联系客服","Emoji":"表情符号","Emphasis":"强调","Empty":"空","Enable selected tools":"启用所选工具","End date":"结束日期","End mission":"结束任务","End session":"结束会话","Ended":"已结束","Ending soon":"即将结束","Environment":"环境","Estonia":"爱沙尼亚","Event":"事件","Every step":"每一步","Exa API key":"Exa API 密钥","Excel workbook":"Excel 工作簿","Existing repository":"已有仓库","Expand checklist":"展开清单","Expand left sidebar":"展开左侧边栏","Expand sidebar":"展开侧边栏","Expert":"专家","Explore":"探索","Explore Freebuff":"探索 Freebuff","Explore more integrations":"探索更多集成","Export file":"导出文件","Export theme":"导出主题","Expression":"表达式","Extra high":"超高","Fade position":"淡出位置","Failed":"失败","Falls back when busy":"繁忙时自动切换","Fast":"快速","Fast and light":"快速轻量","Faster responses":"更快响应","Fastest":"最快","Featured":"精选","Feb":"2月","February":"2月","Feed preview":"信息流预览","Feedback":"反馈","Feedback for the next plan revision":"为下一版计划提供反馈","Feedback saved.":"反馈已保存。","Feedback sent. Thank you!":"反馈已发送，谢谢！","Fewer ads":"减少广告","Field":"字段","File":"文件","File content":"文件内容","File contents":"文件内容","File path":"文件路径","Files":"文件","Files to add":"待添加的文件","Filter by advertiser, campaign or skill":"按广告主、广告系列或技能筛选","Filter campaigns":"筛选广告系列","Filter files":"筛选文件","Filter themes":"筛选主题","Finance":"金融","Find":"查找","Find and replace":"查找和替换","Find files":"查找文件","Find in chat":"在对话中查找","Find in doc":"在文档中查找","Find services":"查找服务","Finish":"完成","Finish move":"完成移动","Finish setup":"完成设置","Finished":"已完成","Finland":"芬兰","First version.":"第一个版本。","Fit":"适应","Fix and resend":"修复并重新发送","Fix with agent":"用智能体修复","Flag overrides cleared":"已清除功能开关覆盖","Flag overrides set":"已设置功能开关覆盖","Flagged":"已标记","Folder":"文件夹","Folder does not exist":"文件夹不存在","Font":"字体","Footer":"页脚","Footnotes":"脚注","Fork":"派生","Forked chat":"派生对话","Form":"表单","Format selection":"格式化选中内容","Forward":"前进","Founder":"创始人","Founder or indie hacker":"创始人或独立开发者","Fragment":"片段","Frameworks":"框架","France":"法国","Free":"免费","Free agent run":"免费智能体运行","Free and low-cost models":"免费和低价模型","Free-form answer":"自由作答","Free: uses none of your balance.":"免费：不消耗余额。","Freebuff Ads":"Freebuff 广告","Freebuff Cloud":"Freebuff 云端","Freebuff Hoodie":"Freebuff 连帽衫","Freebuff Parka":"Freebuff 派克大衣","Freebuff T-shirt":"Freebuff T 恤","Freebuff Web":"Freebuff 网页版","Freebuff blog":"Freebuff 博客","Freebuff couldn’t open your browser. Copy the sign-in link and paste it into your browser.":"Freebuff 打不开你的浏览器。复制登录链接，粘贴到浏览器里打开。","Freebuff home":"Freebuff 首页","Freebuff on GitHub":"GitHub 上的 Freebuff","Freebuff response":"Freebuff 的回复","Freebuff took too long to load on this connection.":"Freebuff 在这条网络连接上加载超时。","Freebuff: The free coding agent":"Freebuff：免费编程智能体","Freebuff’s servers didn’t answer this computer in time. Check your connection, then try again.":"Freebuff 的服务器没有及时响应这台电脑。检查网络后重试。","Freelancer or contractor":"自由职业者或外包人员","Fri":"周五","Friday":"周五","Friend joined":"好友已加入","Friends joined":"好友已加入","From Sketch to Production-Ready Code with Blackbox AI":"用 Blackbox AI 把草图变成可上线的代码","From a link":"来自链接","From scratch":"从零开始","Frontier models like GPT-6.1 Sol and more":"前沿模型，如 GPT-6.1 Sol 等","Full":"完整","Full access":"完全访问权限","Full name":"姓名","Function":"函数","Fusion energy":"聚变能源","Games":"游戏","General":"通用","Generate image":"生成图片","Generator":"生成器","Generic":"通用","Germany":"德国","Gesture":"手势","Get Freebuff":"获取 Freebuff","Get Freebuff on mobile":"在手机上获取 Freebuff","Get Freebuff on your phone":"在手机上使用 Freebuff","Get Started":"开始使用","Get started":"开始使用","Get started with Desktop":"开始使用桌面端","Get the app":"下载应用","Get the mobile app":"获取移动应用","Getting started progress":"入门进度","GitHub connections are not configured on this server.":"此服务器未配置 GitHub 连接。","GitHub repository":"GitHub 仓库","Give feedback":"提供反馈","Give up spot":"让出排队位置","Give your friends unlimited free coding too":"让朋友也能无限免费编程","Give your friends unlimited free coding too.":"让朋友也能无限免费编程。","Go":"前往","Go home":"回到首页","Go to line":"跳到行","Good result":"结果不错","Google flagship":"Google 旗舰模型","Got it":"知道了","Got it.":"知道了","Gradient direction":"渐变方向","Gradient style":"渐变样式","Gradients":"渐变","Gravity JS SDK for retrieving targeted advertisements":"用于获取定向广告的 Gravity JS SDK","Greece":"希腊","Habit tracker":"习惯打卡","Habits":"习惯","Harness":"运行框架","Heading":"标题","Heading 1":"标题 1","Heading 2":"标题 2","Heading 3":"标题 3","Health":"健康","Help":"帮助","Hex":"十六进制","Hide":"隐藏","Hide checklist":"隐藏清单","Hide other models":"隐藏其他模型","Hide outline":"隐藏大纲","Hide sponsored task":"隐藏赞助任务","Hide task":"隐藏任务","Hide trace":"隐藏追踪","High":"高","Higher limits":"额度更高","Highest":"最高","Highlight":"高亮","Hobbyist":"爱好者","Home":"首页","Hong Kong":"香港","Hosting":"托管","Hours":"小时","Hours and plan":"小时与套餐","Hours balances":"小时余额","How can I help?":"有什么可以帮你？","How do invites work?":"邀请如何运作？","How heavy headings and page titles are drawn.":"标题和页面标题的笔画粗细。","How much do you code?":"你写多少代码？","Hue":"色相","Hungary":"匈牙利","Hyperlink":"超链接","I agree to the":"我同意","I already pay":"我已经付费","I already use this tool":"我已在用这个工具","I didn't use it enough":"我用得不够多","ID verification required.":"需要身份验证。","Iceland":"冰岛","If its provider is down, DeepSeek V4.1 Flash answers for the rest of the session.":"如果它的提供方不可用，本次会话余下时间由 DeepSeek V4.1 Flash 代答。","Image":"图片","Image address":"图片地址","Image controls":"图片控件","Image zoom":"图片缩放","Images from this response":"本次回复里的图片","Import and export":"导入和导出","Import skill JSON":"导入技能 JSON","Import theme":"导入主题","Import theme file":"导入主题文件","Import wallpaper bytes into the local image library before saving this theme.":"保存主题前，先把壁纸数据导入本机图片库。","Important":"重要","Imported":"已导入","In good standing":"状态良好","In progress":"进行中","In review":"审核中","In the next 3 months":"未来 3 个月","Include AGENTS.md":"包含 AGENTS.md","Included with a paid plan (Pro on limited access). Two sessions a day on every plan.":"付费套餐已包含（受限访问时为 Pro）。所有套餐每天 2 次会话。","Included with a paid plan.":"付费套餐已包含。","India":"印度","Indonesia":"印度尼西亚","Initializing":"初始化中","Inline code":"行内代码","Input":"输入","Insert":"插入","Insert a block":"插入块","Insert a block (in an empty line)":"插入块（在空行中）","Insert an image":"插入图片","Insert chart":"插入图表","Insert checklist":"插入清单","Insert code block":"插入代码块","Insert column left":"向左插入列","Insert column right":"向右插入列","Insert image":"插入图片","Insert row above":"在上方插入行","Insert row below":"在下方插入行","Insert table":"插入表格","Insert text":"插入文本","Install":"安装","Install Freebuff":"安装 Freebuff","Install Freebuff on GitHub":"在 GitHub 上安装 Freebuff","Install command copied":"已复制安装命令","Install now":"立即安装","Install when idle":"空闲时安装","Integrations":"集成","Interest targeting only reaches developers with an available profile.":"兴趣定向只会触达有可用资料的开发者。","Interface size":"界面缩放","Intermediate":"中级","Internal tool":"内部工具","Invalid theme file.":"主题文件无效。","Invalid theme.":"主题无效。","Invert image":"图片反色","Invite":"邀请","Invite a friend":"邀请好友","Invite friends":"邀请好友","Invite link":"邀请链接","Invited":"已邀请","Iran":"伊朗","Ireland":"爱尔兰","Israel":"以色列","Italic":"斜体","Italy":"意大利","Its rules on self-promotion":"它对自我推广的规定","Japan":"日本","Java or Kotlin":"Java 或 Kotlin","Join our Discord":"加入我们的 Discord","Just me":"只有我","Just now":"刚刚","Keep Powerful":"保留 Powerful","Keep files across runs with an Archil disk":"用 Archil 磁盘在多次运行间保留文件","Keep it going":"继续保持","Keep working":"继续工作","Keep working toward a goal":"持续朝目标推进","Key binding":"按键绑定","Keyboard shortcuts":"键盘快捷键","LLMs":"大模型","Lab VM as is":"保持 Lab 虚拟机原样","Lab settings":"实验室设置","Label":"标签","Label column name":"标签列名称","Labels and buttons":"标签和按钮","Landing URL":"落地页 URL","Landing pages":"落地页","Large":"大","Last 28 days":"最近 28 天","Last 7 days":"最近 7 天","Last 90 days":"最近 90 天","Later":"稍后","Latest":"最新","Latest posts":"最新帖子","Latest videos":"最新视频","Latvia":"拉脱维亚","Launch":"发布","Learn more":"了解更多","Learning to code":"学习编程","Leaving":"即将下线","Legacy":"旧版","Legacy projects":"旧版项目","Legal":"法律条款","Letter spacing":"字间距","Liechtenstein":"列支敦士登","Light":"浅色","Light mode toggle":"切换浅色模式","Lighter":"较浅","Like":"赞","Limit countries":"限制国家","Limited-time trial":"限时试用","Link":"链接","Link address":"链接地址","Link copied":"已复制链接","Link project":"关联项目","List":"列表","List artifacts":"列出产物","List versions":"列出版本","Lithuania":"立陶宛","Live":"线上","Load more":"加载更多","Load more chats":"加载更多对话","Load more projects":"加载更多项目","Load older chats":"加载更早的对话","Loading":"加载中","Loading Freebuff":"正在加载 Freebuff","Loading chats…":"正在加载对话…","Loading existing chats…":"正在加载已有对话…","Loading files":"文件加载中","Loading…":"加载中…","Local":"本地","Local browser":"本地浏览器","Local chat attachment":"本地对话附件","Local conversation":"本地对话","Local project":"本地项目","Look up issues, stack traces and releases without leaving the chat.":"不用离开对话，就能查 issue、堆栈跟踪和发布记录。","Low":"低","Low text contrast.":"文字对比度偏低。","Lowest":"最低","Luxembourg":"卢森堡","MCP bearer token":"MCP Bearer 令牌","MCP command or local URL":"MCP 命令或本地 URL","MCP environment variables":"MCP 环境变量","MCP name":"MCP 名称","MCP server URL":"MCP 服务器 URL","Machine":"机器","Machines":"机器","Make a dashboard of":"做个仪表盘：","Make a design board for":"做个设计板：","Make a skill":"创建技能","Make a slide deck about":"做个幻灯片：","Make a spreadsheet for":"做个表格：","Make your site live for everyone":"让所有人都能访问你的网站","Malaysia":"马来西亚","Malta":"马耳他","Manage Redis databases and inspect keys from chat.":"在对话里管理 Redis 数据库、查看键。","Manage queued messages":"管理排队消息","Manage site":"管理站点","Manage skills":"管理技能","Mark all read":"全部标为已读","Markdown as you type":"输入时即渲染 Markdown","Markdown exhibit":"Markdown 展示","Markdown view":"Markdown 视图","Match case":"区分大小写","Match system":"跟随系统","Matching chats":"匹配的对话","Math":"数学","Max":"最大","Maximize":"最大化","Maximize window":"最大化窗口","May use data for AI training":"可能将数据用于 AI 训练","Me":"我","Media":"媒体","Medium":"中","Mentions":"提及","Menu":"菜单","Merge PR":"合并 PR","Message":"消息","Message Freebuff":"给 Freebuff 发消息","Message feedback":"消息反馈","Mexico":"墨西哥","Middle":"中间","Migrate and Secure Enterprise Docs with Mintlify’s Expert Services":"用 Mintlify 的专家服务迁移企业文档并加固安全","Min value:":"最小值：","Mine":"我的","Minimal":"最小","Minimize":"最小化","Minimize window":"最小化窗口","Mintlify: AI-Native Docs Platform for Modern B2B Teams":"Mintlify：面向现代 B2B 团队的 AI 原生文档平台","Minus":"减","Missing models or features":"缺少模型或功能","Mission":"任务","Mission configuration":"任务配置","Mission effort":"任务强度","Missions":"任务","Mobile":"移动端","Mobile app":"移动应用","Model":"模型","Model Providers":"模型提供商","Model and reasoning":"模型与推理","Model preference":"模型偏好","Models":"模型","Models and pricing":"模型与价格","Monitoring":"监控","Moodboard":"灵感板","More":"更多","More actions":"更多操作","More chats":"更多对话","More projects":"更多项目","Move Freebuff to Applications":"把 Freebuff 移到应用程序文件夹","Move left":"左移","Move right":"右移","Move the block up or down":"上下移动块","Move the tab":"移动标签页","Move your .env secrets to Infisical":"把 .env 密钥迁移到 Infisical","Multiple selection":"多选","Muse Spark 1.3 replaces Muse Spark 1.2":"Muse Spark 1.3 取代 Muse Spark 1.2","My employer":"我的雇主","Name":"名称","Name and email":"姓名和邮箱","Native workspace unavailable":"本机工作区不可用","Navigation":"导航","Navigation history":"导航记录","Needs you":"需要你处理","Nest a list item":"嵌套列表项","Netherlands":"荷兰","Network request failed":"网络请求失败","Never":"从不","New Zealand":"新西兰","New advertiser":"新广告主","New campaign":"新建广告活动","New campaign for":"新建广告系列：","New chat":"新建对话","New chat in a new project":"在新项目里新建对话","New custom ad":"新建自定义广告","New file":"新建文件","New folder":"新建文件夹","New project":"新建项目","New repository":"新建仓库","New skill":"新建技能","New tab":"新建标签页","New thread":"新建会话","Newer messages":"较新的消息","Next":"下一步","Next match":"下一个匹配","Next question":"下一题","Next sample":"下一个示例","Next tab":"下一个标签页","Next templates":"下一组模板","Nice theme!":"主题不错！","No Node at all":"完全不用 Node","No ad selected.":"未选择广告","No ad to report":"没有可举报的广告","No advertisers found.":"未找到广告主。","No agentic ads found.":"未找到智能体广告。","No campaigns yet":"还没有广告活动","No chats found":"未找到对话","No chats yet":"还没有对话","No countries found.":"未找到国家","No custom ads saved yet.":"还没有保存自定义广告。","No data yet":"暂无数据","No deleted tab to restore.":"没有可恢复的已关闭标签页。","No diagnostics":"无诊断信息","No files":"没有文件","No headings yet":"暂无标题","No hours returned":"未返回小时数","No integrations":"暂无集成","No languages found":"未找到语言","No matches":"没有匹配项","No matches in loaded chats":"已加载的对话中没有匹配","No matching chats":"没有匹配的对话","No matching files.":"没有匹配的文件。","No notifications yet":"暂无通知","No project":"没有项目","No settings found":"未找到设置","No shipping address":"没有收货地址","No shortcuts found.":"未找到快捷键。","No title":"无标题","No tools available.":"没有可用的工具。","Nobody, I stick to free tools":"都不用，我只用免费工具","Node through Volta only":"Node 只用 Volta","Node through asdf shims only":"Node 只用 asdf shim","Node through fnm only":"Node 只用 fnm","Node through mise only":"Node 只用 mise","Node through nvm only":"Node 只用 nvm","None":"无","None of your legacy projects can be copied.":"你的旧版项目都无法复制。","Normal":"常规","North Korea":"朝鲜","Norway":"挪威","Not an older PC? Standard build":"不是老电脑？用标准版本","Not answered":"未回答","Not approved":"未批准","Not at all":"一点也不","Not available yet":"暂未开放","Not deployed":"未部署","Not deploying yet":"暂时不部署","Not disappointed":"没有失望","Not enough hours":"小时数不够","Not now":"暂不","Not on GitHub":"不在 GitHub 上","Not planning to":"不打算","Not relevant":"不相关","Not set up yet":"尚未设置","Not shopping":"不购物","Not sure":"不确定","Note":"备注","Nothing came back from the search this time.":"这次搜索没有返回结果。","Nothing open right now. New ones show up here.":"当前没有打开的内容。新的会显示在这里。","Nothing to compact yet.":"暂无可压缩的内容。","Nothing, I'll stay free":"什么都不加，我继续用免费版","Notification sounds":"通知声音","Notifications":"通知","Novita route — evaluation only":"Novita 线路，仅供评估","Now, what are we building?":"现在，我们做点什么？","Number":"数字","Numbered list":"编号列表","Observability":"可观测性","Off":"关闭","Offers":"优惠","Older PC without AVX2?":"老电脑没有 AVX2？","Older messages":"较早的消息","On ARM64 Linux?":"在 ARM64 Linux 上？","On Google flex capacity. If it is down, DeepSeek V4.1 Flash answers for the rest of the session.":"使用 Google 弹性算力。它不可用时，本次会话余下时间由 DeepSeek V4.1 Flash 代答。","On OpenAI flex capacity, with a standard-tier backup when it’s busy.":"使用 OpenAI 弹性算力，繁忙时回退到标准档。","On an Intel Mac?":"在用 Intel Mac？","Onboarding prompt":"引导提示词","Online store":"在线商店","Only Freebuff":"仅 Freebuff","Only these":"仅这些","Open":"打开","Open Account settings":"打开账户设置","Open Reddit with it filled in":"打开 Reddit，内容已填好","Open a folder":"打开文件夹","Open a project to get started":"打开项目即可开始","Open another folder":"打开其他文件夹","Open as page":"以页面打开","Open browser again":"重新打开浏览器","Open copy":"打开副本","Open folder":"打开文件夹","Open image":"打开图片","Open in Google Play":"在 Google Play 中打开","Open in the App Store":"在 App Store 中打开","Open link":"打开链接","Open local folder":"打开本地文件夹","Open on GitHub":"在 GitHub 上打开","Open project":"打开项目","Open settings":"打开设置","Open signup tab":"打开注册标签页","Open tabs":"打开的标签页","Open the download to get started":"打开下载文件即可开始","Open the post":"打开帖子","Open the side panel for more":"打开侧边面板查看更多","Open the sign-up page with your email filled in.":"打开注册页，邮箱已填好。","Open the sign-up page without it.":"打开注册页，不填邮箱。","Open the thread":"打开会话","Open the video":"打开视频","OpenAI flagship · 1 session a day":"OpenAI 旗舰 · 每天 1 次会话","OpenAI · 2 sessions a day":"OpenAI · 每天 2 次会话","Opening your saved workspace took too long.":"打开已保存的工作区耗时过长。","Opt in":"选择加入","Optional":"可选","Or":"或","Original colors":"原始颜色","Other":"其他","Other downloads":"其他下载","Other models":"其他模型","Our pick for this section":"本节精选","Outline":"大纲","Output":"输出","Overview":"概览","Owner":"所有者","PDF document":"PDF 文档","PNG, JPEG, WebP or GIF":"PNG、JPEG、WebP 或 GIF","Paid plan":"付费套餐","Pakistan":"巴基斯坦","Palestine":"巴勒斯坦","Panel blur":"面板模糊","Panel landscape 16:9":"面板横版 16:9","Panel portrait 3:5":"面板竖版 3:5","Panel square 1:1":"面板方形 1:1","Panel tall 2:5":"面板长竖版 2:5","Panel transparency":"面板透明度","Panels":"面板","Paragraph":"段落","Paste":"粘贴","Path copied":"已复制路径","Pattern":"匹配模式","Pause":"暂停","Pause preview":"暂停预览","Pause sample":"暂停示例","Pause the queue here until you resume it":"在此暂停队列，等你恢复","Pause this project's popup for 14 days":"暂停此项目的弹窗 14 天","Paused":"已暂停","Pay now":"立即支付","Payment":"支付","Payment history":"付款记录","Payments":"支付","Pending":"待处理","People with access":"有访问权限的人","Percent, one decimal":"百分比，保留一位小数","Perfect":"完美","Permission saved":"权限已保存","Peru":"秘鲁","Philippines":"菲律宾","Phone (optional)":"手机号（可选）","Pick a color from the screen":"从屏幕上取色","Pick all that apply":"选出所有适用项","Pick from screen":"从屏幕选取","Pick one":"选择一个","Pin":"置顶","Pinned":"已固定","Pixel size":"像素大小","Places in this doc":"本文档中的位置","Plain paragraph":"普通段落","Plain text":"纯文本","Plan":"套餐","Plan a weekend in Lisbon for two":"规划两个人的里斯本周末行程","Plan before making changes":"修改前先规划","Plan bonus":"套餐奖励","Plan, build and fix code from your terminal.":"在终端里规划、构建和修复代码。","Plan, build, and fix code from your command line":"在命令行里规划、构建和修复代码","Plans":"套餐","Play preview":"播放预览","Play sample":"播放示例","Please allow ads on Freebuff.":"请在 Freebuff 上允许广告。","Please try again in a minute.":"请一分钟后再试。","Please write at least":"请至少输入","Plus":"加","Poland":"波兰","Policy update":"政策更新","Popular":"热门","Popular models":"热门模型","Portfolio":"作品集","Portugal":"葡萄牙","Post":"发布","Post on X":"发布到 X","Post this comment":"发布这条评论","Postal code":"邮政编码","Powerful":"强大","Powerful switch":"Powerful 开关","Pre-sync projects to Cloud":"预先把项目同步到云端","Premium":"高级版","Prepaid credits":"预付额度","Preparing":"准备中","Presence":"在线状态","Preset name":"预设名称","Presets":"预设","Press a key combination. Esc to cancel.":"按下组合键。按 Esc 取消。","Preview":"预览","Previous":"上一步","Previous match":"上一个匹配","Previous or next tab":"上一个或下一个标签页","Previous question":"上一题","Previous sample":"上一个示例","Previous tab":"上一个标签页","Previous templates":"上一组模板","Privacy":"隐私","Private":"私有","Procedure":"流程","Processing":"处理中","Product tours not loaded":"产品引导未加载","Production":"生产环境","Profile answers":"资料答案","Progress":"进度","Project":"项目","Project actions":"项目操作","Project chats":"项目对话","Project failed to load":"项目加载失败","Project file upload failed":"项目文件上传失败","Project location":"项目位置","Project name":"项目名称","Project not found":"未找到项目","Project settings":"项目设置","Project source":"项目来源","Project unavailable":"项目不可用","Project: New project":"项目：新建项目","Projects":"项目","Projects and chats":"项目和对话","Promote":"推广","Promote a YouTube video":"推广 YouTube 视频","Promote a post on X":"推广 X 上的帖子","Promote your posts on Freebuff":"在 Freebuff 上推广你的帖子","Promotional":"促销","Prompt history":"提示词历史","Proposal not found":"未找到提案","Provider":"提供商","Provider API key":"提供商 API 密钥","Provider base URL":"提供商基础 URL","Provider model ID":"提供商模型 ID","Proxy detected, verify country to unlock":"检测到代理，验证国家后解锁","Public":"公开","Publish":"发布","Publish changes":"发布更改","Publish site":"发布站点","Publish this post":"发布这条帖子","Publish your site":"发布你的站点","Published to":"已发布到","Push files":"推送文件","Python is externally managed (PEP 668)":"Python 由外部管理（PEP 668）","Python through uv only":"Python 只用 uv","QR code to get Freebuff on your phone":"扫码在手机上获取 Freebuff","Quality or reliability":"质量或稳定性","Question progress":"答题进度","Questions":"问题","Questions complete":"问卷已完成","Queue":"队列","Queue message":"排队消息","Queue paused":"队列已暂停","Queued batches":"排队批次","Queued messages":"排队消息","Queued prompt":"排队的提示词","Quick picks":"快捷推荐","Quick survey":"快速问卷","Quit anyway":"仍然退出","Quit while work is running?":"工作还在运行，确定退出？","Quote":"引用","RAR archive":"RAR 压缩包","Radar":"雷达图","Radial":"径向","Raise daily cap":"提高每日上限","Raise total budget":"提高总预算","Ran a command":"运行了命令","Ran a tool":"运行了工具","Ran commands":"运行了多条命令","Ran tools":"运行了多个工具","Random":"随机","Ranking":"排名","React Native or Flutter":"React Native 或 Flutter","Read":"读取","Read 20 pages":"读取了 20 页","Read URL":"读取 URL","Read a file":"读取文件","Read artifact":"读取产物","Read artifact guide":"读取产物指南","Read comments":"读取评论","Read docs":"读取文档","Read files":"读取文件","Read integration tools":"读取集成工具","Read tree":"读取目录树","Reading folder":"正在读取文件夹","Ready to claim":"可领取","Ready to run campaigns":"可开始投放广告系列","Ready when the current response finishes.":"当前回复结束后就绪。","Reasoning output (included)":"推理输出（已包含）","Recent chats":"最近对话","Recent projects":"最近项目","Recent requests":"最近请求","Recent rewards":"最近的奖励","Recent signups":"最近注册","Recent usage":"最近用量","Recommended":"推荐","Reconnect":"重新连接","Reconnect folder":"重新连接文件夹","Recorded samples":"已录制样本","Reddit pixel unavailable":"Reddit 像素不可用","Reddit research":"Reddit 调研","Redo":"重做","Referrals":"推荐","Refresh app":"刷新应用","Refresh latest":"刷新到最新","Refresh required":"需要刷新","Regular":"常规","Reject":"拒绝","Reject all":"全部拒绝","Rejected":"已拒绝","Relevant":"相关","Relevant to this conversation":"与本次对话相关","Reload":"重新加载","Reload from disk":"从磁盘重新加载","Reload now":"立即重新加载","Reload page":"重新加载页面","Reload the page to sign in.":"刷新页面即可登录。","Reload the page to try again.":"刷新页面后重试。","Remote":"远程","Remote URL":"远程 URL","Remote devices":"远程设备","Remove":"移除","Remove Tier 1 countries":"移除一级国家","Remove all":"全部移除","Remove folder":"移除文件夹","Remove link":"移除链接","Remove one":"移除一项","Remove template":"移除模板","Remove?":"移除？","Removed block":"已移除区块","Removed board":"已移除看板","Removed item":"已移除条目","Removed slide":"已移除幻灯片","Removed:":"已移除：","Removes extra spaces.":"删除多余空格。","Rename":"重命名","Rename the tab":"重命名标签页","Rename thread":"重命名会话","Render, Railway or Fly":"Render、Railway 或 Fly","Reopen closed tab":"重新打开已关闭的标签页","Repeats text.":"重复文本。","Replace":"替换","Replace all":"全部替换","Replace all matches":"全部替换匹配项","Replace site":"替换站点","Replace the live":"替换线上","Replace with":"替换为","Replace with a newer post":"替换为较新的帖子","Reply to comment":"回复评论","Reply with this":"用这条回复","Report issue or feature":"报告问题或功能","Report sent":"举报已提交","Report this ad":"举报此广告","Report this proposal":"举报此提案","Reporting is unavailable":"举报功能不可用","Repositories":"仓库","Repositories that changed":"有变更的仓库","Repository":"仓库","Repository name":"仓库名称","Repost":"重新发布","Request":"请求","Request aborted":"请求已中止","Required":"必填","Reset all":"全部重置","Resize explorer panel":"调整资源管理器宽度","Resize left sidebar":"调整左侧边栏宽度","Resize settings sidebar":"调整设置侧边栏大小","Respan API key":"Respan API 密钥","Response":"响应","Restore":"还原","Restore version":"恢复此版本","Restore window":"还原窗口","Result":"结果","Result:":"结果：","Resume":"继续","Resume mission":"继续任务","Resume queue":"继续队列","Retro terminal":"复古终端","Retry":"重试","Retry chat":"重试对话","Retry chats":"重试多个对话","Retry connection":"重试连接","Retry copy":"重试复制","Retry custom MCPs":"重试自定义 MCP","Retry image":"重试图片","Retry loading pinned chats":"重试加载置顶对话","Retry message":"重试消息","Retry projects":"重试项目","Retry save":"重试保存","Retry submission":"重试提交","Review":"审查","Review MCP tools":"审查 MCP 工具","Review and next steps":"审查与后续步骤","Review changes":"审查变更","Review code changes":"审查代码变更","Review complete":"审查完成","Review continues. Track this project in Earn.":"审查仍在继续。可在 Earn 中跟踪该项目。","Review the changes":"审查变更","Review the pull request":"审查拉取请求","Review tools":"审查工具","Reviewing":"审查中","Reviewing your account":"正在审核你的账号","Rewards":"奖励","Rewards could not load.":"奖励加载失败。","Right panel":"右侧面板","Roll back":"回滚","Roll back to here":"回滚到这里","Romania":"罗马尼亚","Rounds away from zero.":"向远离 0 的方向舍入。","Rounds down to a multiple.":"向下舍入到最近的倍数。","Rounds toward zero.":"向 0 的方向舍入。","Rounds up to a multiple.":"向上舍入到最近的倍数。","Rules and appeals":"规则与申诉","Run":"运行","Run all":"全部运行","Run error:":"运行错误：","Run in your terminal:":"在终端中运行：","Run it again":"再运行一次","Run live prompt":"运行实时提示词","Run location":"运行位置","Run location is set for this chat":"这个对话已设定运行位置","Run location: Local":"运行位置：本地","Run on bench":"在评测台上运行","Running":"运行中","Runs (":"运行（","Runs on DeepSeek’s own API.":"运行在 DeepSeek 自家 API 上。","Runs per repository":"每个仓库的运行次数","Runtime":"运行时","Russia":"俄罗斯","SDK is installed":"已安装 SDK","SQLite database":"SQLite 数据库","SaaS product":"SaaS 产品","Sample unavailable":"样本不可用","Sat":"周六","Saturation and brightness":"饱和度与亮度","Saturday":"星期六","Saturday.":"星期六","Saudi Arabia":"沙特阿拉伯","Save":"保存","Save and claim":"保存并领取","Save chart":"保存图表","Saved":"已保存","Saved as a draft":"已保存为草稿","Saved custom ads":"已保存的自定义广告","Saved on this device.":"已保存到此设备。","Saved to your account.":"已保存到你的账号。","Saving":"保存中","Saving is taking too long.":"保存耗时过长。","Saving project":"正在保存项目","Scatter":"散点图","Scientific":"科学计数法","Screenshot":"截图","Script":"脚本","Scripts and automation":"脚本与自动化","Scroll to latest":"滚动到最新","Search":"搜索","Search 1,000+ more":"再搜索 1,000+ 个","Search ads":"搜索广告","Search advertisers":"搜索广告主","Search advertisers, campaigns, or ads":"搜索广告主、广告系列或广告","Search all advertisers, including those without campaigns":"搜索全部广告主，包括没有广告系列的","Search chats":"搜索对话","Search code languages":"搜索代码语言","Search countries":"搜索国家","Search integrations":"搜索集成","Search repositories":"搜索仓库","Search results":"搜索结果","Search settings":"搜索设置","Search shortcuts":"搜索快捷键","Search skills":"搜索技能","Search web":"搜索网页","Secrets":"密钥","Secure checkout by Stripe":"由 Stripe 提供安全结账","Security":"安全","See all rewards":"查看全部奖励","See more":"查看更多","See plans":"查看套餐","See your referrals":"查看你的推荐","Self-hosted":"自托管","Send":"发送","Send a message today to start one.":"今天发一条消息就能开始计时。","Send feedback":"发送反馈","Send invite":"发送邀请","Send now":"立即发送","Send report":"发送报告","Send your first message":"发送第一条消息","Sending invite":"正在发送邀请","Sending now":"正在发送","Sent":"已发送","Sep":"9 月","September":"9 月","Server":"服务器","Session remaining":"会话剩余时间","Sessions":"会话","Sessions by model":"按模型统计的会话","Set it up for me":"帮我配置","Set up":"配置","Set up the account yourself instead.":"改为你自己设置账号。","Set up your account":"设置账号","Settings":"设置","Settings search results":"设置搜索结果","Settings sections":"设置分区","Setup needed":"需要配置","Shadows":"阴影","Share":"分享","Share artifact":"分享产物","Share chat":"分享对话","Share it with your friends.":"分享给朋友","Share on LinkedIn":"分享到 LinkedIn","Share project":"分享项目","Share your streak and give your friends unlimited free coding.":"分享你的连续天数，让朋友免费无限编程。","Sheet":"表格","Sheets":"电子表格","Shipped":"已交付","Shipping address":"收货地址","Ships to":"配送至","Show all models":"显示全部模型","Show in Discord status":"在 Discord 状态中显示","Show in Finder":"在访达中显示","Show in folder":"在文件夹中显示","Show less":"收起","Show more":"展开更多","Show older":"显示更早","Show outline":"显示大纲","Show sponsor":"显示赞助","Show task":"显示任务","Show the old instructions":"查看旧版说明","Showing shipped skills only: campaigns and Lab versions did not load.":"仅显示已发布的技能：广告系列和 Lab 版本未能加载。","Showing the first 512 KB.":"仅显示前 512 KB。","Side chat":"侧边对话","Side projects":"副业项目","Sidebar 4:3":"侧边栏 4:3","Sign in":"登录","Sign in to Freebuff":"登录 Freebuff","Sign in to Freebuff to use Cloud":"登录 Freebuff 才能使用云端","Sign in to connect your apps":"登录以连接你的应用","Sign in to invite friends":"登录以邀请好友","Sign in to open Community.":"登录后即可打开社区。","Sign in to search your chats":"登录以搜索你的对话","Sign in to send feedback":"登录以发送反馈","Sign in to share themes.":"登录后即可分享主题。","Sign out":"退出登录","Sign-in didn't load":"登录页未能加载","Sign-in methods":"登录方式","Signup status":"注册状态","Simple":"简约","Singapore":"新加坡","Single Choice":"单选","Site environment":"站点环境","Site overview":"站点概览","Sites":"站点","Size":"大小","Sketch a whiteboard of":"画一张白板，内容是","Skill":"技能","Skill JSON":"技能 JSON","Skill editor":"技能编辑器","Skill eval bench":"技能评测台","Skills":"技能","Skip":"跳过","Skip the rest":"跳过其余","Skip these questions":"跳过这些问题","Skip to content":"跳到主要内容","Skipped":"已跳过","Slides":"幻灯片","Slovakia":"斯洛伐克","Small":"小","Smart & Fast":"智能且快","Smart & fast":"智能且快速","Social":"社交","Social media":"社交媒体","Software":"软件","Some chats":"部分对话","Some token counts are unavailable":"部分 token 数量不可用","Something else":"其他","Something on this computer or network, such as a proxy or an antivirus web shield, is intercepting Freebuff’s secure connection.":"这台电脑或网络上的某个东西（例如代理或杀毒软件的网页防护）正在拦截 Freebuff 的安全连接。","Something went wrong":"出错了","Something went wrong.":"出错了。","Something worked especially well":"有些地方特别好用","Somewhat disappointed":"有点失望","Somewhere else":"其他地方","Sortable":"可排序","Source":"来源","South Africa":"南非","South Korea":"韩国","Spain":"西班牙","Spend by model":"按模型统计支出","Split a paragraph, or start a new block":"拆分段落，或开始新块","Sponsored":"赞助","Sponsored by":"赞助方","Sponsored offer":"赞助优惠","Sponsored posts":"赞助帖子","Sponsored proposal":"赞助提案","Sponsored proposal options":"赞助提案选项","Sponsored skills":"赞助技能","Standard":"标准","Start":"开始","Start Freebuff in your project":"在你的项目中启动 Freebuff","Start a chat first":"请先开始对话","Start a project":"开始项目","Start a streak":"开启连续天数","Start building":"开始构建","Start coding":"开始编程","Start date":"开始日期","Start dictation":"开始语音输入","Start free":"免费开始","Start free run":"开始免费运行","Start from":"起点","Start from a template":"从模板开始","Start from scratch":"从零开始","Start here":"从这里开始","Start implementation":"开始实现","Start the project from files you already have":"用已有文件开始项目","Start with a template":"从模板开始","Start your first project.":"开始你的第一个项目。","Start your streak":"开启连续天数","Starters":"起步模板","Starting":"正在启动","Starting branch":"起始分支","Starting in debug mode":"正以调试模式启动","Startup script":"启动脚本","State or province":"州或省","Static website":"静态网站","Stays on your computer. Freebuff never reads it.":"只留在你的电脑上。Freebuff 不会读取。","Stealth model. May change or be withdrawn without notice.":"隐身模型，可能随时变更或下线，不另行通知。","Step reached":"到达的步骤","Steps":"步骤","Stop":"停止","Stop and close session":"停止并关闭会话","Stop dictation":"停止语音输入","Stop mission":"停止任务","Stop the answer":"停止回答","Stopped":"已停止","Stopping":"正在停止","Storage":"存储","Stored on this device":"存储在此设备","Stores":"商店","Streak reward":"连续天数奖励","Streak rewards":"连续天数奖励","Strikethrough":"删除线","String":"字符串","Strong all-around":"全面强劲","Strong reasoning":"强推理","Strongest price-to-performance models":"性价比最高的模型","Student":"学生","Students":"学生","Styles":"样式","Subagent":"子智能体","Submit":"提交","Submit feedback":"提交反馈","Submit for review":"提交审查","Submit proof":"提交凭证","Submitted":"已提交","Submitted for review":"已提交审核","Subscript":"下标","Subtitle":"副标题","Success":"成功","Success criteria":"成功标准","Suggest":"建议","Suggested next steps":"建议的后续步骤","Suggested replies":"建议回复","Suggesting":"正在生成建议","Suggestions":"建议","Sum":"求和","Summarise Q3 report":"汇总第三季度报告","Sun":"周日","Sunday":"星期日","Sunday.":"星期日","Supabase publishable key":"Supabase 可发布密钥","Supercharge Large Codebases with Parallel AI Innovation":"用并行 AI 加速大型代码库","Superscript":"上标","Surface fade":"表面渐隐","Surge API key":"Surge API 密钥","Survey complete":"问卷已完成","Survey element not found":"未找到问卷元素","Survey not found":"未找到问卷","Survey progress":"问卷进度","Sweden":"瑞典","Switch between Code and Chat":"在代码和对话之间切换","Switch to Muse Spark 1.3":"切换到 Muse Spark 1.3","Switzerland":"瑞士","Symbol":"符号","Symbol.":"符号。","Syria":"叙利亚","System":"系统","TAR archive":"TAR 压缩包","Tab":"标签页","Tab 1":"标签页 1","Tab name":"标签页名称","Tab options":"标签页选项","Table":"表格","Table of contents":"目录","Tablet":"平板","Tabs":"标签页","Taiwan":"台湾","Take all":"全部领取","Tap one to continue":"点选一项以继续","Task":"任务","Tell us a little more":"再多说一点","Tell us more":"告诉我们更多","Template":"模板","Template categories":"模板分类","Temporary price. It goes up when the promotion ends.":"临时价格，促销结束后会上调。","Terminal":"终端","Terms":"服务条款","Test in Desktop":"在桌面应用里测试","Test your app at a shareable link":"用可分享的链接测试你的应用","Testing":"测试","Text":"文本","Text actions":"文本操作","Textarea":"多行文本","Thailand":"泰国","Thanks for answering.":"感谢作答。","Thanks!":"谢谢！","Thanks, that helps":"谢谢，有帮助","Thanks, that's everything.":"谢谢，就这些。","The ad selected above":"上方选中的广告","The agent missed or broke something":"智能体漏掉了或弄坏了东西","The file may be damaged or use an unsupported image format.":"文件可能已损坏，或使用了不支持的图片格式。","The renewal payment failed. Update your card to restore it.":"续费扣款失败。更新银行卡即可恢复。","The run recorded no agent output.":"本次运行没有记录到智能体的输出。","The selected ad is no longer available.":"选中的广告已不可用。","The selected custom theme is missing from your theme collection.":"选中的自定义主题不在你的主题列表里。","The size of messages in a chat. The rest of the app keeps its size.":"对话中消息的大小。应用其他部分保持原有大小。","The trace stops here: the run has more events than a trace reads.":"追踪到此为止：本次运行的事件数超出追踪能读取的范围。","Theme":"主题","Theme IDs must be unique.":"主题 ID 不能重复。","Theme colors":"主题颜色","Theme previews":"主题预览","Then run":"然后运行","Thinking":"思考中","This computer":"这台电脑","This computer couldn’t look up Freebuff’s servers. Check your internet connection, VPN or DNS settings.":"这台电脑查不到 Freebuff 的服务器。检查网络连接、VPN 或 DNS 设置。","This form is from earlier in the conversation.":"这个表单来自对话中较早的位置。","This image link has expired. The saved copy is in the project.":"图片链接已过期。副本已保存在项目中。","This model is leaving Freebuff soon. Pick another model to keep working without interruption.":"这个模型即将从 Freebuff 下线。换一个模型继续，避免中断。","This month":"本月","This page didn't load":"此页面未能加载","This page failed to load":"此页面加载失败","This quarter":"本季度","This side chat is gone.":"这个侧边对话已不存在。","Thought":"思考","Thousands (12k)":"千位分隔（12k）","Thread token usage":"会话 token 用量","Thread tools":"会话工具","Thread usage":"会话用量","Throttled":"已限速","Thu":"周四","Thursday":"星期四","Tick the task the caret is on":"勾选光标所在的任务","Ticks":"刻度线","Tier 1 (":"一级（","Tier 1 countries":"一级国家","Tier 1 countries (":"一级国家（","Tiers":"层级","Tight":"紧凑","Tight sets letters slightly closer, as Inter is usually set.":"紧凑会让字间距略微收紧，与 Inter 的常用设置一致。","Tilde":"波浪号","Tip":"提示","Title":"标题","Titles":"标题","To-dos":"待办","Today's date.":"今天的日期。","Today's usage has run out":"今日用量已用尽","Toggle":"开关","Toggle bottom terminal":"显示或隐藏底部终端","Toggle files":"显示或隐藏文件","Toggle left sidebar":"切换左侧边栏","Toggle overview":"显示或隐藏概览","Toggle right panel":"显示或隐藏右侧面板","Tokens":"Token","Too expensive":"太贵了","Too repetitive":"重复度过高","Tool":"工具","Tools":"工具","Tooltip":"提示框","Top cause":"主要原因","Trace":"追踪","Trace your LLM calls with Respan":"用 Respan 追踪 LLM 调用","Track package":"跟踪包裹","Tracked links":"跟踪链接","Transcribing":"转写中","Trip planning":"行程规划","Trusted by developers in":"深受以下地区的开发者信赖","Trusted by users from":"深受以下地区的用户信赖","Try Neon":"试试 Neon","Try again":"重试","Try again to open this page.":"请重新尝试打开此页面。","Try again to open your project.":"请重新尝试打开你的项目。","Trying again now.":"正在重试。","Tue":"周二","Tuesday":"星期二","Tuned for agent work":"为智能体工作调优","Turn off":"关闭","Turn off Powerful?":"关闭 Powerful？","Turn off sponsored proposals":"关闭赞助提案","Turn on":"开启","Turn your idea":"把你的想法","Two columns":"两栏","Two decimals":"两位小数","Type":"类型","URL Autolink":"URL 自动链接","Ukraine":"乌克兰","Unassigned":"未分配","Unattributed":"未归属","Unavailable":"不可用","Undefined":"未定义","Under review":"审核中","Undo":"撤销","Undo these changes":"撤销这些变更","Unfold line":"展开此行","Unidentified":"未识别","Uninitialized":"未初始化","United Arab Emirates":"阿联酋","United Kingdom":"英国","United States":"美国","Universal":"通用","Unknown":"未知","Unknown action":"未知操作","Unknown encoding:":"未知编码：","Unknown error":"未知错误","Unknown option":"未知选项","Unknown persistence type":"未知持久化类型","Unlock by referring friends":"邀请好友即可解锁","Unlock custom themes":"解锁自定义主题","Unlocked":"已解锁","Unpin":"取消固定","Unreachable":"无法访问","Unread response":"未读回复","Unsupported child node:":"不支持的子节点：","Unsupported protocol":"不支持的协议","Untitled":"无标题","Untitled ad":"无标题广告","Untitled chat":"无标题对话","Untitled check":"无标题检查","Untitled dashboard":"未命名仪表盘","Untitled deck":"未命名幻灯片","Untitled design":"未命名设计","Untitled sheet":"未命名表格","Untitled whiteboard":"未命名白板","Update":"更新","Update card":"更新银行卡","Updates are unavailable":"更新不可用","Upgrade":"升级","Upgrade for more usage":"升级以获得更多用量","Upload":"上传","Upload cancelled":"上传已取消","Upload cancelled.":"上传已取消。","Upload failed.":"上传失败。","Upload failed. Try again.":"上传失败，请重试。","Upload files":"上传文件","Upload folder":"上传文件夹","Upload image":"上传图片","Upload logo":"上传徽标","Uploading files":"正在上传文件","Upstage flagship":"Upstage 旗舰模型","Usage":"用量","Usage & limits":"用量与限额","Usage agreement":"使用协议","Usage rules":"使用规则","Usage unavailable":"用量不可用","Use":"使用","Use Free":"使用免费版","Use a six-digit hex color, such as #759e58.":"使用六位十六进制颜色，例如 #759e58。","Use an HTTPS URL.":"请使用 HTTPS URL。","Use an HTTPS signup URL.":"请使用 HTTPS 注册链接。","Use an https image link.":"请使用 https 图片链接。","Use an image under 5 MB.":"请使用小于 5 MB 的图片。","Use an imported PNG, JPEG or WebP image, a bundled wallpaper, or a gradient.":"使用导入的 PNG、JPEG 或 WebP 图片、内置壁纸或渐变。","Use integrations":"使用集成","Use it here":"在此使用","Use suggestion":"使用建议","Use template":"使用模板","Use the same Freebuff account":"使用同一个 Freebuff 账号","Use the suggested message":"使用建议的消息","Used the browser":"使用了浏览器","User not found":"未找到用户","Users":"用户","Using environment:":"使用的环境：","VPN detected, verify country to unlock":"检测到 VPN，验证国家后解锁","Value":"值","Value out of range":"数值超出范围","Vector search":"向量搜索","Verification failed":"验证失败","Verification required.":"需要验证。","Verified":"已验证","Verify again":"重新验证","Verify my account":"验证我的账号","Verify my identity":"验证我的身份","Verify my phone number":"验证我的手机号","Verify your phone":"验证你的手机号","Verifying":"验证中","Version":"版本","Version history":"版本历史","Version value out of range":"版本值超出范围","Versions":"版本","Very disappointed":"非常失望","Via CrofAI":"经由 CrofAI","Via project":"来自项目","Video":"视频","Vietnam":"越南","View only":"仅查看","View post":"查看帖子","View preview":"查看预览","View run":"查看运行","View source":"查看源码","View what it did":"查看它做了什么","Viewing":"正在查看","Visibility":"可见性","Visit site":"访问网站","Vite static frontend":"Vite 静态前端","Voice AI APIs for builders":"面向开发者的语音 AI API","Waiting":"等待中","Waiting for payment":"等待付款","Waiting for your answer":"等待你的回答","Wallet":"钱包","Wallpaper":"壁纸","Wallpaper link":"壁纸链接","Wallpaper type":"壁纸类型","Want a FAQ under the plans too?":"套餐下面也要加常见问题吗？","Want different words?":"想换个说法？","Want me to book a table for Saturday night?":"要我订周六晚上的餐位吗？","Warning":"警告","Watch this run":"关注此运行","Weak":"较弱","Wearable":"可穿戴设备","Website":"网站","Websites and apps":"网站与应用","Wed":"周三","Wednesday":"星期三","Weekday and date":"星期与日期","Weekend in Lisbon":"里斯本的周末","Welcome questions":"欢迎页问题","Welcome to Freebuff":"欢迎使用 Freebuff","What best describes you?":"哪项最符合你的情况？","What can I help build?":"想让我帮你做点什么？","What could be better?":"哪里可以做得更好？","What does it cost?":"费用是多少？","What is this project about?":"这个项目是做什么的？","What kind of feedback is this?":"这是什么类型的反馈？","What the assistant is doing":"助手正在做什么","What the image shows":"图片内容","What to know:":"须知：","What to talk about":"想聊的内容","When a run asks for signup":"运行要求注册时","When it's busy, DeepSeek V4.1 Flash answers instead.":"它繁忙时由 DeepSeek V4.1 Flash 代答。","When should we suggest your product?":"什么时候推荐你的产品？","Where do you deploy?":"你部署在哪里？","Where the MCP server runs":"MCP 服务器的运行位置","Where the campaign runs":"广告系列的投放位置","Where you are mentioned":"你被提及的地方","Which frameworks?":"使用哪些框架？","Whiteboard":"白板","Whiteboards":"白板","Whole number":"整数","Why this ad":"为什么显示此广告","Why this?":"为什么是这个？","Window":"窗口","Windows 64-bit":"Windows 64 位","Windows 8.1 or older":"Windows 8.1 或更早","Windows Older PCs":"较旧的 Windows 电脑","Word document":"Word 文档","Work projects":"工作项目","Work with your local files, run commands and build apps.":"使用本地文件、运行命令、构建应用。","Working":"运行中","Workspace":"工作区","Workspace files":"工作区文件","Workspace mode":"工作区模式","Worktree":"工作树","Write":"写入","Write a doc about":"写一篇文档，主题是","Write a message":"写一条消息","Write another":"再写一条","Write doc":"写文档","X pixel unavailable":"X 像素不可用","Year to date":"年初至今","Yes":"是","Yesterday":"昨天","You just unlocked unlimited free coding":"你已解锁无限免费编程","You might also want to try":"你可能还想试试","You're on fire!":"你太厉害了！","Your 1 answer so far is":"你目前的 1 条回答是","Your Desktop sign-in has expired. Sign out, then sign in again.":"桌面端登录已过期。先退出登录，再重新登录。","Your YouTube comment":"你的 YouTube 评论","Your account is reinstated":"你的账号已恢复","Your artifacts":"你的产物","Your comment":"你的评论","Your draft will stay here while you finish signing in.":"登录期间，草稿会保留在这里。","Your feedback":"你的反馈","Your hold has ended. You can still submit while spots remain.":"你的保留名额已结束。还有名额时仍可提交。","Your invite":"你的邀请","Your invite link":"你的邀请链接","Your key":"你的密钥","Your message":"你的消息","Your post":"你的帖子","Your provider":"你的服务商","Your providers":"你的服务商","Your reply":"你的回复","Your row text":"你的行文本","Your skills":"你的技能","Your subscription":"你的订阅","ZIP archive":"ZIP 压缩包","Zoom in":"放大","Zoom out":"缩小","account":"账号","branch":"分支","chat":"对话","draft":"草稿","file":"文件","folder":"文件夹","model":"模型","preview":"预览","private":"私有","project":"项目","public":"公开","repository":"仓库","search":"搜索","session":"会话","settings":"设置","skill":"技能","tab":"标签页","template":"模板","terminal":"终端","thread":"会话","workspace":"工作区"}
  const RULES = [["Delete \u0000?","删除{0}？"],["Remove \u0000?","移除{0}？"],["Archive \u0000?","归档{0}？"],["Discard \u0000?","放弃{0}？"],["Are you sure you want to delete \u0000?","确定要删除{0}吗？"],["Collapse \u0000","收起{0}"],["Expand \u0000","展开{0}"],["Close \u0000","关闭{0}"],["Project actions for \u0000","{0} 的项目操作"],["New chat in \u0000","在 {0} 中新建对话"],["Loading \u0000…","正在加载{0}…"],["Daily hours: \u0000 of \u0000 remaining","每日小时：剩余 {0} / {1}"],["\u0000 of \u0000 remaining","剩余 {0} / {1}"],["\u0000 hours remaining","剩余 {0} 小时"],["\u0000 left","剩余 {0}"],["Show \u0000 more","再显示 {0} 条"],["\u0000 more","还有 {0} 条"],["Just now","刚刚"],["\u0000 minutes ago","{0} 分钟前"],["\u0000 hours ago","{0} 小时前"],["\u0000 days ago","{0} 天前"],["\u0000 min ago","{0} 分钟前"],["\u0000 hr ago","{0} 小时前"],["\u0000 h ago","{0} 小时前"],["\u0000 m ago","{0} 分钟前"],["\u0000 d ago","{0} 天前"],["Yesterday","昨天"],["Today","今天"]]

  const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/
  const SPACE = /\s+/g
  const DISABLE_KEY = 'freebuff-zh:disabled'

  const ATTRS = [
    'placeholder',
    'aria-label',
    'aria-placeholder',
    'aria-valuetext',
    'aria-description',
    'title',
    'data-tooltip',
    'data-placeholder',
    'alt',
  ]
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'KBD', 'SAMP', 'SVG', 'CANVAS', 'MATH', 'TEMPLATE'])
  const SKIP_SELECTOR =
    '[contenteditable=""],[contenteditable="true"],[data-freebuff-zh-skip],.monaco-editor,.cm-editor,.cm-content,.xterm,.xterm-helper-textarea,[data-stream-word]'

  function isDisabled() {
    try {
      return window.localStorage.getItem(DISABLE_KEY) === '1'
    } catch (error) {
      return false
    }
  }

  /* ---------------------------------------------------------------- 词表 */

  const exact = new Map()
  const collapsed = new Map()
  for (const key of Object.keys(DICT)) {
    const value = DICT[key]
    if (!value) continue
    exact.set(key, value)
    const norm = key.replace(SPACE, ' ').trim()
    if (!collapsed.has(norm)) collapsed.set(norm, value)
  }

  const COUNT_UNITS = {
    chats: '个对话',
    threads: '个会话',
    projects: '个项目',
    agents: '个智能体',
    subagents: '个子智能体',
    models: '个模型',
    messages: '条消息',
    turns: '轮',
    files: '个文件',
    folders: '个文件夹',
    lines: '行',
    steps: '个步骤',
    tools: '个工具',
    skills: '个技能',
    plugins: '个插件',
    servers: '个服务器',
    results: '条结果',
    matches: '条匹配',
    errors: '个错误',
    warnings: '个警告',
    checks: '项检查',
    images: '张图片',
    videos: '个视频',
    documents: '份文档',
    branches: '个分支',
    commits: '个提交',
    sessions: '个会话',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒',
    days: '天',
    weeks: '周',
    months: '个月',
    tokens: '个 Token',
    credits: '点额度',
    freebucks: 'Freebucks',
    workspaces: '个工作区',
    tasks: '个任务',
    actions: '个操作',
    items: '项',
    entries: '条',
    rows: '行',
    pages: '页',
    members: '位成员',
    people: '人',
    repos: '个仓库',
    repositories: '个仓库',
    attachments: '个附件',
    shortcuts: '个快捷键',
    characters: '个字符',
  }

  const compiled = []
  for (const rule of RULES) {
    const source = rule[0]
    const target = rule[1]
    let pattern = ''
    for (const ch of source) pattern += ch === '\u0000' ? '(.{1,80}?)' : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    try {
      compiled.push([new RegExp('^' + pattern + '$', 'i'), target])
    } catch (error) {}
  }

  function fill(template, groups) {
    return template.replace(/\{(\d+)\}/g, (whole, index) =>
      groups[Number(index)] === undefined ? whole : groups[Number(index)],
    )
  }

  let recursionDepth = 0

  function inner(rest) {
    if (recursionDepth >= 3) return rest.trim()
    recursionDepth += 1
    try {
      const hit = translateValue(rest)
      return (hit === null ? rest : hit).trim()
    } finally {
      recursionDepth -= 1
    }
  }

  const ELLIPSIS = { '\u2026': '...', '.': '\u2026' }

  function translateValue(raw) {
    if (typeof raw !== 'string' || raw.length === 0) return null
    // 已含中文的字符串（通常是中文项目名被包进英文句式）不做词表查表，
    // 但仍允许走规则，例如“Collapse 汉化项目”→“收起汉化项目”。
    const mixed = CJK.test(raw)
    const lead = raw.match(/^\s*/)[0]
    const trail = raw.match(/\s*$/)[0]
    const core = raw.slice(lead.length, raw.length - trail.length)
    if (core.length === 0) return null

    let out = mixed ? undefined : exact.get(core)
    if (out !== undefined && mixed) out = undefined
    if (out === undefined && !mixed) out = collapsed.get(core.replace(SPACE, ' ').trim())
    if (out === undefined) {
      const last = core.slice(-1)
      if (ELLIPSIS[last]) {
        const alt = core.slice(0, -1) + ELLIPSIS[last]
        out = exact.get(alt) || collapsed.get(alt)
      }
    }
    if (out === undefined) {
      for (let i = 0; i < compiled.length; i += 1) {
        const match = compiled[i][0].exec(core)
        if (!match) continue
        out = fill(compiled[i][1], match.slice(1).map(inner))
        break
      }
    }
    if (out === undefined && !mixed && /[:：]$/.test(core)) {
      const base = core.slice(0, -1).trim()
      const hit = exact.get(base) || collapsed.get(base)
      if (hit !== undefined) out = hit + '：'
    }
    if (out === undefined && !mixed) {
      const counted = /^(\d+)\s+([A-Za-z][A-Za-z ]*)$/.exec(core)
      if (counted) {
        const unit = COUNT_UNITS[counted[2].toLowerCase().trim()]
        if (unit) out = counted[1] + ' ' + unit
      }
    }
    if (out === undefined) return null
    return lead + out + trail
  }

  /* ---------------------------------------------------------------- 漏译采样 */

  const misses = new Map()
  let applied = 0

  function looksLikeUiText(text) {
    if (text.length < 2 || text.length > 90) return false
    if (!/[A-Za-z]{2,}/.test(text)) return false
    if (!/^[A-Z0-9"'(]/.test(text)) return false
    if (!/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(text) && !/^[A-Z][a-z]{2,}$/.test(text)) return false
    if (/[\\/{}<>=;@#$%^*_|~]/.test(text)) return false
    return true
  }

  function noteMiss(raw) {
    if (misses.size >= 800) return
    const core = raw.replace(SPACE, ' ').trim()
    if (misses.has(core) || !looksLikeUiText(core)) return
    misses.set(core, 1)
  }

  /* ---------------------------------------------------------------- DOM */

  let working = false
  const skipCache = new WeakSet()

  function skipped(element) {
    if (!element) return false
    if (skipCache.has(element)) return true
    if (element.closest && element.closest(SKIP_SELECTOR)) {
      skipCache.add(element)
      return true
    }
    return false
  }

  function translateTextNode(node) {
    const parent = node.parentElement
    if (!parent) return
    if (SKIP_TAGS.has(parent.tagName)) return
    if (skipped(parent)) return
    const next = parent.tagName === 'TITLE' ? translateTitle(node.nodeValue) : translateValue(node.nodeValue)
    if (next === null || next === node.nodeValue) {
      if (next === null && !working) noteMiss(node.nodeValue)
      return
    }
    working = true
    node.nodeValue = next
    working = false
    applied += 1
  }

  function translateValueAttribute(element) {
    const tag = element.tagName
    if (tag !== 'INPUT') return
    const type = (element.getAttribute('type') || '').toLowerCase()
    if (type !== 'button' && type !== 'submit' && type !== 'reset') return
    const raw = element.getAttribute('value')
    if (!raw) return
    const next = translateValue(raw)
    if (next === null || next === raw) return
    element.setAttribute('value', next)
    applied += 1
  }

  function translateAttributes(element) {
    if (!element.hasAttributes || !element.hasAttributes()) return
    if (skipped(element)) return
    translateValueAttribute(element)
    for (let i = 0; i < ATTRS.length; i += 1) {
      const name = ATTRS[i]
      if (!element.hasAttribute(name)) continue
      const raw = element.getAttribute(name)
      if (!raw) continue
      const next = translateValue(raw)
      if (next === null || next === raw) {
        if (next === null && !working) noteMiss(raw)
        continue
      }
      working = true
      element.setAttribute(name, next)
      working = false
      applied += 1
    }
  }

  function translateTree(root) {
    if (!root) return
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root)
      return
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (SKIP_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT
          if (node.closest && node.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })
    let node = walker.nextNode()
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        translateAttributes(node)
        if (node.shadowRoot) translateTree(node.shadowRoot)
      } else translateTextNode(node)
      node = walker.nextNode()
    }
  }

  function translateTitle(value) {
    if (typeof value !== 'string' || value.length === 0) return null
    const direct = translateValue(value)
    if (direct !== null) return direct
    const parts = value.split(/(\s+[|\u2013\u2014\u00b7-]\s+)/)
    if (parts.length < 3) return null
    let changed = false
    for (let i = 0; i < parts.length; i += 2) {
      const hit = translateValue(parts[i])
      if (hit !== null && hit !== parts[i]) {
        parts[i] = hit
        changed = true
      }
    }
    return changed ? parts.join('') : null
  }

  /* ---------------------------------------------------------------- 调度 */

  let queued = null
  let pending = []
  let pendingSet = new Set()

  function flush() {
    queued = null
    const targets = pending
    pending = []
    pendingSet = new Set()
    for (let i = 0; i < targets.length; i += 1) {
      try {
        translateTree(targets[i])
      } catch (error) {}
    }
  }

  function schedule(target) {
    if (!target) return
    if (pendingSet.has(target)) return
    pendingSet.add(target)
    pending.push(target)
    if (queued !== null) return
    queued = (window.requestIdleCallback || window.requestAnimationFrame || ((fn) => setTimeout(fn, 16)))(flush)
  }

  const nextIdle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn) : (fn) => setTimeout(fn, 16)

  function scanChunked(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (SKIP_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT
          if (node.closest && node.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })
    const step = () => {
      const deadline = performance.now() + 6
      let node = walker.nextNode()
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(node)
        else translateTextNode(node)
        if (performance.now() > deadline) break
        node = walker.nextNode()
      }
      if (node) nextIdle(step)
    }
    step()
  }

  /* ---------------------------------------------------------------- 启动 */

  let observer = null

  function start() {
    if (isDisabled()) return
    if (document.body.getElementsByTagName('*').length < 1500) translateTree(document.body)
    else scanChunked(document.body)

    const nextTitle = translateTitle(document.title)
    if (nextTitle !== null && nextTitle !== document.title) document.title = nextTitle

    observer = new MutationObserver((mutations) => {
      if (working) return
      for (let i = 0; i < mutations.length; i += 1) {
        const mutation = mutations[i]
        if (mutation.type === 'characterData') {
          schedule(mutation.target)
          continue
        }
        if (mutation.type === 'attributes') {
          schedule(mutation.target)
          continue
        }
        for (let j = 0; j < mutation.addedNodes.length; j += 1) schedule(mutation.addedNodes[j])
      }
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    })

  }

  function dispose() {
    if (observer) observer.disconnect()
    observer = null
  }

  globalThis.__FREEBUFF_ZH__ = {
    id: PATCH_ID,
    version: PATCH_VERSION,
    entries: exact.size,
    rules: compiled.length,
    stats: () => ({ applied, misses: misses.size, entries: exact.size }),
    dump: () => ({ applied, misses: [...misses.keys()] }),
    rescan: () => translateTree(document.body),
    dispose,
    setEnabled(on) {
      try {
        if (on) window.localStorage.removeItem(DISABLE_KEY)
        else window.localStorage.setItem(DISABLE_KEY, '1')
      } catch (error) {}
    },
  }

  function boot() {
    // 必须等页面自身的首屏渲染/水合完成后再改文本，否则 React 的水合对比会失败（error #418）。
    const kick = () => {
      if (window.requestIdleCallback) window.requestIdleCallback(() => start(), { timeout: 2000 })
      else setTimeout(start, 250)
    }
    if (document.readyState === 'complete') setTimeout(kick, 1200)
    else window.addEventListener('load', () => setTimeout(kick, 1200), { once: true })
  }

  try {
    if (document.body) boot()
    else document.addEventListener('DOMContentLoaded', boot, { once: true })
  } catch (error) {
    if (window.console && console.warn) console.warn('Freebuff 中文补丁：', error && error.message)
  }
})()
