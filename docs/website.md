# 网站维护

网站由现有 Markdown 文章生成，输出到 `dist/`。无需 GitBook 或 Node 10。

## 本地预览

使用 Node.js 22 或更高版本：

```sh
npm ci
npm run dev
```

访问 `http://127.0.0.1:4173/`。修改模板或样式后运行 `npm run build`，刷新浏览器；修改文章后同样重新构建。

```sh
npm run build
npm run check
```

检查会验证所有生成页面的站内链接、资源、文章目录锚点、唯一标题及搜索索引。

右上角的月亮/太阳按钮切换夜间与日间模式。首次访问默认使用科技风夜间配色，手动选择保存在浏览器本地，刷新、跨页面和再次访问时沿用。正文、表格、代码高亮和文章来源标识均适配夜间模式。样式与脚本 URL 带内容版本，发布更新后会加载相应资源。

博客列表进入文章后，左上角返回入口会保留关键词、分类、排序及页码；浏览器允许会话存储时还会恢复列表滚动位置。手机（宽度不超过 760px）的目录固定在底部，默认折叠，点击后展开；桌面目录跟随滚动。目录和页顶显示阅读进度。代码块提供复制按钮及结果反馈，无法访问剪贴板时会尝试兼容复制方式，失败时明确提示手动选取。

页头提供 RSS 图标入口，首页、博客侧栏和文末还提供可复制地址的订阅区块，`/feed.xml` 自动包含全部已发布文章的标题、摘要、分类、永久链接和更新日期（沿用 Git 最后提交日期）。文章永久链接作为 GUID，更新不会产生新的订阅条目。页面头部提供 RSS 自动发现、canonical、Open Graph 和 Twitter 分享信息；每篇文章使用自己的标题及摘要，共用 `site/assets/share-preview.png` 的 1200 × 630 品牌封面。分享平台可能缓存旧预览。

## 增加与更新文章

继续在原分类目录中编辑 Markdown。一级目录作为分类，一级标题作为文章标题，没有一级标题时使用文件名。日期来自该文件最后一次 Git 提交，阅读时间由正文长度估算。

构建仅包含 Git 已跟踪的文章。新文章先执行 `git add "分类/文章.md"`，再构建预览。`草稿/`、`docs/`、根目录工作笔记不会发布。原文章路径继续生成同名 `.html`，历史链接仍可访问。

新增分类只需新增文章目录，无需更新 `SUMMARY.md`。中文与空格路径、Markdown 表格、代码高亮和文章内部链接均受支持。图片继续使用文章已有图床链接；远程图片的可用性取决于原图床。

文章列表、首页最近文章及阅读页会显示写作来源。`site/article-origins.json` 的 `translated` 列表按仓库内 Markdown 路径标记“翻译”，用于英文文章的中文译文；`aiGenerated` 列表标记“AI 生成”，其余文章默认显示“手工编写”。翻译标记优先于 AI 生成标记，使用 AI 辅助的译文也归为“翻译”。新增文章时同步更新对应列表；构建会检查列出的文章是否存在。译文正文保留原文标题、作者和原文链接，并沿用原文结构。博客可通过“翻译”筛选或 `?origin=translation` 链接直接查看译文。

## 维护项目

编辑 `site/projects.json` 的项目名称、描述、分类和地址。整张项目卡片点击后进入对应项目网站或仓库。已停止维护的项目在 `site/views.mjs` 中单独展示；TalkWithCat 原文没有地址，因此保留为文字。

设置 `"featured": true` 的项目优先展示在首页与项目页推荐区，按数组顺序排列。当前溪流和精英日课知识地图在桌面左右并列，手机上下排列；推荐项目不再重复出现在项目页下方分组中。

独立 HTML 项目放在 `site/projects/<项目名>/index.html`（附属资源也放入该目录），构建时整体复制到 `dist/projects/`。在 `site/projects.json` 中使用 `/projects/<项目名>/` 作为地址，即可接入首页与项目列表，并加入站点地图。页面内使用相对链接返回项目列表，例如 `href="../"`。当前模型能力雷达图的地址是 `/projects/model-capability/`。

