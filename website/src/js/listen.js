import defaultArgument from '../data/johnson.json';

const FRICTION_KINDS = [
  {
    id: 'confrontation',
    label: 'Confrontation',
    definition: 'A justice keeps pressing an advocate, and does not take the first answer.',
  },
  {
    id: 'revelation',
    label: 'Revelation',
    definition: 'A quiet question draws a concession that could decide the case.',
  },
  {
    id: 'collision',
    label: 'Collision',
    definition: 'Two readings of the law meet, sometimes between the justices.',
  },
];

const RATES = [1, 1.25, 1.5, 1.75, 2, 2.5];
const RATE_KEY = 'ibb-playback-rate';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function storedRate() {
  try {
    const value = Number(localStorage.getItem(RATE_KEY));
    return RATES.includes(value) ? value : 1;
  } catch {
    return 1;
  }
}

function rememberRate(rate) {
  try {
    localStorage.setItem(RATE_KEY, String(rate));
  } catch {
    /* private mode */
  }
}

export function initListener(argument = defaultArgument) {
  const speakers = new Map(argument.speakers.map((speaker) => [speaker.id, speaker]));
  const audio = new Audio(argument.audioUrl);
  audio.id = 'argument-audio';
  audio.preload = 'metadata';
  audio.hidden = true;
  document.body.appendChild(audio);

  const playBtn = document.getElementById('play-btn');
  const playIcon = document.getElementById('play-icon');
  const timeNow = document.getElementById('time-now');
  const timeDur = document.getElementById('time-dur');
  const scrub = document.getElementById('scrub');
  const transcript = document.getElementById('transcript');
  const bench = document.getElementById('bench');
  const sequenceBtn = document.getElementById('sequence-btn');
  const followBtn = document.getElementById('follow-btn');
  const nowLine = document.getElementById('now-line');
  const highlights = document.getElementById('highlights');
  const speedOptions = document.getElementById('speed-options');
  const errorLine = document.getElementById('player-error');

  document.getElementById('listen-question').textContent = argument.question;
  const dockTitle = document.querySelector('.dock-title');
  if (dockTitle) dockTitle.textContent = argument.name;
  document.getElementById('listen-summary').textContent = argument.summary;
  document.getElementById('source-audio').href = argument.audioPage;
  document.getElementById('source-transcript').href = argument.transcriptUrl;

  let rate = storedRate();
  let filter = null;
  let sequence = false;
  let follow = true;
  let scrollingFromCode = false;
  let scrubbing = false;
  let activeId = null;

  const turns = argument.turns.filter((turn) => Number.isFinite(turn.start));
  const turnButtons = new Map();

  function applyRate() {
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
    for (const button of speedOptions.querySelectorAll('.speed-btn')) {
      const on = Number(button.dataset.rate) === rate;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-checked', String(on));
    }
  }

  function speakerLabel(id) {
    return speakers.get(id)?.label ?? id;
  }

  function turnAt(time) {
    let found = turns[0];
    for (const turn of turns) {
      if (turn.start <= time + 0.05) found = turn;
      else break;
    }
    return found;
  }

  function visibleTurns() {
    return filter ? turns.filter((turn) => turn.speaker === filter) : turns;
  }

  function renderSpeed() {
    speedOptions.innerHTML = RATES.map(
      (value) =>
        `<button type="button" class="speed-btn" role="radio" data-rate="${value}" aria-checked="false">${value}×</button>`
    ).join('');
    speedOptions.addEventListener('click', (event) => {
      const button = event.target.closest('.speed-btn');
      if (!button) return;
      rate = Number(button.dataset.rate);
      rememberRate(rate);
      applyRate();
    });
    applyRate();
  }

  function renderBench() {
    const counts = new Map();
    for (const turn of turns) counts.set(turn.speaker, (counts.get(turn.speaker) ?? 0) + 1);

    const chip = (id, label) => {
      const count = counts.get(id) ?? 0;
      return `<button type="button" class="bench-chip" data-speaker="${id}" aria-pressed="false">${label}<span class="chip-count">${count}</span></button>`;
    };

    const justices = argument.speakers.filter((speaker) => speaker.kind === 'justice');
    const advocates = argument.speakers.filter((speaker) => speaker.kind === 'advocate');
    bench.innerHTML = `
      <button type="button" class="bench-chip is-active" data-speaker="" aria-pressed="true">All</button>
      ${justices.map((speaker) => chip(speaker.id, speaker.name)).join('')}
      <span class="bench-gap" aria-hidden="true"></span>
      ${advocates.map((speaker) => chip(speaker.id, speaker.name)).join('')}
    `;
    bench.addEventListener('click', (event) => {
      const button = event.target.closest('.bench-chip');
      if (!button) return;
      filter = button.dataset.speaker || null;
      sequence = false;
      for (const chipButton of bench.querySelectorAll('.bench-chip')) {
        const on = chipButton === button;
        chipButton.classList.toggle('is-active', on);
        chipButton.setAttribute('aria-pressed', String(on));
      }
      applyFilter();
    });
  }

  function renderTranscript() {
    transcript.innerHTML = turns
      .map(
        (turn) => `
        <button type="button" class="turn" id="${turn.id}" data-start="${turn.start}" data-speaker="${turn.speaker}">
          <span class="turn-meta">
            <span class="turn-who">${escapeHtml(speakerLabel(turn.speaker))}</span>
            <span class="turn-time">${formatTime(turn.start)}</span>
          </span>
          <span class="turn-text">${escapeHtml(turn.text)}</span>
        </button>`
      )
      .join('');
    for (const button of transcript.querySelectorAll('.turn')) {
      turnButtons.set(button.id, button);
    }
    transcript.addEventListener('click', (event) => {
      const button = event.target.closest('.turn');
      if (!button) return;
      seek(Number(button.dataset.start), true);
    });
  }

  function showEveryone() {
    filter = null;
    sequence = false;
    for (const chipButton of bench.querySelectorAll('.bench-chip')) {
      const on = chipButton.dataset.speaker === '';
      chipButton.classList.toggle('is-active', on);
      chipButton.setAttribute('aria-pressed', String(on));
    }
    applyFilter();
  }

  function markFriction(time) {
    const row = document.getElementById('friction-row');
    if (!row) return;
    for (const card of row.querySelectorAll('.friction-card')) {
      const start = Number(card.dataset.start);
      const end = Number(card.dataset.end);
      const on = time >= start && time < end;
      card.classList.toggle('is-current', on);
      if (on) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    }
  }

  function renderFriction() {
    const data = argument.friction;
    const section = document.getElementById('friction');
    const kinds = document.getElementById('friction-kinds');
    const definition = document.getElementById('friction-definition');
    const row = document.getElementById('friction-row');
    if (!data?.moments?.length || !section || !kinds || !row) return;

    const frictionData = {
      title: data.title || 'Friction',
      lede: data.lede || 'Where a legal theory meets resistance it cannot easily overcome.',
      kinds: data.kinds?.length ? data.kinds : FRICTION_KINDS,
      moments: data.moments,
    };

    let frictionKind = 'all';
    section.hidden = false;
    document.getElementById('friction-jump').hidden = false;
    document.getElementById('friction-heading').textContent = frictionData.title;
    document.getElementById('friction-lede').textContent = frictionData.lede;

    const options = [{ id: 'all', label: 'All' }, ...frictionData.kinds];
    kinds.innerHTML = options
      .map(
        (kind) => `
        <button type="button" class="friction-kind${kind.id === 'all' ? ' is-active' : ''}" data-kind="${kind.id}" aria-pressed="${kind.id === 'all'}">${escapeHtml(kind.label)}</button>`
      )
      .join('');

    const kindLabel = (id) => frictionData.kinds.find((kind) => kind.id === id)?.label ?? id;

    function scrollToFriction() {
      const header = document.querySelector('.site-header');
      const bench = document.querySelector('.bench-bar');
      const offset = (header?.offsetHeight ?? 0) + (bench?.offsetHeight ?? 0) + 12;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    function paint() {
      const moments =
        frictionKind === 'all'
          ? frictionData.moments
          : frictionData.moments.filter((moment) => moment.kind === frictionKind);
      const selected = frictionData.kinds.find((kind) => kind.id === frictionKind);
      definition.hidden = !selected;
      if (selected) definition.textContent = selected.definition;
      row.innerHTML = moments
        .map(
          (moment) => `
          <button type="button" class="friction-card" data-start="${moment.start}" data-end="${moment.end}" data-id="${escapeHtml(moment.id)}">
            <span class="friction-kicker">${escapeHtml(kindLabel(moment.kind))} · ${formatTime(moment.start)}</span>
            <span class="friction-title">${escapeHtml(moment.title)}</span>
            <span class="friction-who">${escapeHtml(moment.who)}</span>
            <span class="friction-quote">${escapeHtml(moment.quote)}</span>
            <span class="friction-note">${escapeHtml(moment.note)}</span>
          </button>`
        )
        .join('');
      markFriction(audio.currentTime || 0);
    }

    kinds.addEventListener('click', (event) => {
      const button = event.target.closest('.friction-kind');
      if (!button) return;
      frictionKind = button.dataset.kind;
      for (const kindButton of kinds.querySelectorAll('.friction-kind')) {
        const on = kindButton === button;
        kindButton.classList.toggle('is-active', on);
        kindButton.setAttribute('aria-pressed', String(on));
      }
      paint();
    });

    row.addEventListener('click', (event) => {
      const button = event.target.closest('.friction-card');
      if (!button) return;
      showEveryone();
      seek(Number(button.dataset.start), true);
    });

    document.getElementById('friction-jump')?.addEventListener('click', (event) => {
      event.preventDefault();
      history.replaceState(null, '', '#friction');
      scrollToFriction();
    });

    paint();
    if (location.hash === '#friction') requestAnimationFrame(scrollToFriction);
  }

  function renderHighlights() {
    highlights.innerHTML = argument.highlights
      .map(
        (item) => `
        <button type="button" class="highlight" data-start="${item.start}">
          <span class="highlight-who">${escapeHtml(speakerLabel(item.speaker))}</span>
          <span class="highlight-title">${escapeHtml(item.title)}</span>
          <span class="highlight-quote">${escapeHtml(item.quote)}</span>
          <span class="highlight-note">${escapeHtml(item.note)}</span>
        </button>`
      )
      .join('');
    highlights.addEventListener('click', (event) => {
      const button = event.target.closest('.highlight');
      if (!button) return;
      seek(Number(button.dataset.start), true);
    });
  }

  function applyFilter() {
    const list = visibleTurns();
    for (const turn of turns) {
      const button = turnButtons.get(turn.id);
      if (button) button.hidden = filter != null && turn.speaker !== filter;
    }
    sequenceBtn.hidden = !filter;
    sequenceBtn.classList.toggle('is-active', sequence);
    sequenceBtn.setAttribute('aria-pressed', String(sequence));
    sequenceBtn.textContent = sequence ? 'Playing in sequence' : 'Play in sequence';
    const label = document.getElementById('bench-label');
    label.textContent = filter ? speakerLabel(filter) : 'The bench';
    document.getElementById('transcript-empty')?.remove();
    if (!list.length) {
      transcript.insertAdjacentHTML(
        'beforeend',
        '<p class="transcript-empty" id="transcript-empty">No turns from this speaker.</p>'
      );
    }
    updateNowLine();
  }

  function updateNowLine() {
    const turn = turnAt(audio.currentTime || 0);
    const hidden = filter && turn && turn.speaker !== filter;
    nowLine.hidden = !hidden;
    if (hidden && turn) nowLine.textContent = `Now speaking: ${speakerLabel(turn.speaker)}`;
  }

  function setActive(turn) {
    if (!turn || turn.id === activeId) return;
    const previous = turnButtons.get(activeId);
    previous?.classList.remove('is-current');
    previous?.removeAttribute('aria-current');
    activeId = turn.id;
    const button = turnButtons.get(turn.id);
    button?.classList.add('is-current');
    button?.setAttribute('aria-current', 'true');
    if (follow && button && !button.hidden) {
      scrollingFromCode = true;
      button.scrollIntoView({ block: 'center', behavior: 'smooth' });
      window.setTimeout(() => {
        scrollingFromCode = false;
      }, 500);
    }
  }

  function seek(seconds, andPlay) {
    const next = Math.min(Math.max(seconds, 0), Number.isFinite(audio.duration) ? audio.duration : argument.duration);
    audio.currentTime = next;
    applyRate();
    if (andPlay) audio.play().catch(() => {});
    paintTime(next);
    setActive(turnAt(next));
    markFriction(next);
  }

  function paintTime(seconds) {
    timeNow.textContent = formatTime(seconds);
    if (!scrubbing) scrub.value = String(seconds);
  }

  function nextInSequence(time) {
    return turns.find((turn) => turn.speaker === filter && turn.start > time + 0.2);
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  sequenceBtn.addEventListener('click', () => {
    sequence = !sequence;
    sequenceBtn.classList.toggle('is-active', sequence);
    sequenceBtn.setAttribute('aria-pressed', String(sequence));
    sequenceBtn.textContent = sequence ? 'Playing in sequence' : 'Play in sequence';
    if (sequence && filter) {
      const upcoming = turns.find((turn) => turn.speaker === filter && turn.start >= (audio.currentTime || 0) - 0.05);
      if (upcoming) seek(upcoming.start, true);
    }
  });

  followBtn.addEventListener('click', () => {
    follow = true;
    followBtn.hidden = true;
    const turn = turnAt(audio.currentTime || 0);
    activeId = null;
    setActive(turn);
  });

  window.addEventListener(
    'scroll',
    () => {
      if (scrollingFromCode) return;
      if (!follow) return;
      follow = false;
      followBtn.hidden = false;
    },
    { passive: true }
  );

  scrub.addEventListener('input', () => {
    scrubbing = true;
    timeNow.textContent = formatTime(Number(scrub.value));
  });
  scrub.addEventListener('change', () => {
    scrubbing = false;
    seek(Number(scrub.value), false);
  });

  audio.addEventListener('play', () => {
    playIcon.textContent = '❚❚';
    playBtn.setAttribute('aria-label', 'Pause argument');
    applyRate();
  });
  audio.addEventListener('pause', () => {
    playIcon.textContent = '▶';
    playBtn.setAttribute('aria-label', 'Play argument');
  });
  audio.addEventListener('timeupdate', () => {
    const time = audio.currentTime;
    paintTime(time);
    const turn = turnAt(time);
    setActive(turn);
    updateNowLine();
    markFriction(time);
    if (sequence && filter && turn && turn.speaker !== filter) {
      const upcoming = nextInSequence(time);
      if (upcoming) audio.currentTime = upcoming.start;
      else {
        sequence = false;
        audio.pause();
        applyFilter();
      }
    }
  });
  audio.addEventListener('loadedmetadata', () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : argument.duration;
    timeDur.textContent = formatTime(duration);
    scrub.max = String(duration);
    applyRate();
  });
  audio.addEventListener('error', () => {
    errorLine.hidden = false;
  });
  audio.addEventListener('ratechange', () => {
    if (Math.abs(audio.playbackRate - rate) > 0.01) applyRate();
  });

  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' || event.repeat) return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
    event.preventDefault();
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  renderSpeed();
  renderBench();
  renderTranscript();
  renderFriction();
  renderHighlights();
  timeDur.textContent = formatTime(argument.duration);
  scrub.max = String(argument.duration);
}
