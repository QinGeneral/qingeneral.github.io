import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { escape, url, home, blogPage, projectsPage, articlePage, layout } from '../site/views.mjs';

const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
const output = path.join(root, 'dist');
const projects = JSON.parse(await readFile('site/projects.json', 'utf8'));
// Only versioned content is published. Drafts and working notes never enter the site.
const files = execFileSync('git', ['ls-files', '-z', '*.md'], { encoding: 'utf8' }).split('\0').filter(file => file.includes('/') && !/^(?:site|scripts|docs|\.\w+|gitbook|node_modules|_book|草稿)\//.test(file));
if (!files.length) throw new Error('没有已跟踪的 Markdown 文章，请先用 git add 添加文章。');
const md = new MarkdownIt({ html: false, linkify: true, typographer: true, highlight(code, language) {
  return language && hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : escape(code);
} });

function normalizeMarkdown(source) {
  let fence = null;
  let comment = false;
  return source.split('\n').map(line => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      return line;
    }
    if (fence || /^( {4}|\t)/.test(line)) return line;
    if (comment) { if (line.includes('-->')) comment = false; return ''; }
    if (line.trim().startsWith('<!--')) { comment = !line.includes('-->'); return ''; }
    // GitBook accepted spaces in link destinations; CommonMark needs angle brackets.
    // Preserve inline code examples exactly while normalizing prose links.
    const convert = text => text.replace(/(!?\[[^\]\n]*\])\(([^)\n]+)\)/g, (match, label, target) =>
      /\s/.test(target) && !/[<>"']/.test(target) ? `${label}(<${target}>)` : match);
    let result = '', cursor = 0;
    for (const match of line.matchAll(/(`+).*?\1/g)) {
      result += convert(line.slice(cursor, match.index)) + match[0];
      cursor = match.index + match[0].length;
    }
    return result + convert(line.slice(cursor));
  }).join('\n');
}

function plain(tokens) {
  return tokens.flatMap(token => token.children ? token.children.filter(t => ['text', 'code_inline'].includes(t.type)).map(t => t.content) : []).join(' ').replace(/\s+/g, ' ').trim();
}

const articles = await Promise.all(files.map(async file => {
  const source = await readFile(file, 'utf8');
  const tokens = md.parse(normalizeMarkdown(source), {});
  const firstTitle = tokens.findIndex(t => t.type === 'heading_open' && t.tag === 'h1');
  const title = firstTitle >= 0 ? plain([tokens[firstTitle + 1]]) : path.basename(file, '.md');
  const paragraphs = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'paragraph_open') {
      const text = plain([tokens[i + 1]]);
      if (text) paragraphs.push(text);
    }
  }
  const text = `${plain(tokens)} ${tokens.filter(t => ['fence', 'code_block'].includes(t.type)).map(t => t.content).join(' ')}`.trim();
  const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { encoding: 'utf8' }).trim() || new Date().toISOString().slice(0, 10);
  const summary = paragraphs.join(' ') || text;
  return { path: file, href: file.replace(/\.md$/, '.html').split('/').map(encodeURIComponent).join('/'), title, category: file.split('/')[0], date, minutes: Math.max(1, Math.ceil(text.length / 450)), excerpt: summary.slice(0, 115) + (summary.length > 115 ? '…' : ''), text, tokens, firstTitle };
}));
articles.sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path, 'zh-CN'));

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp('site/assets', path.join(output, 'assets'), { recursive: true });
await cp('node_modules/highlight.js/styles/github.css', path.join(output, 'assets/highlight.css'));
// Retain local article assets when present.
for (const dir of ['images']) await cp(dir, path.join(output, dir), { recursive: true });
async function write(file, content) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
}
await write('index.html', home(projects, articles));
await write('blog/index.html', blogPage(articles));
await write('projects/index.html', projectsPage(projects));
await write('assets/search.json', JSON.stringify(articles.map(({ path, text }) => ({ path, text }))));

for (const a of articles) {
  const headings = [];
  const seen = new Map();
  const tokens = a.tokens.filter((_, i) => a.firstTitle < 0 || i < a.firstTitle || i > a.firstTitle + 2);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'heading_open') {
      const text = plain([tokens[i + 1]]);
      // Stable heading IDs support the table of contents and direct section links.
      const slug = text.trim().toLowerCase().replace(/[^\w\-\u4e00-\u9fff]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'section';
      const count = (seen.get(slug) || 0) + 1;
      seen.set(slug, count);
      const id = count === 1 ? slug : `${slug}-${count}`;
      token.attrSet('id', id);
      if (['h2', 'h3'].includes(token.tag)) headings.push({ id, text, level: Number(token.tag[1]) });
    }
    for (const child of token.children || []) {
      if (child.type === 'link_open') {
        const href = child.attrGet('href');
        if (/^https?:\/\//.test(href)) child.attrSet('rel', 'noopener noreferrer');
        else if (/\.md(?:#.*)?$/.test(href)) child.attrSet('href', href.replace(/\.md(?=#|$)/, '.html'));
      }
      if (child.type === 'image') { child.attrSet('loading', 'lazy'); child.attrSet('decoding', 'async'); }
    }
  }
  const content = md.renderer.render(tokens, md.options, {});
  await write(a.path.replace(/\.md$/, '.html'), articlePage(a, content, headings, articles.filter(b => b.category === a.category && b.path !== a.path).slice(0, 2)));
}
await write('404.html', layout({ title: '页面未找到', body: `<main id="main" class="wrap page-intro not-found"><h1>这一页，暂时走丢了。</h1><p>可以回到博客，继续寻找感兴趣的内容。</p><a class="button primary" href="${url('blog/')}">浏览博客</a></main>` }));
await write('.nojekyll', '');
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'blog/', 'projects/', ...articles.map(a => a.href)].map(href => `<url><loc>https://qingeneral.github.io${url(href)}</loc></url>`).join('')}</urlset>`);
console.log(`已生成首页、项目页、博客列表和 ${articles.length} 篇文章 → dist/`);
