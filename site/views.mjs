import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const base = (process.env.SITE_BASE_PATH || '').replace(/\/$/, '');
export const url = path => `${base}/${path}`;
const siteOrigin = 'https://qingeneral.github.io';
// Public site identifier from Cloudflare's installation snippet; empty env disables analytics.
const analyticsToken = (process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN ?? 'd5d1a73bfefc4797998e83cb80de1477').trim();
if (analyticsToken && !/^[a-f0-9]{32}$/i.test(analyticsToken)) {
  throw new Error('CLOUDFLARE_WEB_ANALYTICS_TOKEN 必须是 Cloudflare Web Analytics 代码片段中的 32 位十六进制 token。');
}
const analyticsScript = analyticsToken ? `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: analyticsToken, spa: false })}'></script>` : '';
const feedUrl = `${siteOrigin}${url('feed.xml')}`;
const assetVersions = Object.fromEntries(['site.css', 'site.js', 'blog.js', 'theme.js'].map(name => [name, createHash('sha256').update(readFileSync(new URL(`assets/${name}`, import.meta.url))).digest('hex').slice(0, 12)]));
const asset = name => url(`assets/${name}?v=${assetVersions[name]}`);
export const icon = (name, className = '') => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    up: '<path d="m6 14 6-6 6 6"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    rss: '<circle cx="5" cy="19" r="1"/><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    pen: '<path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 5Z"/>',
    sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
const pad = n => String(n).padStart(2, '0');
const dotted = date => date.replaceAll('-', '.');
const categoryHref = category => `${url('blog/')}?category=${encodeURIComponent(category)}`;
const isRepo = p => new URL(p.url).hostname === 'github.com';

// Numbered titles such as “浅谈 JVM 3：指令集” form a series once two or more parts exist.
export function annotateSeries(articles) {
  const groups = new Map();
  for (const a of articles) {
    const match = a.title.match(/^(.+?\S)\s+(\d{1,2})\s*(?:[：:]|\s)\s*(.+)$/);
    if (!match) continue;
    const key = `${a.category}\0${match[1]}`;
    if (!groups.has(key)) groups.set(key, { name: match[1], category: a.category, items: [] });
    groups.get(key).items.push({ article: a, part: Number(match[2]), subtitle: match[3] });
  }
  // Editorial sequences also include introductions without numbered titles.
  const editorialSeries = [
    { name: 'RePlugin', category: 'Android', order: ['Android插件化框架 RePlugin 初探', 'RePlugin 阅读源码环境搭建', 'RePlugin 插件启动源码分析', 'RePlugin 插件管理与权限管理'] },
    { name: 'TDD 与重构', category: 'TDD', order: ['浅谈测试驱动开发', '重构', '代码坏味道及其重构 1 命名问题', '代码坏味道及其重构 2 重复代码', '代码坏味道及其重构 3 过长函数', '代码坏味道及其重构 4 过长参数列表'] },
  ];
  for (const { name, category, order } of editorialSeries) {
    const items = order.flatMap((title, index) => {
      const article = articles.find(a => a.path === `${category}/${title}.md`);
      return article ? [{ article, part: index + 1, subtitle: article.title }] : [];
    });
    if (items.length < 2) continue;
    const included = new Set(items.map(item => item.article));
    // Replace inferred subseries rather than showing the same articles twice.
    for (const [key, group] of groups) {
      if (group.items.every(item => included.has(item.article))) groups.delete(key);
    }
    groups.set(`${category}\0${name}`, { name, category, items });
  }
  const series = [...groups.values()].filter(s => s.items.length > 1);
  for (const s of series) {
    s.items.sort((x, y) => x.part - y.part);
    s.items.forEach((item, index) => { item.article.series = { group: s, index: index + 1 }; });
  }
  return series.sort((x, y) => y.items.length - x.items.length || x.name.localeCompare(y.name, 'zh-CN'));
}

