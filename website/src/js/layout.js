import { site } from '../data/site.js';

const navLinks = [
  { href: '/index.html', label: 'Home', match: (path) => path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('inside-black-boxes/website') },
  { href: '/episodes.html', label: 'Episodes', match: (path) => path.includes('episodes.html') || path.includes('/episodes/') },
  { href: '/about.html', label: 'About', match: (path) => path.includes('about.html') },
];

function isActive(link) {
  const path = window.location.pathname;
  return link.match(path);
}

export function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  header.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="logo" href="/index.html" aria-label="${site.name} home">
          <span class="logo-mark" aria-hidden="true"></span>
          <span class="logo-text">
            <span class="logo-name">${site.name}</span>
            <span class="logo-tagline">Supreme Court · Immigration · Admin Law · AI</span>
          </span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <nav id="site-nav" class="site-nav" aria-label="Primary">
          ${navLinks
            .map(
              (link) =>
                `<a href="${link.href}" class="nav-link${isActive(link) ? ' is-active' : ''}">${link.label}</a>`
            )
            .join('')}
          <a class="btn btn-primary btn-sm nav-cta" href="/episodes.html#tracked">Cases Tracked</a>
        </nav>
      </div>
    </header>
  `;

  const toggle = header.querySelector('.nav-toggle');
  const nav = header.querySelector('.site-nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

export function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  const year = new Date().getFullYear();
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <p class="footer-logo">${site.name}</p>
          <p class="footer-desc">${site.description}</p>
        </div>
        <div class="footer-links">
          <p class="footer-heading">Explore</p>
          <a href="/episodes.html">Episode archive</a>
          <a href="/episodes.html#tracked">Cases tracked</a>
          <a href="/about.html">About the host</a>
        </div>
        <div class="footer-links">
          <p class="footer-heading">Subscribe</p>
          <a href="#" aria-disabled="true">Apple Podcasts <span class="soon">(soon)</span></a>
          <a href="#" aria-disabled="true">Spotify <span class="soon">(soon)</span></a>
          <a href="#" aria-disabled="true">LinkedIn <span class="soon">(soon)</span></a>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>&copy; ${year} ${site.name}. All rights reserved.</p>
        <p class="footer-disclaimer">Not legal advice. Discusses public court decisions for educational purposes.</p>
      </div>
    </footer>
  `;
}

export function initLayout() {
  renderHeader();
  renderFooter();
}
