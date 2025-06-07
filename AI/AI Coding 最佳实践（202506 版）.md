# AI Coding 最佳实践（202506 版）

Trae 海外版近期开始收费了。但是 AI Coding 最强 IDE 的宝座目前还是属于 Cursor，特别是在 Claude 4 的加持下。我两个都买了会员，同样的模型、同样的提示词，比较之下，Trae 还是稍欠火候。

这里我都是使用 Claude 4 模型，输入了以下提示词：

> 帮我写一个电影每日推荐的网站，提供电脑和手机预览两个版本，要有一张电影剧照，并配有当前的日期和农历日期，以及今年还剩余多少天，并附有电影名称、原产国、电影类型和出版年的信息，以及一句电影的经典台词。界面设计要优美。

Cursor + Claude 4 的生成代码运行结果：

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/WechatIMG1201.jpg)

Trae + Claude 4 写到一半，写出了一个 bug，一直无法修复：

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/WechatIMG1199.jpg)

在配置了 Trae 的 Rules，将之前的 bug 修复之后，也旗鼓相当。

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/%E6%98%9F%E7%90%83%E5%A4%A7%E6%88%98.jpeg)

当然这里只是找了一个 case 做示例，**总的来说在尝试了多个 Coding 场景之后，Trae 海外版 + Claude 4 接近 Cursor 的水平，有差距，但差距并不算大。Trae 国内版 + Gemini Pro 可能因为免费，限制了 Context 窗口，效果还是差很多。**

## 要有 Rules

**这里给 Trae 配置效果比较好的 Rule 是 riper-5**，这是 Cursor 论坛上一位用户提供的，给 AI 提供了五种模式：

- Research：研究模式，主要用来收集背景信息
- Innovate：创新模式，主要用来提出多种可以达到目标的方法
- Plan：计划模式，出一版详细的计划和代码改动方案
- Execute：执行模式，按照上一步生成的计划进行代码修改
- Review：复盘模式，严格验证执行是否是根据计划来的

**这五个模式，可以说就是人类做一件事情所有步骤的一个总结和归纳。同时，也严格约束了模型，让其在执行中不会出现过多的幻觉和意想不到的情况。加上这个 Rule 使用 Claude 3.7 也可以做到很不错的效果，对于疑难 bug 有奇效。**

riper-5 Rule 的来源网址：[I created an AMAZING MODE called “RIPER-5 Mode” Fixes Claude 3.7 Drastically!](https://forum.cursor.com/t/i-created-an-amazing-mode-called-riper-5-mode-fixes-claude-3-7-drastically/65516)

**AI Coding 要合理的使用 Rule，不要不使用，也不要一次性使用过多的 Rule，这会导致模型的 Context 爆炸，进而导致对每个 Rule 的理解都不是很到位。** 所以要合理的加载 Rules，这里不再多说，可以参考 Cursor 的 Rule 配置规则。合理配置 Always、Manual、Agent Request 等模式即可。Trae 当前对 Rule 的配置支持还比较差，只支持配置一个 Project Rule，需要自己去定义路由规则。

## 要有 MCP

除此之外，还要配置一些不错的 MCP。先给一个 [MCP 聚合网站](https://mcp.so/)。Trae 做的不错的是自带了 MCP 商店，很多可以一键配置。同时一般 MCP 都是互通的，都可以在 Trae、Cursor、Claude 上配置使用。

**MCP 的一个比较恰当的比方是：类似于电脑的 USB 接口，我们可以通过这个接口为电脑接入各种外部工具，如打印机、U盘、键盘、摄像头等。**

- Cursor/Trae = Agent 的实现
- Agent = 大模型 + 工具
- MCP 就是大模型与工具之间数据通信的接口定义。

这里推荐几个 MCP：
- Figma AI Bridge：可以通过 Figma 设计稿转为 UI 代码，解放 UI Boy/UI Girl
- Memory：记忆插件，给大模型提供记忆的能力，不过 Cursor 最新版本已经自带支持 memory 能力，但代价是关掉代码仓库的隐私模式，目前不推荐在工作场景使用
- Puppeteer：浏览器操作助手，前端开发神器，有了这个 MCP，AI 可以自己打开网页，查看展示效果，并进行调试和修改问题
- Sequential Thinking：帮助 AI 结构化思考
- Excel：让 AI 拥有读取 excel 文件的能力

除了上述 MCP 外，还有很多 MCP 工具使用的提供，比如 Git、Redis 等数据库、文件操作等，你可以选出比较适合自己工作流的 MCP 集合。

## 要有文档集

**Rule 是作为一种固化的上下文提供给 AI，还有一种方式是文档。Trae 和 Cursor 都有增加文档的功能。你可以将一些库的开发文档说明和项目文档增加到文档集中，来帮助 AI 理解开发内容。**

比如你要接入百度的语音转文字 API，不使用文档集之前，AI 可能会去已有的模型数据去查找，但是大概率找不到。然后可能会去搜索，但如果是一些比较小众的文档不一定会搜索到。但如果你使用了文档集，将语音转文字的 API 文档放到了文档集中，Cursor/Trae 可以直接根据文档集中的 API 文档理解直接来修改代码。效率更高，效果更好。

## 要有更棒的模型

**最后说说模型，在编码上 Claude 4 效果最佳**，优于 Claude 3.7、Claude 3.5。Gemini 2.5 Pro Preview 0506 也不错，最近也爆出消息，Gemini 的最新版本在跑分上超越了 Claude 4，期待后续放出后使用一波。国内的模型目前在结合 Agent Coding 上表现不佳。DeepSeek R1 也没有对 Agent 使用场景做出优化，表现同样不佳。

## 最佳实践

以上就是截止到目前——2025 年 06 月，我所认为的 AI Coding 最佳实践。

**总的来说，如果你想探一探目前 AI Coding 最棒能做到什么程度，就去选择更好的 IDE Cursor，更好的模型 Claude 4，配置合适的 Rules 如 riper-5，选择合适的 MCP 如 Puppeteer，添加对应的文档集如项目文档。Rule、MCP、文档集这个和工作流和项目场景比较相关，参考他人推荐之余，需要各自实践和摸索。**

这样你就可以打造一把 AI Coding 利器，挥一挥它你就会知道这把刀有多锋利。大模型爆发到现在没过多久，AI Coding 就发展到了现在这般，它已经可以解放掉程序员在很多枯燥编码的时间，让他们将精力更多放在架构设计和优化上。

快行动起来，时不我待。