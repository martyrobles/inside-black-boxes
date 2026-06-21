import { episodes, trackedCases } from '../data/site.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function renderFeaturedEpisode(container) {
  const episode = episodes.find((e) => e.featured) ?? episodes[0];
  if (!container || !episode) return;

  container.innerHTML = `
    <article class="featured-episode card-elevated">
      <div class="featured-meta">
        <span class="badge badge-gold">Featured Episode</span>
        <span class="badge">${episode.type}</span>
        ${episode.status === 'Draft' ? '<span class="badge badge-muted">In production</span>' : ''}
      </div>
      <h2 class="featured-title"><a href="${episode.href}">${episode.title}</a></h2>
      <p class="featured-subtitle">${episode.subtitle}</p>
      <dl class="featured-stats">
        <div><dt>Docket</dt><dd>No. ${episode.docket}</dd></div>
        <div><dt>Decided</dt><dd>${formatDate(episode.date)}</dd></div>
        <div><dt>Vote</dt><dd>${episode.vote}</dd></div>
        <div><dt>Runtime</dt><dd>${episode.runtime}</dd></div>
      </dl>
      <p class="featured-summary">${episode.summary}</p>
      <div class="tag-row">
        ${episode.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="featured-actions">
        <a class="btn btn-primary" href="${episode.href}">Read episode notes</a>
        <a class="btn btn-secondary" href="/episodes.html">View all episodes</a>
      </div>
    </article>
  `;
}

export function renderEpisodeGrid(container, { limit } = {}) {
  const list = limit ? episodes.slice(0, limit) : episodes;
  if (!container) return;

  container.innerHTML = list
    .map(
      (ep) => `
      <article class="episode-card card">
        <div class="episode-card-top">
          <span class="badge">${ep.type}</span>
          <time datetime="${ep.date}">${formatDate(ep.date)}</time>
        </div>
        <h3><a href="${ep.href}">${ep.title}</a></h3>
        <p>${ep.summary}</p>
        <div class="episode-card-meta">
          <span>No. ${ep.docket}</span>
          <span>${ep.vote}</span>
          <span>${ep.runtime}</span>
        </div>
        <a class="text-link" href="${ep.href}">Episode notes &rarr;</a>
      </article>
    `
    )
    .join('');
}

export function renderTrackedCases(container, { limit } = {}) {
  if (!container) return;

  const list = limit ? trackedCases.slice(0, limit) : trackedCases;

  container.innerHTML = list
    .map(
      (c) => `
      <article class="case-card card" data-priority="${c.priority}">
        <div class="case-card-header">
          <span class="badge badge-priority">${c.priority}</span>
          <span class="badge badge-status">${c.status}</span>
        </div>
        <p class="case-topic">${c.topic}</p>
        <h3>${c.name}</h3>
        <p class="case-docket">No. ${c.docket}</p>
        <p class="case-desc">${c.description}</p>
        <blockquote class="case-qp">
          <span class="case-qp-label">Question presented</span>
          ${c.question}
        </blockquote>
        <div class="case-footer">
          <span>Argued ${c.argued}</span>
          <a class="text-link" href="${c.scotusblog}" target="_blank" rel="noopener noreferrer">SCOTUSblog &rarr;</a>
        </div>
      </article>
    `
    )
    .join('');
}
