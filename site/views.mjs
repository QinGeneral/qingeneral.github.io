export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const base = (process.env.SITE_BASE_PATH || '').replace(/\/$/, '');
export const url = path => `${base}/${path}`;
export const icon = (name, className = '') => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    note: '<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
    code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-13-2 16"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    up: '<path d="m6 14 6-6 6 6"/>',
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};

export function layout({ title, description = '谈谈 AI、编程和读书，也把想法做成小工具。', active = '', body, canonical = '', script = false }) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} · QinGeneral</title><meta name="description" content="${escape(description)}">
<meta name="theme-color" content="#f8f7f4"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${active === 'article' ? 'article' : 'website'}">
${canonical ? `<link rel="canonical" href="https://qingeneral.github.io${url(canonical)}">` : ''}
<link rel="icon" href="${url('assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${url('assets/site.css')}">
<script src="${url('assets/site.js')}" defer></script>${script ? `<script src="${url('assets/blog.js')}" defer></script>` : ''}</head>
<body><a class="skip-link" href="#main">跳到正文</a>
<header class="site-header wrap"><a class="wordmark" href="${url('')}" aria-label="QinGeneral 首页">QinGeneral<span class="brand-dot" aria-hidden="true"></span></a>
<nav aria-label="主导航">${[['首页', '', 'home'], ['博客', 'blog/', 'blog'], ['项目', 'projects/', 'projects']].map(([label, href, key]) => `<a href="${url(href)}" ${active === key || (active === 'article' && key === 'blog') ? 'aria-current="page"' : ''}>${label}</a>`).join('')}<a href="https://github.com/QinGeneral" target="_blank" rel="noopener noreferrer">GitHub ${icon('external')}</a></nav></header>
${body}
<footer class="site-footer wrap"><a href="${url('')}" class="footer-brand">QinGeneral<span class="brand-dot" aria-hidden="true"></span></a><span>保持好奇，持续记录。</span></footer>
<button class="back-top" aria-label="回到顶部" hidden>${icon('up')}</button></body></html>`;
}

export const projectCards = projects => `<div class="project-grid">${projects.map(p => `<a class="project-card" href="${escape(p.url)}"><span class="project-icon">${icon(p.icon)}</span>${icon('external', 'project-arrow')}<h3>${escape(p.name)}</h3><p>${escape(p.description)}</p><span class="project-tags">${escape(p.tags)}</span></a>`).join('')}</div>`;

const articleOrigin = a => `<span class="article-origin origin-${a.origin}">${a.origin === 'ai' ? 'AI 生成' : '手工编写'}</span>`;

export function articleRow(a) {
  return `<article class="article-row" data-path="${escape(a.path)}" data-category="${escape(a.category)}"><div class="article-meta"><span>${escape(a.category)}</span><span aria-hidden="true">·</span><time datetime="${a.date}">${a.date}</time><span aria-hidden="true">·</span><span>${a.minutes} 分钟阅读</span>${articleOrigin(a)}</div><h2><a href="${url(a.href)}">${escape(a.title)}</a></h2><p>${escape(a.excerpt)}</p><a class="read-link" href="${url(a.href)}" aria-label="阅读全文：${escape(a.title)}">阅读全文 ${icon('arrow')}</a></article>`;
}

export function home(projects, articles) {
  return layout({ title: '首页', active: 'home', body: `<main id="main" class="wrap"><section class="hero"><div><h1>在代码与文字之间，<br><em>持续探索。</em></h1><p>谈谈 AI、编程和读书，也把想法做成小工具。</p><div class="hero-actions"><a class="button primary" href="${url('blog/')}">阅读博客 ${icon('arrow')}</a><a class="button" href="${url('projects/')}">浏览项目</a></div></div><div class="hero-type" aria-hidden="true"><span>&amp;</span><p>Build. Write. Think.</p></div></section>