项目地址为 `github.com` 时，卡片注明“查看源码”；其他地址注明“打开网站”。

数组顺序就是展示顺序：按潜在受众范围、使用场景的普遍性及使用门槛估计，通用内容工具优先，平台专用工具随后，专业开发工具靠后；这不是实际用户量排名。首页先展示推荐项目，再用其他项目补足 4 个；项目页展示全部项目。

## 发布到 GitHub Pages

仓库现有配置为 `gh-pages` 分支根目录发布。新增 `.github/workflows/pages.yml` 沿用该配置，不要求切换 Pages 的 Source。

页面改造提交并推送到 `main` 后，Actions 安装依赖、构建、检查，生成的静态文件以普通提交同步到 `gh-pages`，然后请求 Pages 构建。`gh-pages` 的历史记录与 `CNAME` 会保留。PR 只构建检查，不发布。

`publish.sh` 现在只执行本地构建与检查，避免旧脚本将草稿一并提交或切换当前分支。发布后可在 Actions 查看构建状态。

## 访问统计（Cloudflare Web Analytics）

所有页面共用模板，通过 Cloudflare Web Analytics 统计访问数据。`qingeneral.github.io` 的站点 token 已配置在 `site/views.mjs` 中；这是公开的统计标识，不是 Cloudflare API 密钥，无需额外配置 GitHub Actions 变量。

运行普通构建即会将官方 `type="module"` beacon 脚本加入首页、列表页、项目页、文章页和 404 页。模块脚本不会阻塞 HTML 解析；静态网站不启用 SPA 跟踪，避免列表筛选的 URL 更新被当成新页面访问。GitHub Pages 使用手动添加脚本的方式，无需迁移托管或修改 DNS。

推送更新到 `main` 并完成发布后，访问网站，在浏览器 Network 面板确认加载 `static.cloudflareinsights.com/beacon.min.js`，并向 `cloudflareinsights.com/cdn-cgi/rum` 发送统计请求。稍等几分钟后在 [Cloudflare Web Analytics 控制台](https://dash.cloudflare.com/?to=/:account/web-analytics) 查看访问量、页面、来源及性能数据。

构建时可通过环境变量 `CLOUDFLARE_WEB_ANALYTICS_TOKEN` 覆盖默认 token，显式设置为空值则关闭统计：`CLOUDFLARE_WEB_ANALYTICS_TOKEN='' npm run dev`。本地调试建议使用此方式，避免加载远程统计脚本。非空 token 必须为 32 位十六进制字符，否则构建会明确报错。更换站点时从 Cloudflare **Manage site** 获取新 token，更新模板后重新构建发布。

接入流程参考 [Cloudflare 官方说明](https://developers.cloudflare.com/web-analytics/get-started/)，模块脚本说明见 [Cloudflare FAQ](https://developers.cloudflare.com/web-analytics/faq/)。

## 科技风页面

视觉使用近黑底色、信号青、坐标网格、面板角标和等宽编号；日间模式使用浅灰底和深青强调色。字体无法在线加载时使用系统字体。

首页显示最新文章、主题统计、连载系列和项目。编号标题自动组成系列；RePlugin 和“TDD 与重构”使用模板中明确列出的阅读顺序。“TDD 与重构”包含测试驱动开发入门、重构概述及四篇代码坏味道实践，覆盖原来的重构子系列。统计来自已发布文章，不包含未跟踪稿件。

博客按年份分组，支持全文搜索、分类、写作方式、排序和分页。子目录文章可折叠成卡片合集；搜索时显示命中的具体文章。筛选、合集展开和分页状态存入 URL，文章返回入口保留列表状态。按 `/` 可快速进入搜索。项目分组与知识地图统计在 `site/projects.json` 中维护。