export function layout({ title, description = '谈谈 AI、编程和读书，也把想法做成小工具。', active = '', body, canonical = '', script = false }) {
  const canonicalUrl = `${siteOrigin}${url(canonical)}`;
  const previewUrl = `${siteOrigin}${url('assets/share-preview.png')}`;
  const nav = [['首页', '', 'home'], ['文章', 'blog/', 'blog'], ['系列', '#series', 'series'], ['项目', 'projects/', 'projects']];
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} · QinGeneral</title><meta name="description" content="${escape(description)}">
<meta name="theme-color" content="#05070a"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${active === 'article' ? 'article' : 'website'}">
<link rel="canonical" href="${escape(canonicalUrl)}"><meta property="og:url" content="${escape(canonicalUrl)}"><meta property="og:site_name" content="QinGeneral"><meta property="og:locale" content="zh_CN">
<meta property="og:image" content="${escape(previewUrl)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="QinGeneral · 在代码与文字之间，持续探索世界。">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${escape(previewUrl)}">
<link rel="alternate" type="application/rss+xml" title="QinGeneral 博客订阅" href="${url('feed.xml')}">
<script src="${asset('theme.js')}"></script>
<link rel="icon" href="${url('assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${asset('site.css')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Web fonts load without blocking rendering; system fonts remain the fallback where Google Fonts is unreachable. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;family=Space+Grotesk:wght@500;700&amp;display=swap" media="print" onload="this.media='all'">
<script src="${asset('site.js')}" defer></script>${script ? `<script src="${asset('blog.js')}" defer></script>` : ''}</head>
<body><a class="skip-link" href="#main">跳到正文</a>
<header class="site-header"><div class="wrap header-inner"><a class="wordmark" href="${url('')}" aria-label="QinGeneral 首页"><span class="brand-mark" aria-hidden="true">QG</span><span>QinGeneral</span></a>
<nav class="main-nav" aria-label="主导航">${nav.map(([label, href, key], i) => `<a href="${href.startsWith('#') ? url('') + href : url(href)}" ${active === key || (active === 'article' && key === 'blog') ? 'aria-current="page"' : ''}><span class="nav-index" aria-hidden="true">${pad(i + 1)}</span>${label}</a>`).join('')}</nav>
<div class="header-tools"><a class="search-trigger" href="${url('blog/')}#article-search"><span class="prompt" aria-hidden="true">&gt;</span><span class="search-label">搜索文章</span><kbd aria-hidden="true">/</kbd></a><a class="icon-button github-link" href="https://github.com/QinGeneral" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icon('external')}<span>GitHub</span></a><button id="theme-toggle" class="icon-button theme-toggle" type="button" aria-label="切换到日间模式" aria-pressed="true" hidden>${icon('moon', 'theme-moon')}${icon('sun', 'theme-sun')}</button><a class="icon-button rss-link" href="${url('feed.xml')}" aria-label="RSS 订阅博客">${icon('rss')}</a></div></div></header>
${body}
<footer class="site-footer"><div class="wrap footer-inner"><span>© QINGENERAL — 保持好奇，持续记录。</span><span class="footer-links"><a href="https://github.com/QinGeneral" target="_blank" rel="noopener noreferrer">GITHUB</a><a href="${url('feed.xml')}">RSS</a><a href="${url('sitemap.xml')}">SITEMAP</a></span></div></footer>
<button class="back-top" aria-label="回到顶部" hidden>${icon('up')}</button>
${analyticsScript}</body></html>`;
}

const sectionHeading = (id, index, title, link = '') => `<div class="section-heading"><h2 id="${id}"><span class="section-index" aria-hidden="true">[${index}]</span>${title}</h2>${link}</div>`;

const subscribe = (headingId, compact = false) => `<section class="subscribe${compact ? ' compact' : ''}" aria-labelledby="${headingId}"><div class="subscribe-copy"><p class="eyebrow">// SUBSCRIBE · RSS</p><h2 id="${headingId}">${compact ? '订阅更新' : '新文章发布时，第一时间收到'}</h2><p>用任意 RSS 阅读器订阅，不打扰，也不需要留邮箱。</p></div><div class="subscribe-field"><label class="sr-only" for="${headingId}-url">RSS 地址</label>${compact ? '' : '<span class="prompt" aria-hidden="true">$</span>'}<input id="${headingId}-url" readonly value="${escape(feedUrl)}"><button type="button" class="button primary" data-copy="${escape(feedUrl)}">复制地址</button></div></section>`;

const articleOrigin = a => `<span class="article-origin origin-${a.origin}">${icon(a.origin === 'ai' ? 'sparkle' : 'pen')}<span>${a.origin === 'ai' ? 'AI 生成' : '手工编写'}</span></span>`;
const seriesBadge = a => a.series ? `<span class="series-badge">SERIES ${escape(a.series.group.name)} · ${a.series.index}/${a.series.group.items.length}</span>` : '';