<section class="section" aria-labelledby="projects-title"><div class="section-heading"><h2 id="projects-title">把想法，做成工具</h2><a class="text-link" href="${url('projects/')}">全部项目 ${icon('arrow')}</a></div>${projectCards(projects)}</section>
<section class="section latest" aria-labelledby="latest-title"><div class="section-heading"><h2 id="latest-title">最近的记录</h2><a class="text-link" href="${url('blog/')}">全部文章 ${icon('arrow')}</a></div>${articles.slice(0, 3).map(articleRow).join('')}</section></main>`, canonical: '' });
}

export function projectsPage(projects) {
  return layout({ title: '项目', active: 'projects', canonical: 'projects/', body: `<main id="main" class="wrap"><section class="page-intro"><h1>把想法，做成工具</h1><p>一些解决小问题的尝试，也是探索技术的另一种方式。</p></section><section aria-label="个人项目">${projectCards(projects)}</section><section class="archive-projects section"><h2>过去的尝试</h2><p class="muted">以下项目已不再维护。</p><div class="archive-row"><a href="https://www.cattalk.club/" target="_blank" rel="noopener noreferrer">CatTalk ${icon('external')}</a><p>无需翻墙的 ChatGPT 网站</p><span>已停止维护</span></div><div class="archive-row"><span class="archive-name">TalkWithCat</span><p>基于 OpenAI 的聊天、PDF 摘要小程序</p><span>已停止维护</span></div></section></main>` });
}

export function blogPage(articles) {
  const preferred = ['AI', 'Android', 'Java', '算法与数据结构', '读书笔记'];
  const categories = [...new Set(articles.map(a => a.category))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const categoryLink = c => `<a class="category-link" data-category="${escape(c)}" href="${url('blog/')}?category=${encodeURIComponent(c)}">${escape(c)}</a>`;
  return layout({ title: '博客', active: 'blog', canonical: 'blog/', script: true, body: `<main id="main" class="wrap"><section class="page-intro"><h1>文字里的探索</h1><p>关于 AI、编程与阅读的思考和实践。</p></section><form class="search-form" role="search" action="${url('blog/')}"><label for="article-search" class="sr-only">搜索文章</label>${icon('search')}<input id="article-search" type="search" name="q" placeholder="搜索文章标题、内容或关键词…" autocomplete="off"><button type="button" id="clear-search" hidden aria-label="清除搜索">清除</button></form><noscript><p>启用 JavaScript 后可使用搜索和分类筛选，以下是全部文章。</p></noscript>
<div class="blog-layout"><aside class="categories" aria-label="文章分类"><a class="category-link selected" data-category="" href="${url('blog/')}" aria-current="true">全部文章</a>${preferred.filter(c => categories.includes(c)).map(categoryLink).join('')}<details class="more-categories"><summary>更多分类</summary>${categories.filter(c => !preferred.includes(c)).map(categoryLink).join('')}</details></aside>
<section class="article-list" aria-label="文章列表"><div class="list-toolbar"><p id="result-label" role="status" aria-live="polite">全部文章 <span>${articles.length} 篇</span></p><label class="sort-label"><span class="sr-only">文章排序</span><select id="article-sort"><option value="newest">按更新排序</option><option value="oldest">最早更新优先</option><option value="title">按标题排序</option></select></label></div><div id="article-results">${articles.map(articleRow).join('')}</div><div id="empty-state" hidden><h2>暂时没有找到文章</h2><p>试试其他关键词，或清除筛选后继续探索。</p><button id="reset-filters" class="button">查看全部文章</button></div><nav id="pagination" class="pagination" aria-label="文章分页" hidden><button id="previous-page" class="button">上一页</button><span id="page-label"></span><button id="next-page" class="button">下一页</button></nav></section></div></main>` });
}

export function articlePage(a, content, headings, related) {
  const toc = headings.length ? `<aside class="toc"><details open><summary>文章目录</summary><nav aria-label="文章目录">${headings.map(h => `<a class="toc-link level-${h.level}" href="#${escape(h.id)}">${escape(h.text)}</a>`).join('')}</nav></details></aside>` : '';
  return layout({ title: a.title, description: a.excerpt, active: 'article', canonical: a.href, body: `<div class="reading-progress" aria-hidden="true"></div><main id="main" class="wrap article-page"><a class="text-link article-back" href="${url('blog/')}?category=${encodeURIComponent(a.category)}">${icon('back')} 返回${escape(a.category)}文章</a><header class="article-heading"><div class="article-meta"><a href="${url('blog/')}?category=${encodeURIComponent(a.category)}">${escape(a.category)}</a><span aria-hidden="true">·</span><span>更新于 <time datetime="${a.date}">${a.date}</time></span><span aria-hidden="true">·</span><span>${a.minutes} 分钟阅读</span>${articleOrigin(a)}</div><h1>${escape(a.title)}</h1></header><div class="reading-layout"><article class="prose">${content}<div class="article-end"><p>感谢阅读。保持好奇，持续探索。</p><a class="text-link" href="https://github.com/QinGeneral/qingeneral.github.io/blob/main/${a.path.split('/').map(encodeURIComponent).join('/')}" target="_blank" rel="noopener noreferrer">查看 Markdown 原文 ${icon('external')}</a></div></article>${toc}</div>${related.length ? `<section class="related section"><div class="section-heading"><h2>继续阅读</h2><a class="text-link" href="${url('blog/')}?category=${encodeURIComponent(a.category)}">更多${escape(a.category)}文章 ${icon('arrow')}</a></div>${related.map(articleRow).join('')}</section>` : ''}</main>` });
}
