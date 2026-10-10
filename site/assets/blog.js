(() => {
  const search = document.querySelector('#article-search');
  const form = document.querySelector('.search-form');
  const sort = document.querySelector('#article-sort');
  const results = document.querySelector('#article-results');
  const rows = [...results.querySelectorAll('.article-row')];
  const categoryLinks = [...document.querySelectorAll('.category-link')];
  const clear = document.querySelector('#clear-search');
  const previous = document.querySelector('#previous-page');
  const next = document.querySelector('#next-page');
  const perPage = 8;
  let category = '', page = 1, timer;
  let fullText = new Map();
  const initialOrder = new Map(rows.map((row, i) => [row, i]));
  const cachedText = new Map(rows.map(row => [row, row.textContent.toLocaleLowerCase()]));

  function updateUrl() {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search.value.trim()) params.set('q', search.value.trim());
    if (sort.value !== 'newest') params.set('sort', sort.value);
    if (page > 1) params.set('page', page);
    const suffix = params.size ? `?${params}` : '';
    history.replaceState(null, '', `${location.pathname}${suffix}`);
  }
  function render(saveUrl = true) {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matching = rows.filter(row => (!category || row.dataset.category === category) && words.every(word => `${cachedText.get(row)} ${fullText.get(row.dataset.path) || ''}`.includes(word)));
    matching.sort((a, b) => sort.value === 'title' ? a.querySelector('h2').textContent.localeCompare(b.querySelector('h2').textContent, 'zh-CN') : (initialOrder.get(a) - initialOrder.get(b)) * (sort.value === 'oldest' ? -1 : 1));
    const pages = Math.max(1, Math.ceil(matching.length / perPage));
    page = Math.max(1, Math.min(page, pages));
    rows.forEach(row => { row.hidden = true; });
    matching.forEach((row, index) => {
      results.append(row);
      row.hidden = index < (page - 1) * perPage || index >= page * perPage;
    });
    categoryLinks.forEach(link => {
      const selected = link.dataset.category === category;
      link.classList.toggle('selected', selected);
      if (selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    if (categoryLinks.some(link => link.closest('details') && link.dataset.category === category)) document.querySelector('.more-categories').open = true;
    const label = document.querySelector('#result-label');
    label.replaceChildren(document.createTextNode(words.length ? '搜索结果 ' : `${category || '全部文章'} `));
    const count = document.createElement('span'); count.textContent = `${matching.length} 篇`; label.append(count);
    document.querySelector('#empty-state').hidden = matching.length !== 0;
    document.querySelector('#pagination').hidden = pages <= 1;
    document.querySelector('#page-label').textContent = `${page} / ${pages}`;
    previous.disabled = page === 1; next.disabled = page === pages;
    clear.hidden = !search.value;
    if (saveUrl) updateUrl();
  }
  function readUrl() {
    const params = new URLSearchParams(location.search);
    const requested = params.get('category') || '';
    category = categoryLinks.some(link => link.dataset.category === requested) ? requested : '';
    search.value = params.get('q') || '';
    sort.value = ['newest', 'oldest', 'title'].includes(params.get('sort')) ? params.get('sort') : 'newest';
    page = Math.max(1, parseInt(params.get('page'), 10) || 1);
    render(false);
  }
  categoryLinks.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); category = link.dataset.category; page = 1; render();
  }));
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { page = 1; render(); }, 120); });
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); page = 1; render(); });
  sort.addEventListener('change', () => { page = 1; render(); });
  clear.addEventListener('click', () => { search.value = ''; page = 1; render(); search.focus(); });
  document.querySelector('#reset-filters').addEventListener('click', () => { category = ''; search.value = ''; page = 1; sort.value = 'newest'; render(); });
  for (const [button, direction] of [[previous, -1], [next, 1]]) button.addEventListener('click', () => {
    page += direction; render(); document.querySelector('.list-toolbar').scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  window.addEventListener('popstate', readUrl);
  readUrl();
  fetch(new URL('search.json', document.currentScript.src)).then(response => {
    if (!response.ok) throw new Error('search index unavailable');
    return response.json();
  }).then(index => { fullText = new Map(index.map(item => [item.path, item.text.toLocaleLowerCase()])); render(false); }).catch(() => {
    search.placeholder = '搜索文章标题或摘要…';
  });
})();
