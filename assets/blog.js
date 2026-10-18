(() => {
  // The filtered list owns its scroll restoration after async full-text loading.
  history.scrollRestoration = 'manual';
  const search = document.querySelector('#article-search');
  const form = document.querySelector('.search-form');
  const sort = document.querySelector('#article-sort');
  const results = document.querySelector('#article-results');
  const rows = [...results.querySelectorAll('.article-row[data-path]')];
  const summaries = [...results.querySelectorAll('[data-collection-summary]')];
  const originButtons = [...document.querySelectorAll('.origin-filter button')];
  const collapse = document.querySelector('#collapse-collections');
  const expanded = new Set();
  const categoryLinks = [...document.querySelectorAll('.category-link')];
  const clear = document.querySelector('#clear-search');
  const previous = document.querySelector('#previous-page');
  const next = document.querySelector('#next-page');
  const perPage = 8;
  let category = '', origin = '', page = 1, timer;
  let loadingIndex = true;
  let fullText = new Map();
  const initialOrder = new Map(rows.map((row, i) => [row, i]));
  const cachedText = new Map(rows.map(row => [row, row.textContent.toLocaleLowerCase()]));
  const articleLinks = rows.flatMap(row => [...row.querySelectorAll('a')]);
  const articleUrls = new Map(articleLinks.map(link => [link, link.href]));
  const scrollKey = () => `blog-scroll:${location.pathname}${location.search}`;

  function updateArticleLinks() {
    for (const link of articleLinks) {
      const target = new URL(articleUrls.get(link));
      target.searchParams.set('returnTo', `${location.pathname}${location.search}`);
      link.href = target.href;
    }
  }
  function restoreScroll() {
    try {
      const saved = sessionStorage.getItem(scrollKey());
      sessionStorage.removeItem(scrollKey());
      if (saved !== null && Number.isFinite(Number(saved))) requestAnimationFrame(() => window.scrollTo({ top: Number(saved), behavior: 'instant' }));
    } catch {}
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (origin) params.set('origin', origin);
    if (expanded.size) params.set('expanded', [...expanded].join(','));
    if (collapse && !collapse.checked) params.set('cards', 'all');
    if (search.value.trim()) params.set('q', search.value.trim());
    if (sort.value !== 'newest') params.set('sort', sort.value);
    if (page > 1) params.set('page', page);
    const suffix = params.size ? `?${params}` : '';
    history.replaceState(null, '', `${location.pathname}${suffix}`);
  }
  function render(saveUrl = true) {
    clearTimeout(timer); timer = null;
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matching = rows.filter(row => (!category || row.dataset.category === category) && (!origin || row.dataset.origin === origin) && words.every(word => `${cachedText.get(row)} ${fullText.get(row.dataset.path) || ''}`.includes(word)));
    matching.sort((a, b) => sort.value === 'title' ? a.querySelector('h2').textContent.localeCompare(b.querySelector('h2').textContent, 'zh-CN') : (initialOrder.get(a) - initialOrder.get(b)) * (sort.value === 'oldest' ? -1 : 1));
    const display = [];
    const inserted = new Set();
    for (const row of matching) {
      const key = row.dataset.collection;
      const summary = summaries.find(item => item.dataset.collectionSummary === key);
      if (key && summary && collapse?.checked && !words.length) {
        if (!inserted.has(key)) {
          inserted.add(key); display.push(summary);
          const button = summary.querySelector('.expand-collection');
          button.textContent = expanded.has(key) ? '收起 −' : '展开 +';
          button.setAttribute('aria-expanded', String(expanded.has(key)));
          summary.querySelector('.collection-count').textContent = `×${matching.filter(item => item.dataset.collection === key).length}`;
        }
        if (!expanded.has(key)) continue;
      }
      display.push(row);
    }
    const pages = Math.max(1, Math.ceil(display.length / perPage));
    // Full-text matches can arrive later; do not discard a requested page yet.
    if (!words.length || !loadingIndex) page = Math.max(1, Math.min(page, pages));
    results.querySelectorAll('.year-label').forEach(label => label.remove());
    [...rows, ...summaries].forEach(row => { row.hidden = true; });
    let previousYear = '';
    display.forEach((row, index) => {
      if (sort.value !== 'title' && index >= (page - 1) * perPage && index < page * perPage && row.dataset.year !== previousYear) {
        const year = document.createElement('div'); year.className = 'year-label'; year.textContent = row.dataset.year;
        results.append(year); previousYear = row.dataset.year;
      }
      results.append(row);
      row.hidden = index < (page - 1) * perPage || index >= page * perPage;
    });
    originButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.origin === origin)));
    categoryLinks.forEach(link => {
      const selected = link.dataset.category === category;
      link.classList.toggle('selected', selected);
      if (selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    if (categoryLinks.some(link => link.closest('details') && link.dataset.category === category)) document.querySelector('.more-categories').open = true;
    const label = document.querySelector('#result-label');
    const searching = words.length > 0 && loadingIndex;
    label.setAttribute('aria-busy', String(searching));
    label.replaceChildren(document.createTextNode(searching ? '正在搜索全文… ' : words.length ? '搜索结果 ' : `${category || '全部文章'} `));
    const count = document.createElement('span'); count.textContent = `${searching ? '暂找到 ' : ''}${matching.length} 篇`; label.append(count);
    document.querySelector('#empty-state').hidden = searching || matching.length !== 0;
    document.querySelector('#pagination').hidden = pages <= 1;
    document.querySelector('#page-label').textContent = `${page} / ${pages}`;
    previous.disabled = page === 1; next.disabled = page === pages;
    clear.hidden = !search.value;
    if (saveUrl) updateUrl();
    updateArticleLinks();
  }
  function readUrl() {
    const params = new URLSearchParams(location.search);
    const requested = params.get('category') || '';
    category = categoryLinks.some(link => link.dataset.category === requested) ? requested : '';
    search.value = params.get('q') || '';
    origin = ['translation', 'manual', 'ai'].includes(params.get('origin')) ? params.get('origin') : '';
    if (collapse) collapse.checked = params.get('cards') !== 'all';
    expanded.clear();
    for (const key of (params.get('expanded') || '').split(',')) {
      if (summaries.some(summary => summary.dataset.collectionSummary === key)) expanded.add(key);
    }
    sort.value = ['newest', 'oldest', 'title'].includes(params.get('sort')) ? params.get('sort') : 'newest';
    page = Math.max(1, parseInt(params.get('page'), 10) || 1);
    render(false);
  }
  categoryLinks.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); category = link.dataset.category; page = 1; render();
  }));
  originButtons.forEach(button => button.addEventListener('click', () => { origin = button.dataset.origin; page = 1; render(); }));
  collapse?.addEventListener('change', () => { page = 1; render(); });
  summaries.forEach(summary => summary.querySelector('.expand-collection').addEventListener('click', () => {
    const key = summary.dataset.collectionSummary;
    if (expanded.has(key)) expanded.delete(key); else expanded.add(key);
    render();
  }));
  search.addEventListener('input', () => { page = 1; clearTimeout(timer); timer = setTimeout(() => render(), 120); });
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); page = 1; render(); });
  sort.addEventListener('change', () => { page = 1; render(); });
  clear.addEventListener('click', () => { search.value = ''; page = 1; render(); search.focus(); });
  document.querySelector('#reset-filters').addEventListener('click', () => { category = ''; origin = ''; search.value = ''; page = 1; sort.value = 'newest'; render(); });
  for (const [button, direction] of [[previous, -1], [next, 1]]) button.addEventListener('click', () => {
    page += direction; render(); document.querySelector('.list-toolbar').scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  window.addEventListener('popstate', readUrl);
  results.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    const scrollPosition = window.scrollY;
    // Flush a recent keystroke before the browser follows the article link.
    if (timer) render();
    try { sessionStorage.setItem(scrollKey(), String(scrollPosition)); } catch {}
  });
  readUrl();
  fetch(new URL('search.json', document.currentScript.src)).then(response => {
    if (!response.ok) throw new Error('search index unavailable');
    return response.json();
  }).then(index => { fullText = new Map(index.map(item => [item.path, item.text.toLocaleLowerCase()])); loadingIndex = false; render(); restoreScroll(); }).catch(() => {
    loadingIndex = false;
    search.placeholder = '搜索文章标题或摘要…';
    render(); restoreScroll();
  });
})();
