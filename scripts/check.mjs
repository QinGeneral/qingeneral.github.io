import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}
const pages = (await walk(root)).filter(file => file.endsWith('.html'));
const failures = [];
let checked = 0;
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: 应有且仅有一个 h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: id 必须唯一`);
  const fileUrl = new URL(`https://local/${path.relative(root, file).split('/').map(encodeURIComponent).join('/')}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = new URL(match[1].replace(/&amp;/g, '&'), fileUrl);
    if (target.origin !== fileUrl.origin) continue;
    checked++;
    let destination = path.join(root, decodeURIComponent(target.pathname));
    try {
      if ((await stat(destination)).isDirectory()) destination = path.join(destination, 'index.html');
      await stat(destination);
      if (target.hash && destination.endsWith('.html')) {
        const destinationHtml = destination === file ? html : await readFile(destination, 'utf8');
        const fragment = decodeURIComponent(target.hash.slice(1));
        if (!destinationHtml.includes(`id="${fragment}"`)) throw new Error(`missing fragment ${fragment}`);
      }
    } catch {
      failures.push(`${path.relative(root, file)} → ${match[1]}`);
    }
  }
}
const search = JSON.parse(await readFile(path.join(root, 'assets/search.json'), 'utf8'));
const projectPages = (await walk(path.resolve(import.meta.dirname, '../site/projects'))).filter(file => file.endsWith('.html'));
assert.equal(pages.length, search.length + projectPages.length + 4, '每篇文章和独立项目都应生成页面');
assert(search.every(a => !/^(草稿|plan|task|写作风格)/.test(a.path)), '草稿不能进入搜索索引');
assert(search.some(a => a.text.includes('invokestatic')), '全文搜索需包含代码正文');
assert.equal(failures.length, 0, `站内链接或锚点失效：\n${failures.join('\n')}`);
console.log(`检查通过：${pages.length} 个页面，${checked} 个站内链接/资源/锚点，${search.length} 篇文章。`);
