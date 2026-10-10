import { episodes, featuredArguments, trackedCases } from '../data/site.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function renderFeaturedArguments(container, { kicker = 'In the chamber' } = {}) {
  if (!container) return;

  container.innerHTML = featuredArguments
    .map(
      (item) => `
      <article class="chamber-card">
        <span class="section-label">${kicker}</span>
        <h2>${item.name}</h2>
        <p class="chamber-meta">No. ${item.docket} · Argued ${item.argued} · ${item.status}</p>
        <p>${item.summary}</p>
        <div class="chamber-actions">
          <a class="btn btn-primary" href="${item.href}">Listen</a>
          ${
            item.friction
              ? `<a class="btn chamber-friction" href="${item.href}#friction">Friction</a>`
              : ''
          }
        </div>
      </article>`
    )
    .join('');
}

export function renderFeaturedEpisode(container) {
  const episode = episodes.find((e) => e.featured) ?? episodes[0];
  if (!container || !episode) return;

  const kicker = episode.featured ? 'Featured episode' : 'Earlier walkthrough';

  container.innerHTML = `
    <article class="featured-episode card-elevated">
      <div class="featured-meta">
        <span class="badge badge-gold">${kicker}</span>
        <span class="badge">${episode.type}</span>
        ${episode.status === 'Draft' ? '<span class="badge badge-muted">Draft</span>' : ''}
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

const caseStages = [
  { id: 'upcoming', label: 'Next argument' },
  { id: 'awaiting', label: 'Argued, awaiting decision' },
  { id: 'decided', label: 'Decided' },
];

function caseQuote(item) {
  if (item.stage === 'decided') return { label: 'Holding', text: item.holding };
  return { label: 'What the Court will hear', text: item.question };
}

function caseWhen(item) {
  if (item.stage === 'decided') return `${item.disposition} · ${item.decided}`;
  if (item.stage === 'awaiting') return `Argued ${item.argued}`;
  return `Argument ${item.argument}`;
}

function caseLink(item) {
  if (item.opinionUrl) return { href: item.opinionUrl, label: 'Slip opinion' };
  if (item.docketUrl) return { href: item.docketUrl, label: 'Court docket' };
  if (item.scotusblog) return { href: item.scotusblog, label: 'SCOTUSblog' };
  return null;
}

function renderCaseCard(item) {
  const quote = caseQuote(item);
  const link = caseLink(item);
  const badgeClass = item.stage === 'decided' ? 'badge-decided' : 'badge-upcoming';

  return `
    <article class="case-card card" data-stage="${item.stage}">
      <div class="case-card-header">
        <span class="badge ${badgeClass}">${item.status}</span>
      </div>
      <p class="case-topic">${item.topic}</p>
      <h3>${item.name}</h3>
      <p class="case-docket">No. ${item.docket}</p>
      <p class="case-desc">${item.description}</p>
      <blockquote class="case-qp">
        <span class="case-qp-label">${quote.label}</span>
        ${quote.text}
      </blockquote>
      <div class="case-footer">
        <span>${caseWhen(item)}</span>
        ${
          link
            ? `<a class="text-link" href="${link.href}" target="_blank" rel="noopener noreferrer">${link.label} &rarr;</a>`
            : ''
        }
      </div>
    </article>
  `;
}

export function renderTrackedCases(container, { limit } = {}) {
  if (!container) return;

  const list = limit ? trackedCases.slice(0, limit) : trackedCases;
  container.innerHTML = caseStages
    .map((stage) => {
      const items = list.filter((item) => item.stage === stage.id);
      if (!items.length) return '';
      return `
        <div class="case-group">
          <p class="section-label">${stage.label}</p>
        </div>
        ${items.map(renderCaseCard).join('')}
      `;
    })
    .join('');
}
