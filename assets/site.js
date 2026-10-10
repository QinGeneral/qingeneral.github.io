const topButton = document.querySelector('.back-top');
const progress = document.querySelector('.reading-progress');
const article = document.querySelector('.prose');
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
