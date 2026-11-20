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

  const DICT = {"1 day":"1 天","1 per day":"每天 1 次","1 week":"1 周","1. Review the code":"1. 检查代码","100% free":"100% 免费","10:42 AM":"上午 10:42","12-hour time":"12 小时制","1M context":"100 万上下文","2 per day":"每天 2 次","2 weeks":"2 周","2. Set up your account":"2. 设置账户","3 days":"3 天","3. Verify in your app":"3. 在你的应用中验证","64-bit":"64 位","A crash, error, or UI problem":"崩溃、错误或界面问题","A friend":"朋友","A hold has ended. You can still submit while spots remain.":"冻结已结束。名额还有剩余时仍可提交。","A lower price":"更低的价格","A midweight fleece pullover hoodie for long sessions.":"中厚款抓绒套头连帽衫，适合长时间使用。","A promotional price that goes up when the promotion ends. Open with a US connection or a paid plan. One session a day on every plan.":"促销价，活动结束后上调。需美国网络或付费套餐才能打开。所有套餐每天 1 次会话。","A soft, heavyweight cotton tee with Buffy on it.":"重磅柔软棉质 T 恤，印着 Buffy。","AI APIs":"AI API","AI app or agent":"AI 应用或智能体","API keys":"API 密钥","API usage":"API 用量","About Auto-renew sessions":"关于会话自动续期","About Show in Discord status":"关于“在 Discord 状态中显示”","About your skills":"关于你的技能","Accept":"接受","Accept all":"全部接受","Accept and implement":"接受并实施","Account":"账号","Account standing":"账户状态","Accounts":"账户","Activity":"动态","Actual size":"实际大小","Ad":"广告","Ad actions":"广告操作","Ad feedback":"广告反馈","Ad options":"广告选项","Add SMS verification codes with Surge":"用 Surge 添加短信验证码","Add Specific's project instructions with specific init":"用 specific init 添加 Specific 的项目说明","Add a block below":"在下方添加块","Add check":"添加检查","Add column":"添加列","Add countries":"添加国家","Add more":"添加更多","Add project":"添加项目","Add repository":"添加仓库","Add row":"添加行","Add series":"添加系列","Add sources after your first message":"首次发送消息后可添加来源","Add streak reminders":"添加连续天数提醒","Add tab":"添加标签页","Add the bench":"添加工作台","Add to dictionary":"添加到词典","Add tracking parameter":"添加跟踪参数","Add your own repository":"添加自己的仓库","Added:":"已添加：","Admin":"管理员","Ads":"广告","Advanced":"高级","Advanced Mode":"高级模式","Advanced settings":"高级设置","Advertise":"广告投放","Advertiser":"广告主","Advertiser ads":"广告主的广告","Advertisers":"广告主","After":"之后","Agency":"代理商","Agent instructions":"智能体指令","Agent mode":"智能体模式","Agent skill":"智能体技能","Agent to-do list":"智能体待办列表","All":"全部","All countries":"全部国家","All except these":"除这些之外的全部","All integrations":"全部集成","All models":"全部模型","Allowance":"免费额度","Alt text":"替代文本","An idea, question, or anything else":"想法、问题，或任何其他内容","An insulated, weatherproof parka for real winters.":"一件保暖防水的派克大衣，真正的冬天也扛得住。","Anonymous provider retains prompts":"匿名提供方会保留提示词","Another computer":"另一台电脑","Anthropic's most intelligent model":"Anthropic 最智能的模型","App bug":"应用 Bug","App navigation":"应用导航","Appeal":"申诉","Appearance":"外观","Application uses the SDK":"应用使用 SDK","Apply":"应用","Apps & downloads":"应用与下载","Apps to connect":"可连接的应用","Archil API key (starts key-, not a disk token)":"Archil API 密钥（以 key- 开头，不是磁盘令牌）","Archive":"归档","Archived":"已归档","Archived chats":"已归档对话","Artifacts":"产物","Ask Buffy":"询问 Buffy","Ask Buffy about this passage":"就这段内容询问 Buffy","Ask Freebuff":"询问 Freebuff","Ask about this chat":"就此对话提问","Ask the project owner for access.":"向项目所有者申请访问权限。","At the start of a block: join it to the one above":"在块开头：并入上方块","Attach files":"添加文件","Audience":"受众","Auth":"认证","Auto":"自动","Auto top-up":"自动充值","Auto-archive chats":"自动归档对话","Auto-archive cloud chats after":"云端对话自动归档时间","Auto-renew sessions":"自动续订会话","Automatically start the next session":"自动开始下一个会话","AxonStream org JWT token":"AxonStream 组织 JWT 令牌","Back":"返回","Back to lab settings":"返回实验室设置","Back to latest":"返回最新","Bad result":"结果不佳","Balance":"余额","Balanced":"均衡","Batch":"批次","Batch name":"批次名称","Batch runs":"批次运行","Bayer 2 by 2":"Bayer 2×2","Bayer 4 by 4":"Bayer 4×4","Bayer 8 by 8":"Bayer 8×8","Bearer token (optional)":"Bearer 令牌（可选）","Before":"之前","Before and after":"前后对比","Beginner":"入门","Better models":"更好的模型","Billing":"账单","Blog":"博客","Body":"正文","Bold":"粗体","Both":"两者","Bounties":"悬赏","Branch":"分支","Breadcrumb":"面包屑","Bring a list item back out":"把列表项移出来","Bring your own idea to life.":"让你的想法落地。","Browser access":"浏览器访问","Budget":"预算","Build":"构建","Build with AI. Sign-in, databases, and publishing built in.":"用 AI 构建应用。登录、数据库和发布功能一应俱全。","Bulleted list":"项目符号列表","Buy hours":"购买小时","By stack (bench)":"按技术栈（基准）","Cached input (included)":"缓存输入（已包含）","Callout":"提示块","Campaign":"广告系列","Campaign name":"广告系列名称","Campaigns":"广告活动","Campaigns you create appear here.":"你创建的广告系列会显示在这里。","Cancel":"取消","Cancel download":"取消下载","Cancel reading folder":"取消读取文件夹","Cancel upload":"取消上传","Card":"卡片","Causes":"原因","Change":"更改","Change advertiser":"更换广告主","Changes":"变更","Chart":"图表","Chart title":"图表标题","Chart type":"图表类型","Chat":"对话","Chat history pages":"对话历史页数","Chat layout":"对话布局","Chat pane":"对话面板","Chat sources":"对话来源","Chat text size":"对话文字大小","Chats":"对话","Chats that finish or need you show up here.":"已结束或需要你处理的对话会显示在这里。","Check again":"重新检查","Check on your agents and reply from your phone.":"在手机上查看智能体并回复。","Checking for updates":"正在检查更新","Checklist":"清单","Checklist options":"清单选项","Choose a chat":"选择对话","Choose a project and start a chat":"选择项目并开始对话","Choose files":"选择文件","Choose my own model":"自己选择模型","Choose wallpaper image":"选择壁纸图片","Choose where the next message runs.":"选择下一条消息在哪里运行。","Claim":"领取","Clear":"清除","Clear search":"清除搜索","Click a shortcut to change it.":"点击快捷键即可修改。","Cline or Roo":"Cline 或 Roo","Close":"关闭","Close custom MCP":"关闭自定义 MCP","Close doc":"关闭文档","Close find":"关闭查找","Close image":"关闭图片","Close image preview":"关闭图片预览","Close mission picker":"关闭任务选择器","Close search":"关闭搜索","Close sidebar":"关闭侧边栏","Close tab":"关闭标签页","Close this tab once the queue finishes":"队列结束后关闭此标签页","Close update dialog":"关闭更新对话框","Close window":"关闭窗口","Cloud":"云端","Cloud agents":"云端智能体","Cloud browser":"云端浏览器","Code":"代码","Code block":"代码块","Code language":"代码语言","Code review":"代码审查","Code, deploy and host your app":"编写、部署并托管你的应用","Coding agent and model":"编程智能体和模型","Collapse left sidebar":"收起左侧边栏","Collapse right panel":"收起右侧面板","Collapse sidebar":"收起侧边栏","Collapsed":"已收起","Color":"颜色","Color levels":"色阶","Color themes":"配色主题","Coming soon":"即将推出","Command line":"命令行","Commands":"命令","Comment":"评论","Comment on this passage":"评论这段内容","Comments":"评论","Commit":"提交","Compactions":"压缩次数","Compacts at":"压缩阈值","Company or project name":"公司或项目名称","Composer":"输入框","Confirm":"确认","Connect":"连接","Connect GitHub":"连接 GitHub","Connect GitHub to start a project from your repository.":"连接 GitHub，从你自己的仓库创建项目。","Connect folder":"连接文件夹","Connect your apps":"连接你的应用","Connected":"已连接","Connected apps":"已连接的应用","Connected just now":"刚刚连接","Contents":"目录","Context":"上下文","Continue":"继续","Continue in Cloud":"在云端继续","Continue in Desktop":"在桌面端继续","Continue in browser":"在浏览器中继续","Continue on this computer":"在这台电脑上继续","Continue this project in Desktop":"在桌面端继续此项目","Contribute this project":"贡献此项目","Contribution permission saved":"贡献权限已保存","Conversation turn":"对话轮次","Copied":"已复制","Copy JSON":"复制 JSON","Copy Markdown":"复制 Markdown","Copy a legacy project":"复制旧版项目","Copy body":"复制正文","Copy code":"复制代码","Copy link":"复制链接","Copy sign-in link":"复制登录链接","Copy your referral link":"复制你的推荐链接","Could not copy code. Try again.":"无法复制代码，请重试。","Could not copy the link.":"复制链接失败。","Could not start sign-in — Freebuff’s local service is not responding. Restart the app.":"无法开始登录——Freebuff 的本地服务没有响应，请重启应用。","Could not start sign-in.":"无法开始登录。","Couldn’t open Freebuff":"无法打开 Freebuff","Countries":"国家","Country":"国家","Create a project":"创建项目","Create projects, branch databases and run SQL from chat.":"在对话中创建项目、分支数据库并运行 SQL。","Create pull request":"创建拉取请求","Create variation":"创建变体","Cumulative provider-reported usage in the current thread transcript.":"当前会话记录中服务商累计上报的用量。","Current selection":"当前选中项","Current theme":"当前主题","Custom":"自定义","Custom MCP":"自定义 MCP","Custom MCP servers":"自定义 MCP 服务器","Custom ad":"自定义广告","Custom ads":"自定义广告","Custom presets":"自定义预设","Custom servers":"自定义服务器","Customize":"自定义","Customized":"已自定义","Daily":"每日","Daily budget":"每日预算","Daily hours":"每日小时","Daily limit reached":"已达每日上限","Dark":"深色","Data":"数据","Data grid":"数据表格","Data or ML":"数据或机器学习","Database":"数据库","Deep reasoning":"深度推理","Default":"默认","Delete":"删除","Delete account":"删除账号","Delete forever":"永久删除","Delete tab":"删除标签页","Deploy this app with Specific":"用 Specific 部署此应用","Describe the issue so we can review it.":"请描述问题，方便我们审核。","Design":"设计","Desktop app":"桌面应用","Detached HEAD":"分离的 HEAD","Developer":"开发者","Developer API":"开发者 API","Developer at a company":"公司开发者","Developer interests":"开发者兴趣","Diff":"差异","Discard":"丢弃","Disconnect":"断开连接","Dismiss":"忽略","Dismiss Desktop suggestion":"关闭桌面端建议","Dismiss ad":"关闭广告","Dismiss invitation":"忽略邀请","Dismiss mission":"关闭任务","Dismiss policy update":"关闭政策更新","Dismiss sponsored message":"关闭赞助消息","Dismiss sponsored proposal":"关闭赞助提案","Dithering":"抖动","Divider":"分隔线","Django or FastAPI":"Django 或 FastAPI","Dollars, negatives red":"美元，负数显示为红色","Done":"完成","Download":"下载","Download Desktop":"下载桌面版","Download Freebuff for mobile":"下载 Freebuff 移动版","Download again":"重新下载","Download file":"下载文件","Download manually":"手动下载","Download this tab as Markdown":"将此标签页下载为 Markdown","Draft":"草稿","Drag in a chat from this project":"从该项目拖入对话","Drop files or folders":"拖入文件或文件夹","E-commerce":"电商","Earlier messages":"更早的消息","Earn":"赚取","Earn assistant":"赚取助手","Earn free usage":"免费赚取时长","Earned":"已获得","Edit":"编辑","Edit chart":"编辑图表","Edit link":"编辑链接","Edit prompt":"编辑提示词","Editing":"编辑中","Editing a sent message. Sending replaces it and everything after it.":"正在编辑已发送的消息。发送后将替换该消息及其之后的所有内容。","Education":"教育","Efficient":"高效","Email":"邮箱","Email support":"邮件联系客服","End date":"结束日期","Environment":"环境","Every step":"每一步","Exa API key":"Exa API 密钥","Existing repository":"已有仓库","Expand left sidebar":"展开左侧边栏","Expand sidebar":"展开侧边栏","Expert":"专家","Explore":"探索","Explore Freebuff":"探索 Freebuff","Explore more integrations":"探索更多集成","Export file":"导出文件","Fade position":"淡出位置","Falls back when busy":"繁忙时自动切换","Fast":"快速","Fast and light":"快速轻量","Faster responses":"更快响应","Fastest":"最快","Featured":"精选","Feed preview":"信息流预览","Feedback":"反馈","Feedback for the next plan revision":"为下一版计划提供反馈","Feedback sent. Thank you!":"反馈已发送，谢谢！","Fewer ads":"减少广告","File":"文件","File content":"文件内容","File contents":"文件内容","File path":"文件路径","Files":"文件","Files to add":"待添加的文件","Filter by advertiser, campaign or skill":"按广告主、广告系列或技能筛选","Filter campaigns":"筛选广告系列","Filter files":"筛选文件","Filter themes":"筛选主题","Finance":"金融","Find":"查找","Find and replace":"查找和替换","Find in chat":"在对话中查找","Find in doc":"在文档中查找","Fit":"适应","Fix and resend":"修复并重新发送","Fix with agent":"用智能体修复","Folder does not exist":"文件夹不存在","Font":"字体","Forked chat":"派生对话","Format selection":"格式化选中内容","Forward":"前进","Founder":"创始人","Founder or indie hacker":"创始人或独立开发者","Frameworks":"框架","Free":"免费","Free agent run":"免费智能体运行","Free and low-cost models":"免费和低价模型","Free: uses none of your balance.":"免费：不消耗余额。","Freebuff Ads":"Freebuff 广告","Freebuff Cloud":"Freebuff 云端","Freebuff Web":"Freebuff 网页版","Freebuff blog":"Freebuff 博客","Freebuff couldn’t open your browser. Copy the sign-in link and paste it into your browser.":"Freebuff 打不开你的浏览器。复制登录链接，粘贴到浏览器里打开。","Freebuff home":"Freebuff 首页","Freebuff on GitHub":"GitHub 上的 Freebuff","Freebuff response":"Freebuff 的回复","Freebuff took too long to load on this connection.":"Freebuff 在这条网络连接上加载超时。","Freebuff: The free coding agent":"Freebuff：免费编程智能体","Freebuff’s servers didn’t answer this computer in time. Check your connection, then try again.":"Freebuff 的服务器没有及时响应这台电脑。检查网络后重试。","Freelancer or contractor":"自由职业者或外包人员","From scratch":"从零开始","Frontier models like GPT-6.1 Sol and more":"前沿模型，如 GPT-6.1 Sol 等","Full access":"完全访问权限","Games":"游戏","General":"通用","Get Freebuff":"获取 Freebuff","Get Freebuff on mobile":"在手机上获取 Freebuff","Get Started":"开始使用","Get started":"开始使用","Get started with Desktop":"开始使用桌面端","Get the mobile app":"获取移动应用","Getting started progress":"入门进度","GitHub connections are not configured on this server.":"此服务器未配置 GitHub 连接。","GitHub repository":"GitHub 仓库","Give feedback":"提供反馈","Give up spot":"让出排队位置","Give your friends unlimited free coding too":"让朋友也能无限免费编程","Give your friends unlimited free coding too.":"让朋友也能无限免费编程。","Go":"前往","Go home":"回到首页","Good result":"结果不错","Google flagship":"Google 旗舰模型","Gradient direction":"渐变方向","Gradient style":"渐变样式","Gradients":"渐变","Gravity JS SDK for retrieving targeted advertisements":"用于获取定向广告的 Gravity JS SDK","Habit tracker":"习惯打卡","Habits":"习惯","Harness":"运行框架","Heading 1":"标题 1","Heading 2":"标题 2","Heading 3":"标题 3","Health":"健康","Help":"帮助","Hex":"十六进制","Hide":"隐藏","Hide checklist":"隐藏清单","High":"高","Higher limits":"额度更高","Hobbyist":"爱好者","Home":"首页","Hosting":"托管","Hours balances":"小时余额","How heavy headings and page titles are drawn.":"标题和页面标题的笔画粗细。","Hue":"色相","I already pay":"我已经付费","I didn't use it enough":"我用得不够多","If its provider is down, DeepSeek V4.1 Flash answers for the rest of the session.":"如果它的提供方不可用，本次会话余下时间由 DeepSeek V4.1 Flash 代答。","Image":"图片","Image address":"图片地址","Image controls":"图片控件","Image zoom":"图片缩放","Images from this response":"本次回复里的图片","Import and export":"导入和导出","Import skill JSON":"导入技能 JSON","Import theme file":"导入主题文件","Import wallpaper bytes into the local image library before saving this theme.":"保存主题前，先把壁纸数据导入本机图片库。","In the next 3 months":"未来 3 个月","Include AGENTS.md":"包含 AGENTS.md","Included with a paid plan (Pro on limited access). Two sessions a day on every plan.":"付费套餐已包含（受限访问时为 Pro）。所有套餐每天 2 次会话。","Inline code":"行内代码","Input":"输入","Insert":"插入","Insert a block":"插入块","Insert a block (in an empty line)":"插入块（在空行中）","Insert an image":"插入图片","Insert chart":"插入图表","Insert checklist":"插入清单","Insert code block":"插入代码块","Insert image":"插入图片","Insert table":"插入表格","Insert text":"插入文本","Install Freebuff":"安装 Freebuff","Install Freebuff on GitHub":"在 GitHub 上安装 Freebuff","Install now":"立即安装","Install when idle":"空闲时安装","Integrations":"集成","Interest targeting only reaches developers with an available profile.":"兴趣定向只会触达有可用资料的开发者。","Interface size":"界面缩放","Intermediate":"中级","Internal tool":"内部工具","Invert image":"图片反色","Invite a friend":"邀请好友","Invite friends":"邀请好友","Invite link":"邀请链接","Invited":"已邀请","Italic":"斜体","Its rules on self-promotion":"它对自我推广的规定","Java or Kotlin":"Java 或 Kotlin","Join our Discord":"加入我们的 Discord","Just me":"只有我","Keep Powerful":"保留 Powerful","Keep files across runs with an Archil disk":"用 Archil 磁盘在多次运行间保留文件","Keep it going":"继续保持","Keep working":"继续工作","Keep working toward a goal":"持续朝目标推进","Keyboard shortcuts":"键盘快捷键","Lab VM as is":"保持 Lab 虚拟机原样","Lab settings":"实验室设置","Label column name":"标签列名称","Labels and buttons":"标签和按钮","Landing URL":"落地页 URL","Landing pages":"落地页","Large":"大","Last 28 days":"最近 28 天","Last 7 days":"最近 7 天","Last 90 days":"最近 90 天","Later":"稍后","Latest":"最新","Launch":"发布","Learn more":"了解更多","Learning to code":"学习编程","Leaving":"即将下线","Legacy":"旧版","Legacy projects":"旧版项目","Legal":"法律条款","Letter spacing":"字间距","Light":"浅色","Lighter":"较浅","Like":"赞","Limited-time trial":"限时试用","Link":"链接","Link address":"链接地址","List":"列表","Live":"线上","Load more":"加载更多","Load more chats":"加载更多对话","Loading Freebuff":"正在加载 Freebuff","Loading chats…":"正在加载对话…","Loading existing chats…":"正在加载已有对话…","Loading…":"加载中…","Local":"本地","Local browser":"本地浏览器","Local conversation":"本地对话","Look up issues, stack traces and releases without leaving the chat.":"不用离开对话，就能查 issue、堆栈跟踪和发布记录。","Low text contrast.":"文字对比度偏低。","MCP bearer token":"MCP Bearer 令牌","MCP command or local URL":"MCP 命令或本地 URL","MCP environment variables":"MCP 环境变量","MCP name":"MCP 名称","MCP server URL":"MCP 服务器 URL","Machine":"机器","Machines":"机器","Make a skill":"创建技能","Make your site live for everyone":"让所有人都能访问你的网站","Manage Redis databases and inspect keys from chat.":"在对话里管理 Redis 数据库、查看键。","Manage queued messages":"管理排队消息","Manage skills":"管理技能","Markdown as you type":"输入时即渲染 Markdown","Markdown exhibit":"Markdown 展示","Markdown view":"Markdown 视图","Match case":"区分大小写","Maximize":"最大化","Maximize window":"最大化窗口","May use data for AI training":"可能将数据用于 AI 训练","Me":"我","Media":"媒体","Mentions":"提及","Merge PR":"合并 PR","Message":"消息","Message Freebuff":"给 Freebuff 发消息","Message feedback":"消息反馈","Mine":"我的","Minimize":"最小化","Minimize window":"最小化窗口","Missing models or features":"缺少模型或功能","Mission":"任务","Mission configuration":"任务配置","Mission effort":"任务强度","Missions":"任务","Mobile app":"移动应用","Model Providers":"模型提供商","Model and reasoning":"模型与推理","Model preference":"模型偏好","Models":"模型","Monitoring":"监控","More":"更多","More chats":"更多对话","More projects":"更多项目","Move Freebuff to Applications":"把 Freebuff 移到应用程序文件夹","Move left":"左移","Move right":"右移","Move the block up or down":"上下移动块","Move the tab":"移动标签页","Move your .env secrets to Infisical":"把 .env 密钥迁移到 Infisical","Muse Spark 1.3 replaces Muse Spark 1.2":"Muse Spark 1.3 取代 Muse Spark 1.2","My employer":"我的雇主","Name":"名称","Name and email":"姓名和邮箱","Native workspace unavailable":"本机工作区不可用","Navigation history":"导航记录","Nest a list item":"嵌套列表项","Never":"从不","New campaign":"新建广告活动","New chat":"新建对话","New chat in a new project":"在新项目里新建对话","New custom ad":"新建自定义广告","New file":"新建文件","New folder":"新建文件夹","New project":"新建项目","New repository":"新建仓库","New skill":"新建技能","New tab":"新建标签页","Newer messages":"较新的消息","Next match":"下一个匹配","Next question":"下一题","Next tab":"下一个标签页","Next templates":"下一组模板","Nice theme!":"主题不错！","No Node at all":"完全不用 Node","No ad selected.":"未选择广告","No advertisers found.":"未找到广告主。","No agentic ads found.":"未找到智能体广告。","No chats yet":"还没有对话","No countries found.":"未找到国家","No custom ads saved yet.":"还没有保存自定义广告。","No data yet":"暂无数据","No headings yet":"暂无标题","No hours returned":"未返回小时数","No integrations":"暂无集成","No languages found":"未找到语言","No matching files.":"没有匹配的文件。","No notifications yet":"暂无通知","No settings found":"未找到设置","No shortcuts found.":"未找到快捷键。","No title":"无标题","No tools available.":"没有可用的工具。","Nobody, I stick to free tools":"都不用，我只用免费工具","Node through Volta only":"Node 只用 Volta","Node through asdf shims only":"Node 只用 asdf shim","Node through fnm only":"Node 只用 fnm","Node through mise only":"Node 只用 mise","Node through nvm only":"Node 只用 nvm","None":"无","None of your legacy projects can be copied.":"你的旧版项目都无法复制。","Not an older PC? Standard build":"不是老电脑？用标准版本","Not at all":"一点也不","Not available yet":"暂未开放","Not deploying yet":"暂时不部署","Not disappointed":"没有失望","Not enough hours":"小时数不够","Not now":"暂不","Not planning to":"不打算","Not shopping":"不购物","Nothing came back from the search this time.":"这次搜索没有返回结果。","Nothing open right now. New ones show up here.":"当前没有打开的内容。新的会显示在这里。","Nothing, I'll stay free":"什么都不加，我继续用免费版","Notification sounds":"通知声音","Notifications":"通知","Novita route — evaluation only":"Novita 线路，仅供评估","Now, what are we building?":"现在，我们做点什么？","Numbered list":"编号列表","Offers":"优惠","Older PC without AVX2?":"老电脑没有 AVX2？","Older messages":"较早的消息","On ARM64 Linux?":"在 ARM64 Linux 上？","On Google flex capacity. If it is down, DeepSeek V4.1 Flash answers for the rest of the session.":"使用 Google 弹性算力。它不可用时，本次会话余下时间由 DeepSeek V4.1 Flash 代答。","On OpenAI flex capacity, with a standard-tier backup when it’s busy.":"使用 OpenAI 弹性算力，繁忙时回退到标准档。","On an Intel Mac?":"在用 Intel Mac？","Onboarding prompt":"引导提示词","Online store":"在线商店","Only Freebuff":"仅 Freebuff","Only these":"仅这些","Open":"打开","Open Account settings":"打开账户设置","Open Reddit with it filled in":"打开 Reddit，内容已填好","Open a folder":"打开文件夹","Open a project to get started":"打开项目即可开始","Open as page":"以页面打开","Open browser again":"重新打开浏览器","Open copy":"打开副本","Open image":"打开图片","Open link":"打开链接","Open project":"打开项目","Open settings":"打开设置","Open signup tab":"打开注册标签页","Open tabs":"打开的标签页","Open the download to get started":"打开下载文件即可开始","Open the side panel for more":"打开侧边面板查看更多","Open the sign-up page with your email filled in.":"打开注册页，邮箱已填好。","Open the sign-up page without it.":"打开注册页，不填邮箱。","OpenAI flagship · 1 session a day":"OpenAI 旗舰 · 每天 1 次会话","OpenAI · 2 sessions a day":"OpenAI · 每天 2 次会话","Opening your saved workspace took too long.":"打开已保存的工作区耗时过长。","Optional":"可选","Or":"或","Original colors":"原始颜色","Other":"其他","Our pick for this section":"本节精选","Outline":"大纲","Output":"输出","Overview":"概览","Owner":"所有者","Paid plan":"付费套餐","Panel blur":"面板模糊","Panel landscape 16:9":"面板横版 16:9","Panel portrait 3:5":"面板竖版 3:5","Panel square 1:1":"面板方形 1:1","Panel tall 2:5":"面板长竖版 2:5","Panel transparency":"面板透明度","Pattern":"匹配模式","Pause":"暂停","Pause the queue here until you resume it":"在此暂停队列，等你恢复","Pause this project's popup for 14 days":"暂停此项目的弹窗 14 天","Payment":"支付","Payments":"支付","People with access":"有访问权限的人","Percent, one decimal":"百分比，保留一位小数","Perfect":"完美","Permission saved":"权限已保存","Pick a color from the screen":"从屏幕上取色","Pinned":"已固定","Pixel size":"像素大小","Places in this doc":"本文档中的位置","Plain text":"纯文本","Plan":"套餐","Plan a weekend in Lisbon for two":"规划两个人的里斯本周末行程","Plan before making changes":"修改前先规划","Plan bonus":"套餐奖励","Plan, build and fix code from your terminal.":"在终端里规划、构建和修复代码。","Plan, build, and fix code from your command line":"在命令行里规划、构建和修复代码","Plans":"套餐","Please allow ads on Freebuff.":"请在 Freebuff 上允许广告。","Please try again in a minute.":"请一分钟后再试。","Policy update":"政策更新","Popular":"热门","Portfolio":"作品集","Post":"发布","Post on X":"发布到 X","Powerful":"强大","Powerful switch":"Powerful 开关","Pre-sync projects to Cloud":"预先把项目同步到云端","Premium":"高级版","Prepaid credits":"预付额度","Preset name":"预设名称","Presets":"预设","Press a key combination. Esc to cancel.":"按下组合键。按 Esc 取消。","Preview":"预览","Previous match":"上一个匹配","Previous or next tab":"上一个或下一个标签页","Previous question":"上一题","Previous tab":"上一个标签页","Previous templates":"上一组模板","Privacy":"隐私","Private":"私有","Procedure":"流程","Production":"生产环境","Progress":"进度","Project":"项目","Project actions":"项目操作","Project chats":"项目对话","Project failed to load":"项目加载失败","Project location":"项目位置","Project name":"项目名称","Project settings":"项目设置","Project source":"项目来源","Project unavailable":"项目不可用","Project: New project":"项目：新建项目","Projects":"项目","Projects and chats":"项目和对话","Promote your posts on Freebuff":"在 Freebuff 上推广你的帖子","Promotional":"促销","Prompt history":"提示词历史","Provider API key":"提供商 API 密钥","Provider base URL":"提供商基础 URL","Provider model ID":"提供商模型 ID","Proxy detected, verify country to unlock":"检测到代理，验证国家后解锁","Publish":"发布","Python is externally managed (PEP 668)":"Python 由外部管理（PEP 668）","Python through uv only":"Python 只用 uv","QR code to get Freebuff on your phone":"扫码在手机上获取 Freebuff","Quality or reliability":"质量或稳定性","Question progress":"答题进度","Questions complete":"问卷已完成","Queue message":"排队消息","Queued batches":"排队批次","Queued messages":"排队消息","Queued prompt":"排队的提示词","Quick survey":"快速问卷","Quit anyway":"仍然退出","Quit while work is running?":"工作还在运行，确定退出？","Quote":"引用","Random":"随机","React Native or Flutter":"React Native 或 Flutter","Reading folder":"正在读取文件夹","Ready when the current response finishes.":"当前回复结束后就绪。","Reasoning output (included)":"推理输出（已包含）","Recent projects":"最近项目","Recent rewards":"最近的奖励","Recommended":"推荐","Reconnect":"重新连接","Reconnect folder":"重新连接文件夹","Reddit research":"Reddit 调研","Redo":"重做","Referrals":"推荐","Refresh latest":"刷新到最新","Regular":"常规","Reject":"拒绝","Reject all":"全部拒绝","Relevant to this conversation":"与本次对话相关","Reload":"重新加载","Reload from disk":"从磁盘重新加载","Reload the page to sign in.":"刷新页面即可登录。","Reload the page to try again.":"刷新页面后重试。","Remote":"远程","Remote URL":"远程 URL","Remote devices":"远程设备","Remove":"移除","Remove Tier 1 countries":"移除一级国家","Remove all":"全部移除","Remove folder":"移除文件夹","Remove link":"移除链接","Remove template":"移除模板","Removed:":"已移除：","Rename":"重命名","Rename the tab":"重命名标签页","Render, Railway or Fly":"Render、Railway 或 Fly","Reopen closed tab":"重新打开已关闭的标签页","Replace":"替换","Replace all":"全部替换","Replace site":"替换站点","Replace with":"替换为","Replace with a newer post":"替换为较新的帖子","Reply with this":"用这条回复","Report issue or feature":"报告问题或功能","Report sent":"举报已提交","Report this ad":"举报此广告","Report this proposal":"举报此提案","Repositories":"仓库","Repositories that changed":"有变更的仓库","Repository":"仓库","Repository name":"仓库名称","Repost":"重新发布","Reset all":"全部重置","Resize explorer panel":"调整资源管理器宽度","Resize left sidebar":"调整左侧边栏宽度","Resize settings sidebar":"调整设置侧边栏大小","Respan API key":"Respan API 密钥","Restore":"还原","Restore window":"还原窗口","Resume":"继续","Resume queue":"继续队列","Retry":"重试","Retry chat":"重试对话","Retry chats":"重试多个对话","Retry connection":"重试连接","Retry custom MCPs":"重试自定义 MCP","Retry image":"重试图片","Retry loading pinned chats":"重试加载置顶对话","Retry message":"重试消息","Retry projects":"重试项目","Retry save":"重试保存","Review":"审查","Review and next steps":"审查与后续步骤","Review changes":"审查变更","Review code changes":"审查代码变更","Review continues. Track this project in Earn.":"审查仍在继续。可在 Earn 中跟踪该项目。","Review the changes":"审查变更","Reviewing":"审查中","Rewards":"奖励","Right panel":"右侧面板","Roll back":"回滚","Roll back to here":"回滚到这里","Rules and appeals":"规则与申诉","Run all":"全部运行","Run it again":"再运行一次","Run live prompt":"运行实时提示词","Run location":"运行位置","Run location is set for this chat":"这个对话已设定运行位置","Run location: Local":"运行位置：本地","Run on bench":"在评测台上运行","Running":"运行中","Runs on DeepSeek’s own API.":"运行在 DeepSeek 自家 API 上。","Runs per repository":"每个仓库的运行次数","SDK is installed":"已安装 SDK","SaaS product":"SaaS 产品","Saturation and brightness":"饱和度与亮度","Saturday.":"星期六","Save":"保存","Save chart":"保存图表","Saved":"已保存","Saved custom ads":"已保存的自定义广告","Scientific":"科学计数法","Screenshot":"截图","Scripts and automation":"脚本与自动化","Scroll to latest":"滚动到最新","Search 1,000+ more":"再搜索 1,000+ 个","Search ads":"搜索广告","Search advertisers":"搜索广告主","Search advertisers, campaigns, or ads":"搜索广告主、广告系列或广告","Search all advertisers, including those without campaigns":"搜索全部广告主，包括没有广告系列的","Search chats":"搜索对话","Search code languages":"搜索代码语言","Search countries":"搜索国家","Search integrations":"搜索集成","Search repositories":"搜索仓库","Search results":"搜索结果","Search settings":"搜索设置","Search shortcuts":"搜索快捷键","Search skills":"搜索技能","Secure checkout by Stripe":"由 Stripe 提供安全结账","See all rewards":"查看全部奖励","See plans":"查看套餐","See your referrals":"查看你的推荐","Self-hosted":"自托管","Send":"发送","Send a message today to start one.":"今天发一条消息就能开始计时。","Send your first message":"发送第一条消息","Server":"服务器","Session remaining":"会话剩余时间","Sessions":"会话","Sessions by model":"按模型统计的会话","Set it up for me":"帮我配置","Set up the account yourself instead.":"改为你自己设置账号。","Set up your account":"设置账号","Settings":"设置","Settings search results":"设置搜索结果","Settings sections":"设置分区","Share":"分享","Share it with your friends.":"分享给朋友","Share on LinkedIn":"分享到 LinkedIn","Share your streak and give your friends unlimited free coding.":"分享你的连续天数，让朋友免费无限编程。","Sheet":"表格","Sheets":"电子表格","Shipping address":"收货地址","Ships to":"配送至","Show all models":"显示全部模型","Show in Discord status":"在 Discord 状态中显示","Show sponsor":"显示赞助","Showing shipped skills only: campaigns and Lab versions did not load.":"仅显示已发布的技能：广告系列和 Lab 版本未能加载。","Side chat":"侧边对话","Side projects":"副业项目","Sidebar 4:3":"侧边栏 4:3","Sign in":"登录","Sign in to Freebuff":"登录 Freebuff","Sign in to Freebuff to use Cloud":"登录 Freebuff 才能使用云端","Sign in to connect your apps":"登录以连接你的应用","Sign in to invite friends":"登录以邀请好友","Sign in to search your chats":"登录以搜索你的对话","Sign in to send feedback":"登录以发送反馈","Sign out":"退出登录","Sign-in didn't load":"登录页未能加载","Sign-in methods":"登录方式","Site environment":"站点环境","Sites":"站点","Size":"大小","Skill JSON":"技能 JSON","Skill editor":"技能编辑器","Skill eval bench":"技能评测台","Skills":"技能","Skip":"跳过","Slides":"幻灯片","Small":"小","Smart & Fast":"智能且快","Software":"软件","Some chats":"部分对话","Some token counts are unavailable":"部分 token 数量不可用","Something else":"其他","Something on this computer or network, such as a proxy or an antivirus web shield, is intercepting Freebuff’s secure connection.":"这台电脑或网络上的某个东西（例如代理或杀毒软件的网页防护）正在拦截 Freebuff 的安全连接。","Something worked especially well":"有些地方特别好用","Somewhat disappointed":"有点失望","Somewhere else":"其他地方","Source":"来源","Split a paragraph, or start a new block":"拆分段落，或开始新块","Sponsored":"赞助","Sponsored by":"赞助方","Sponsored posts":"赞助帖子","Sponsored proposal":"赞助提案","Sponsored proposal options":"赞助提案选项","Sponsored skills":"赞助技能","Standard":"标准","Start Freebuff in your project":"在你的项目中启动 Freebuff","Start date":"开始日期","Start dictation":"开始语音输入","Start from":"起点","Start from a template":"从模板开始","Start from scratch":"从零开始","Start here":"从这里开始","Start implementation":"开始实现","Start the project from files you already have":"用已有文件开始项目","Start with a template":"从模板开始","Start your first project.":"开始你的第一个项目。","Starters":"起步模板","Starting branch":"起始分支","Startup script":"启动脚本","Stays on your computer. Freebuff never reads it.":"只留在你的电脑上。Freebuff 不会读取。","Stealth model. May change or be withdrawn without notice.":"隐身模型，可能随时变更或下线，不另行通知。","Step reached":"到达的步骤","Steps":"步骤","Stop":"停止","Stopped":"已停止","Stores":"商店","Streak reward":"连续天数奖励","Strikethrough":"删除线","Strong all-around":"全面强劲","Strong reasoning":"强推理","Strongest price-to-performance models":"性价比最高的模型","Student":"学生","Submit for review":"提交审查","Submit proof":"提交凭证","Success criteria":"成功标准","Suggested next steps":"建议的后续步骤","Suggested replies":"建议回复","Suggesting":"正在生成建议","Summarise Q3 report":"汇总第三季度报告","Sunday.":"星期日","Supabase publishable key":"Supabase 可发布密钥","Surface fade":"表面渐隐","Surge API key":"Surge API 密钥","Survey complete":"问卷已完成","Survey progress":"问卷进度","Switch between Code and Chat":"在代码和对话之间切换","Switch to Muse Spark 1.3":"切换到 Muse Spark 1.3","System":"系统","Tab":"标签页","Tab name":"标签页名称","Table":"表格","Table of contents":"目录","Tabs":"标签页","Tell us a little more":"再多说一点","Tell us more":"告诉我们更多","Template":"模板","Template categories":"模板分类","Temporary price. It goes up when the promotion ends.":"临时价格，促销结束后会上调。","Terminal":"终端","Terms":"服务条款","Test in Desktop":"在桌面应用里测试","Test your app at a shareable link":"用可分享的链接测试你的应用","Text":"文本","Text actions":"文本操作","Thanks!":"谢谢！","Thanks, that helps":"谢谢，有帮助","Thanks, that's everything.":"谢谢，就这些。","The ad selected above":"上方选中的广告","The agent missed or broke something":"智能体漏掉了或弄坏了东西","The file may be damaged or use an unsupported image format.":"文件可能已损坏，或使用了不支持的图片格式。","The renewal payment failed. Update your card to restore it.":"续费扣款失败。更新银行卡即可恢复。","The run recorded no agent output.":"本次运行没有记录到智能体的输出。","The selected ad is no longer available.":"选中的广告已不可用。","The selected custom theme is missing from your theme collection.":"选中的自定义主题不在你的主题列表里。","The size of messages in a chat. The rest of the app keeps its size.":"对话中消息的大小。应用其他部分保持原有大小。","The trace stops here: the run has more events than a trace reads.":"追踪到此为止：本次运行的事件数超出追踪能读取的范围。","Theme":"主题","Theme IDs must be unique.":"主题 ID 不能重复。","Theme colors":"主题颜色","Theme previews":"主题预览","This computer":"这台电脑","This computer couldn’t look up Freebuff’s servers. Check your internet connection, VPN or DNS settings.":"这台电脑查不到 Freebuff 的服务器。检查网络连接、VPN 或 DNS 设置。","This form is from earlier in the conversation.":"这个表单来自对话中较早的位置。","This image link has expired. The saved copy is in the project.":"图片链接已过期。副本已保存在项目中。","This model is leaving Freebuff soon. Pick another model to keep working without interruption.":"这个模型即将从 Freebuff 下线。换一个模型继续，避免中断。","This month":"本月","This page didn't load":"此页面未能加载","This page failed to load":"此页面加载失败","This quarter":"本季度","This side chat is gone.":"这个侧边对话已不存在。","Thought":"思考","Thousands (12k)":"千位分隔（12k）","Thread token usage":"会话 token 用量","Thread tools":"会话工具","Thread usage":"会话用量","Throttled":"已限速","Tick the task the caret is on":"勾选光标所在的任务","Tiers":"层级","Tight":"紧凑","Tight sets letters slightly closer, as Inter is usually set.":"紧凑会让字间距略微收紧，与 Inter 的常用设置一致。","Title":"标题","Titles":"标题","To-dos":"待办","Today's usage has run out":"今日用量已用尽","Toggle bottom terminal":"显示或隐藏底部终端","Toggle files":"显示或隐藏文件","Toggle left sidebar":"切换左侧边栏","Toggle overview":"显示或隐藏概览","Toggle right panel":"显示或隐藏右侧面板","Tokens":"Token","Too expensive":"太贵了","Top cause":"主要原因","Trace your LLM calls with Respan":"用 Respan 追踪 LLM 调用","Track package":"跟踪包裹","Trusted by users from":"深受以下地区的用户信赖","Try again":"重试","Try again to open this page.":"请重新尝试打开此页面。","Try again to open your project.":"请重新尝试打开你的项目。","Turn off Powerful?":"关闭 Powerful？","Turn off sponsored proposals":"关闭赞助提案","Two decimals":"两位小数","Unassigned":"未分配","Unattributed":"未归属","Unavailable":"不可用","Undo":"撤销","Undo these changes":"撤销这些变更","Unidentified":"未识别","Unlock by referring friends":"邀请好友即可解锁","Unlock custom themes":"解锁自定义主题","Untitled dashboard":"未命名仪表盘","Untitled deck":"未命名幻灯片","Untitled design":"未命名设计","Untitled sheet":"未命名表格","Untitled whiteboard":"未命名白板","Update card":"更新银行卡","Updates are unavailable":"更新不可用","Upgrade":"升级","Upload":"上传","Upload files":"上传文件","Upload folder":"上传文件夹","Upstage flagship":"Upstage 旗舰模型","Usage":"用量","Use a six-digit hex color, such as #759e58.":"使用六位十六进制颜色，例如 #759e58。","Use an imported PNG, JPEG or WebP image, a bundled wallpaper, or a gradient.":"使用导入的 PNG、JPEG 或 WebP 图片、内置壁纸或渐变。","Use it here":"在此使用","Use suggestion":"使用建议","Use the same Freebuff account":"使用同一个 Freebuff 账号","Use the suggested message":"使用建议的消息","VPN detected, verify country to unlock":"检测到 VPN，验证国家后解锁","Value":"值","Verify again":"重新验证","Version":"版本","Version history":"版本历史","Versions":"版本","Very disappointed":"非常失望","Via CrofAI":"经由 CrofAI","Via project":"来自项目","View only":"仅查看","View preview":"查看预览","View source":"查看源码","Viewing":"正在查看","Visibility":"可见性","Visit site":"访问网站","Waiting for your answer":"等待你的回答","Wallet":"钱包","Wallpaper":"壁纸","Wallpaper link":"壁纸链接","Wallpaper type":"壁纸类型","Want a FAQ under the plans too?":"套餐下面也要加常见问题吗？","Want me to book a table for Saturday night?":"要我订周六晚上的餐位吗？","Website":"网站","Websites and apps":"网站与应用","Weekday and date":"星期与日期","Weekend in Lisbon":"里斯本的周末","Welcome questions":"欢迎页问题","Welcome to Freebuff":"欢迎使用 Freebuff","What can I help build?":"想让我帮你做点什么？","What could be better?":"哪里可以做得更好？","What is this project about?":"这个项目是做什么的？","What kind of feedback is this?":"这是什么类型的反馈？","What the assistant is doing":"助手正在做什么","What the image shows":"图片内容","What to talk about":"想聊的内容","When a run asks for signup":"运行要求注册时","When it's busy, DeepSeek V4.1 Flash answers instead.":"它繁忙时由 DeepSeek V4.1 Flash 代答。","When should we suggest your product?":"什么时候推荐你的产品？","Where the MCP server runs":"MCP 服务器的运行位置","Where the campaign runs":"广告系列的投放位置","Where you are mentioned":"你被提及的地方","Whiteboard":"白板","Whole number":"整数","Why this ad":"为什么显示此广告","Why this?":"为什么是这个？","Work projects":"工作项目","Work with your local files, run commands and build apps.":"使用本地文件、运行命令、构建应用。","Working":"运行中","Workspace files":"工作区文件","Workspace mode":"工作区模式","Write another":"再写一条","Year to date":"年初至今","You just unlocked unlimited free coding":"你已解锁无限免费编程","You might also want to try":"你可能还想试试","You're on fire!":"你太厉害了！","Your Desktop sign-in has expired. Sign out, then sign in again.":"桌面端登录已过期。先退出登录，再重新登录。","Your artifacts":"你的产物","Your comment":"你的评论","Your draft will stay here while you finish signing in.":"登录期间，草稿会保留在这里。","Your feedback":"你的反馈","Your hold has ended. You can still submit while spots remain.":"你的保留名额已结束。还有名额时仍可提交。","Your invite link":"你的邀请链接","Your key":"你的密钥","Your message":"你的消息","Your post":"你的帖子","Your providers":"你的服务商","Your skills":"你的技能","Your subscription":"你的订阅","Zoom in":"放大","Zoom out":"缩小","account":"账号","branch":"分支","chat":"对话","draft":"草稿","file":"文件","folder":"文件夹","model":"模型","preview":"预览","private":"私有","project":"项目","public":"公开","repository":"仓库","search":"搜索","session":"会话","settings":"设置","skill":"技能","tab":"标签页","template":"模板","terminal":"终端","thread":"会话","workspace":"工作区"}
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