export function articleRow(a, { heading = 'h2', yearStart = '' } = {}) {
  const collection = a.path.split('/').length > 2 ? a.path.split('/').slice(0, -1).join('/') : '';
  return `<article class="article-row" data-path="${escape(a.path)}" data-category="${escape(a.category)}" data-origin="${a.origin}" data-year="${a.date.slice(0, 4)}"${collection ? ` data-collection="${escape(collection)}"` : ''}${yearStart ? ` data-year-start="${yearStart}"` : ''}><time class="row-date" datetime="${a.date}">${dotted(a.date)}</time><div class="row-body">${seriesBadge(a)}<${heading}><a href="${url(a.href)}">${escape(a.title)}</a></${heading}><p>${escape(a.excerpt)}</p></div><div class="row-meta"><span class="tag">${escape(a.category)}</span><span>${a.minutes} 分钟</span>${articleOrigin(a)}</div></article>`;
}

const projectRow = (p, i) => `<a class="project-row" href="${escape(p.url)}"><span class="row-index">P-${pad(i + 1)}</span><span class="project-name${isRepo(p) ? ' mono' : ''}">${escape(p.name)}</span><span class="project-desc">${escape(p.description)}</span><span class="project-kind${isRepo(p) ? '' : ' live'}">${isRepo(p) ? 'REPO' : '<span class="pulse" aria-hidden="true"></span>LIVE'} ↗</span></a>`;

const projectCard = p => `<a class="project-card" href="${escape(p.url)}"><span class="project-card-head"><span class="project-name${/^[\w.-]+$/.test(p.name) ? ' mono' : ''}">${escape(p.name)}</span>${icon('external', 'project-arrow')}</span><span class="project-desc">${escape(p.description)}</span><span class="project-foot"><span>${escape(p.tags)}</span><span class="project-kind">${isRepo(p) ? '源码 REPO' : '打开网站'}</span></span></a>`;

