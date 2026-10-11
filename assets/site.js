const topButton = document.querySelector('.back-top');
const progress = document.querySelector('.reading-progress');
const article = document.querySelector('.prose');
const articleBack = document.querySelector('.article-back');
if (articleBack) {
  const returnTo = new URLSearchParams(location.search).get('returnTo');
  if (returnTo) {
    try {
      const target = new URL(returnTo, location.origin);
      const blogPath = new URL(articleBack.href).pathname;
      // A shared URL must never turn this control into an external redirect.
      if (target.origin === location.origin && target.pathname === blogPath) {
        articleBack.href = `${target.pathname}${target.search}`;
        articleBack.lastChild.textContent = target.searchParams.get('q') ? ' 返回搜索结果' : ' 返回文章列表';
      }
    } catch {}
  }
}
const tocDetails = document.querySelector('.toc details');
if (tocDetails) {
  const compact = matchMedia('(max-width:760px)');
  tocDetails.open = !compact.matches;
  compact.addEventListener('change', event => { tocDetails.open = !event.matches; });
}

async function copyCode(code) {
  let timeout;
  try {
    await Promise.race([
      navigator.clipboard.writeText(code.textContent),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('clipboard timeout')), 1500); }),
    ]);
    return true;
  } catch {
    const input = document.createElement('textarea');
    input.value = code.textContent;
    input.style.cssText = 'position:fixed;top:0;left:-9999px';
    document.body.append(input);
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    input.remove();
    return copied;
  } finally { clearTimeout(timeout); }
}
document.querySelectorAll('.prose pre').forEach((pre, index) => {
  const code = pre.querySelector('code');
  if (!code) return;
  const block = document.createElement('div'); block.className = 'code-block';
  const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
  const status = document.createElement('span'); status.setAttribute('role', 'status');
  const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-code'; button.textContent = '复制代码';
  button.setAttribute('aria-label', `复制第 ${index + 1} 个代码块`);
  toolbar.append(status, button); pre.before(block); block.append(toolbar, pre);
  let reset;
  button.addEventListener('click', async () => {
    clearTimeout(reset); button.disabled = true;
    const copied = await copyCode(code);
    status.textContent = copied ? '已复制' : '复制失败，请手动选取代码';
    button.disabled = false; button.focus({ preventScroll: true });
    reset = setTimeout(() => { status.textContent = ''; }, 3000);
  });
});
let scheduled = false;
function onScroll() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    topButton.hidden = window.scrollY < 500;
    if (progress && article) {
      const start = article.offsetTop;
      const distance = article.offsetHeight - window.innerHeight;
      progress.style.width = `${Math.min(100, Math.max(0, (window.scrollY - start) / Math.max(1, distance) * 100))}%`;
    }
    scheduled = false;
  });
}
topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
const tocLinks = [...document.querySelectorAll('.toc-link')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const heading = entries.find(entry => entry.isIntersecting);
    if (!heading) return;
    tocLinks.forEach(link => {
      const selected = link.hash === `#${encodeURIComponent(heading.target.id)}` || decodeURIComponent(link.hash.slice(1)) === heading.target.id;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-10% 0px -65% 0px' });
  tocLinks.forEach(link => {
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (heading) observer.observe(heading);
  });
}