export function home(projects, articles, series) {
  const [latest, ...rest] = articles;
  const counts = new Map();
  for (const a of articles) counts.set(a.category, (counts.get(a.category) || 0) + 1);
  const topics = [...counts].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], 'zh-CN'));
  const max = topics[0][1];
  const since = articles.reduce((year, a) => Math.min(year, Number(a.date.slice(0, 4))), Infinity);
  const stats = [['ARTICLES', articles.length, '篇文章'], ['TOPICS', topics.length, '个主题'], ['SERIES', series.length, '个连载系列'], ['PROJECTS', projects.length, '个项目']];
  return layout({ title: '首页', active: 'home', canonical: '', body: `<main id="main">
<section class="hero grid-bg"><div class="wrap hero-inner"><div class="hero-copy"><p class="eyebrow">// AI · 编程 · 读书 — SINCE ${since}</p><h1>在代码与文字之间，<br><em>持续探索世界。</em></h1><p class="lead">谈谈 AI、编程和读书，也把想法做成小工具。</p><div class="hero-actions"><a class="button primary" href="${url('blog/')}">开始阅读 ${icon('arrow')}</a><a class="button" href="${url('projects/')}">看看项目</a></div></div>
<a class="featured hud" href="${url(latest.href)}"><span class="featured-meta"><span class="signal"><span class="pulse" aria-hidden="true"></span>最新发布</span><time datetime="${latest.date}">${dotted(latest.date)}</time></span><span class="featured-title">${escape(latest.title)}</span><span class="featured-excerpt">${escape(latest.excerpt)}</span><span class="featured-foot"><span>${escape(latest.category)}</span><span>${latest.minutes} 分钟</span>${articleOrigin(latest)}</span></a></div></section>
<div class="wrap">
<section class="stats" aria-label="站点概况">${stats.map(([label, value, text], i) => `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value${i === 0 ? ' accent' : ''}">${pad(value)}</span><span class="stat-text">${text}</span></div>`).join('')}</section>
<div class="home-columns"><section class="section recent" aria-labelledby="recent-title">${sectionHeading('recent-title', '01', '最近的记录', `<a class="text-link" href="${url('blog/')}">全部 ${articles.length} 篇 →</a>`)}${rest.slice(0, 4).map(a => articleRow(a, { heading: 'h3' })).join('')}</section>
<aside class="section topics" aria-labelledby="topics-title">${sectionHeading('topics-title', '02', '按主题读')}<nav class="topic-list" aria-label="主题">${topics.slice(0, 6).map(([name, count], i) => `<a class="topic-link" href="${categoryHref(name)}"><span>${escape(name)}</span><span class="topic-count${i === 0 ? ' accent' : ''}">${count}</span><span class="topic-bar" aria-hidden="true"><span style="width:${Math.max(4, Math.round(count / max * 100))}%"${i === 0 ? ' class="accent"' : ''}></span></span></a>`).join('')}${topics.length > 6 ? `<a class="topic-more" href="${url('blog/')}">+ 其余 ${topics.length - 6} 个主题 →</a>` : ''}</nav></aside></div>
<section class="section" aria-labelledby="series">${sectionHeading('series', '03', '连载系列', '<span class="muted">从第一篇开始，按顺序读完</span>')}<div class="series-grid">${series.map((s, i) => `<a class="series-card" href="${url(s.items[0].article.href)}"><span class="series-code">S-${pad(i + 1)} · ${escape(s.category)} · ${s.items.length} 篇</span><span class="series-name">${escape(s.name)}</span><span class="series-desc">从「${escape(s.items[0].subtitle)}」到「${escape(s.items.at(-1).subtitle)}」</span><span class="series-segments" aria-hidden="true" style="--parts:${s.items.length}">${'<span></span>'.repeat(s.items.length)}</span></a>`).join('')}</div></section>
<section class="section" aria-labelledby="projects-title">${sectionHeading('projects-title', '04', '把想法，做成工具', `<a class="text-link" href="${url('projects/')}">全部 ${projects.length} 个项目 →</a>`)}<div class="project-rows">${projects.slice(0, 4).map(projectRow).join('')}</div></section>
${subscribe('subscribe-title')}
</div></main>` });
}

export function projectsPage(projects) {
  const featured = projects.find(p => !isRepo(p));
  const groups = new Map();
  for (const p of projects.filter(p => p !== featured)) {
    const group = p.group || '其他';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(p);
  }
  return layout({ title: '项目', active: 'projects', canonical: 'projects/', body: `<main id="main"><section class="page-intro grid-bg"><div class="wrap"><p class="eyebrow">// BUILD LOG · ${projects.length} PROJECTS</p><h1>把想法，做成工具</h1><p class="lead">一些解决小问题的尝试，也是探索技术的另一种方式。大多是命令行工具，开源在 GitHub。</p>
${featured ? `<a class="featured-project" href="${escape(featured.url)}"><span class="featured-project-copy"><span class="signal"><span class="pulse" aria-hidden="true"></span>FEATURED · LIVE SITE</span><span class="featured-project-name">${escape(featured.name)}</span><span class="featured-project-desc">${escape(featured.description)}</span>${featured.stats ? `<span class="readouts">${featured.stats.map(s => `<span><span class="readout-label">${escape(s.label)}</span><span class="readout-value">${escape(s.value)}</span></span>`).join('')}</span>` : ''}<span class="button primary">打开网站 ${icon('external')}</span></span><span class="featured-project-tags">${escape(featured.tags)}</span></a>` : ''}</div></section>
<div class="wrap">${[...groups].sort((a, b) => ['阅读与学习', '笔记与写作', '开发与折腾', '其他'].indexOf(a[0]) - ['阅读与学习', '笔记与写作', '开发与折腾', '其他'].indexOf(b[0])).map(([name, items], i) => `<section class="section project-group" aria-labelledby="group-${i}">${sectionHeading(`group-${i}`, String.fromCharCode(65 + i), escape(name), `<span class="muted mono">${pad(items.length)}</span>`)}<div class="project-grid">${items.map(projectCard).join('')}</div></section>`).join('')}
<section class="section archive" aria-labelledby="archive-title">${sectionHeading('archive-title', 'X', '过去的尝试', '<span class="muted">已停止维护</span>')}<div class="archive-row"><a href="https://www.cattalk.club/" target="_blank" rel="noopener noreferrer">CatTalk ${icon('external')}</a><p>无需翻墙的 ChatGPT 网站</p><span class="status-archived">ARCHIVED</span></div><div class="archive-row"><span class="archive-name">TalkWithCat</span><p>基于 OpenAI 的聊天、PDF 摘要小程序</p><span class="status-archived">ARCHIVED</span></div></section></div></main>` });
}

export function blogPage(articles, series) {
  const preferred = ['AI', 'Android', 'Java', '算法与数据结构', '读书笔记'];
  const counts = new Map();
  for (const a of articles) counts.set(a.category, (counts.get(a.category) || 0) + 1);
  const categories = [...counts.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const categoryLink = c => `<a class="category-link" data-category="${escape(c)}" href="${categoryHref(c)}">${escape(c)}<span class="count">${counts.get(c)}</span></a>`;
  // Short cards kept in a sub-folder (e.g. AI/AI 产品/) collapse into one summary row.
  const collections = new Map();
  for (const a of articles) {
    const parts = a.path.split('/');
    if (parts.length < 3) continue;
    const key = parts.slice(0, -1).join('/');
    if (!collections.has(key)) collections.set(key, []);
    collections.get(key).push(a);
  }
  const summary = (key, items) => `<article class="article-row collection-row" data-collection-summary="${escape(key)}" data-category="${escape(items[0].category)}" data-origin="${items.every(a => a.origin === items[0].origin) ? items[0].origin : ''}" data-year="${items[0].date.slice(0, 4)}"><time class="row-date" datetime="${items[0].date}">${dotted(items[0].date)}</time><div class="row-body"><h2>${escape(key.split('/').at(-1))}<span class="collection-count">×${items.length}</span></h2><p class="chips">${items.slice(0, 6).map(a => `<span>${escape(a.title)}</span>`).join('')}${items.length > 6 ? '<span class="more">…</span>' : ''}</p></div><div class="row-meta"><span class="tag">${escape(items[0].category)}</span><button type="button" class="expand-collection">展开 +</button></div></article>`;
  let previousYear = '';
  const rows = articles.map(a => {
    const collection = a.path.split('/').length > 2 ? a.path.split('/').slice(0, -1).join('/') : '';
    const lead = collection && collections.get(collection)[0] === a ? summary(collection, collections.get(collection)) : '';
    const year = a.date.slice(0, 4);
    const yearStart = year !== previousYear ? year : '';
    previousYear = year;
    return lead + articleRow(a, { yearStart });
  }).join('');
  return layout({ title: '博客', active: 'blog', canonical: 'blog/', script: true, body: `<main id="main"><section class="page-intro grid-bg"><div class="wrap"><p class="eyebrow">// INDEX · ${articles.length} ENTRIES</p><h1>文章</h1><p class="lead">关于 AI、编程与阅读的思考和实践。</p><form class="search-form" role="search" action="${url('blog/')}"><label for="article-search" class="sr-only">搜索文章</label><span class="prompt" aria-hidden="true">&gt;</span><input id="article-search" type="search" name="q" placeholder="搜索标题、正文或关键词，例如：JVM、MCP、重构" autocomplete="off"><button type="button" id="clear-search" hidden aria-label="清除搜索">清除</button><kbd aria-hidden="true">/</kbd></form></div></section>
<div class="wrap"><noscript><style>.collection-row{display:none}</style><p class="muted">启用 JavaScript 后可使用搜索和分类筛选，以下是全部文章。</p></noscript>
<nav class="categories" aria-label="文章分类"><a class="category-link selected" data-category="" href="${url('blog/')}" aria-current="true">全部<span class="count">${articles.length}</span></a>${preferred.filter(c => counts.has(c)).map(categoryLink).join('')}<details class="more-categories"><summary>+ 其余 ${categories.filter(c => !preferred.includes(c)).length} 个</summary><div class="more-list">${categories.filter(c => !preferred.includes(c)).map(categoryLink).join('')}</div></details></nav>
<div class="list-toolbar"><div class="origin-filter" role="group" aria-label="写作方式"><button type="button" data-origin="" aria-pressed="true">全部</button><button type="button" data-origin="manual" aria-pressed="false">手工编写</button><button type="button" data-origin="ai" aria-pressed="false">AI 生成</button></div><p id="result-label" role="status" aria-live="polite">全部文章 <span>${articles.length} 篇</span></p><div class="toolbar-end">${collections.size ? '<label class="toggle"><input type="checkbox" id="collapse-collections" checked>折叠卡片合集</label>' : ''}<label class="sort-label"><span class="sr-only">文章排序</span><select id="article-sort"><option value="newest">最新优先</option><option value="oldest">最早优先</option><option value="title">按标题</option></select></label></div></div>
<div class="blog-layout"><section class="article-list" aria-label="文章列表"><div id="article-results">${rows}</div><div id="empty-state" hidden><h2>暂时没有找到文章</h2><p>试试其他关键词，或清除筛选后继续探索。</p><button id="reset-filters" class="button">查看全部文章</button></div><nav id="pagination" class="pagination" aria-label="文章分页" hidden><button id="previous-page" class="button">← 上一页</button><span id="page-label"></span><button id="next-page" class="button">下一页 →</button></nav></section>
<aside class="blog-aside">${series.length ? `<section class="panel" aria-labelledby="side-series"><h2 id="side-series"><span class="section-index" aria-hidden="true">[S]</span>连载系列</h2>${series.map(s => `<a class="panel-link" href="${url(s.items[0].article.href)}"><span>${escape(s.name)}</span><span class="mono muted">${pad(s.items.length)}</span></a>`).join('')}</section>` : ''}${subscribe('side-subscribe', true)}</aside></div></div></main>` });
}

export function articlePage(a, content, headings, related, { older, newer } = {}) {
  const canonicalUrl = `${siteOrigin}${url(a.href)}`;
  const sections = headings.filter(h => h.level === 2).length;
  const toc = headings.length ? `<aside class="toc"><details open><summary><span>目录 CONTENTS</span><span class="toc-progress" aria-hidden="true">0%</span></summary><span class="toc-bar" aria-hidden="true"><span></span></span><nav aria-label="文章目录">${headings.map(h => `<a class="toc-link level-${h.level}" href="#${escape(h.id)}">${escape(h.text)}</a>`).join('')}</nav></details></aside>` : '';
  const seriesNav = a.series ? `<nav class="series-nav" aria-label="系列文章"><p class="eyebrow">// SERIES · ${escape(a.series.group.name)} · ${a.series.index}/${a.series.group.items.length}</p><ol>${a.series.group.items.map(item => `<li>${item.article === a ? `<span aria-current="page">${escape(item.article.title)}</span>` : `<a href="${url(item.article.href)}">${escape(item.article.title)}</a>`}</li>`).join('')}</ol></nav>` : '';
  const pager = older || newer ? `<nav class="pager" aria-label="相邻文章">${older ? `<a href="${url(older.href)}"><span class="pager-label">← 上一篇</span><span>${escape(older.title)}</span></a>` : '<span></span>'}${newer ? `<a class="next" href="${url(newer.href)}"><span class="pager-label">下一篇 →</span><span>${escape(newer.title)}</span></a>` : ''}</nav>` : '';
  return layout({ title: a.title, description: a.excerpt, active: 'article', canonical: a.href, body: `<div class="reading-progress" aria-hidden="true"></div><main id="main" class="article-page"><header class="article-hero grid-bg"><div class="wrap article-hero-inner"><a class="text-link article-back" href="${categoryHref(a.category)}">${icon('back')} 返回${escape(a.category)}文章</a><div class="article-tags"><a class="tag accent" href="${categoryHref(a.category)}">${escape(a.category)}</a>${articleOrigin(a)}${a.series ? `<span class="series-badge">SERIES ${a.series.index}/${a.series.group.items.length}</span>` : ''}</div><h1>${escape(a.title)}</h1><dl class="article-stats"><div><dt>UPDATED</dt><dd><time datetime="${a.date}">${dotted(a.date)}</time></dd></div><div><dt>READ TIME</dt><dd>约 ${a.minutes} 分钟</dd></div>${sections ? `<div><dt>SECTIONS</dt><dd>${sections} 个小节</dd></div>` : ''}</dl></div></header>
<div class="wrap reading-layout"><aside class="article-tools" aria-label="文章工具"><button type="button" class="tool-button" data-copy="${escape(canonicalUrl)}">${icon('link')}<span>复制链接</span></button><a class="tool-button" href="https://github.com/QinGeneral/qingeneral.github.io/blob/main/${a.path.split('/').map(encodeURIComponent).join('/')}" target="_blank" rel="noopener noreferrer"><span>.md 原文</span></a></aside>
<article class="prose">${content}${seriesNav}<div class="article-end">${pager}${subscribe('article-subscribe')}</div></article>${toc}</div>
${related.length ? `<section class="wrap related section" aria-labelledby="related-title">${sectionHeading('related-title', '+', '继续阅读', `<a class="text-link" href="${categoryHref(a.category)}">更多${escape(a.category)}文章 →</a>`)}${related.map(r => articleRow(r, { heading: 'h3' })).join('')}</section>` : ''}</main>` });
}
