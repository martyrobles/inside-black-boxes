import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./media";
import type { DraftNotes } from "./notes";
import type { CatalogEntry, Speaker, Turn } from "./types";

const FRICTION_KINDS = [
  {
    id: "confrontation",
    label: "Confrontation",
    definition: "A justice keeps pressing an advocate, and does not take the first answer.",
  },
  {
    id: "revelation",
    label: "Revelation",
    definition: "A quiet question draws a concession that could decide the case.",
  },
  {
    id: "collision",
    label: "Collision",
    definition: "Two readings of the law meet, sometimes between the justices.",
  },
];

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleHtml(name: string): string {
  const split = name.split(/\s+v\.\s+/i);
  if (split.length !== 2) return esc(name);
  return `${esc(split[0])} v. <em>${esc(split[1])}</em>`;
}

function counselRows(counsel: string, speakers: Speaker[]): string {
  const lines = counsel
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [role, name] = line.split("|").map((part) => part.trim());
      if (!name) return "";
      return `<div><dt>${esc(role || "Counsel")}</dt><dd>${esc(name)}</dd></div>`;
    })
    .filter(Boolean);
  if (lines.length > 0) return lines.join("\n            ");
  return speakers
    .filter((speaker) => speaker.kind === "advocate")
    .map(
      (speaker) =>
        `<div><dt>${esc(speaker.role || "Counsel")}</dt><dd>${esc(speaker.label)}</dd></div>`,
    )
    .join("\n            ");
}

export function renderListenPage(options: {
  slug: string;
  name: string;
  docket: string;
  argued: string;
  status: string;
  counsel: string;
  speakers: Speaker[];
  audioPage: string;
  transcriptUrl: string;
}): string {
  const description = `Listen to ${options.name}, No. ${options.docket}. Official argument audio, the Court's transcript, a jump to each justice, and the moments of friction.`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Black Boxes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta
      name="description"
      content="${esc(description)}"
    />
    <title>${esc(options.name)} — Inside Black Boxes</title>
    <link rel="icon" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/src/styles/main.css" />
    <link rel="stylesheet" href="/src/styles/listen.css" />
  </head>
  <body class="page-listen">
    <div id="site-header"></div>

    <main class="listen">
      <header class="listen-hero">
        <div class="container">
          <p class="listen-kicker">Oral argument · ${esc(options.argued || "Date on the transcript")}</p>
          <h1>${titleHtml(options.name)}</h1>
          <p class="listen-question" id="listen-question"></p>
          <dl class="listen-facts">
            <div><dt>Docket</dt><dd>No. ${esc(options.docket)}</dd></div>
            <div><dt>Argued</dt><dd>${esc(options.argued || "See the transcript")}</dd></div>
            <div><dt>Opinion</dt><dd>${esc(options.status || "No opinion yet")}</dd></div>
            ${counselRows(options.counsel, options.speakers)}
          </dl>
        </div>
      </header>

      <div class="container listen-body">
        <div class="bench-bar">
          <div class="bench-label-row">
            <p class="bench-label" id="bench-label">The bench</p>
            <div class="bench-actions">
              <a class="friction-jump" id="friction-jump" href="#friction" hidden>Friction</a>
              <button type="button" class="sequence-btn" id="sequence-btn" hidden>Play in sequence</button>
            </div>
          </div>
          <div class="bench" id="bench" role="toolbar" aria-label="Jump to a speaker"></div>
        </div>

        <section class="friction" id="friction" aria-labelledby="friction-heading" hidden>
          <div class="friction-head">
            <div>
              <h2 id="friction-heading">Friction</h2>
              <p class="friction-lede" id="friction-lede"></p>
            </div>
            <span class="draft-pill">Draft</span>
          </div>
          <div class="friction-kinds" id="friction-kinds" role="toolbar" aria-label="Kinds of friction"></div>
          <p class="friction-definition" id="friction-definition" hidden></p>
          <div class="friction-row" id="friction-row"></div>
        </section>

        <div class="listen-grid">
          <section class="transcript-panel" aria-labelledby="transcript-heading">
            <div class="panel-head">
              <h2 id="transcript-heading">Transcript</h2>
              <button type="button" class="follow-btn" id="follow-btn" hidden>Follow the audio</button>
            </div>
            <p class="now-line" id="now-line" hidden></p>
            <div id="transcript" class="transcript"></div>
          </section>

          <aside class="highlight-panel" aria-labelledby="highlight-heading">
            <section class="listen-summary" aria-labelledby="summary-heading">
              <div class="listen-summary-top">
                <h2 id="summary-heading">Summary</h2>
                <span class="draft-pill">Draft</span>
              </div>
              <p id="listen-summary"></p>
              <p class="listen-sources">
                <a id="source-audio" href="${esc(options.audioPage)}">Court recording</a>
                <a id="source-transcript" href="${esc(options.transcriptUrl)}">Court transcript</a>
              </p>
            </section>
            <div class="panel-head">
              <h2 id="highlight-heading">Highlights</h2>
              <span class="draft-pill">Draft</span>
            </div>
            <div id="highlights" class="highlights"></div>
            <p class="listen-note">
              Draft notes for your review. The recording and the transcript words are the Supreme Court’s.
              Turn times were aligned to that recording. Not legal advice. AI tools assisted with the timing and these notes.
            </p>
          </aside>
        </div>
      </div>
    </main>

    <div class="player-dock" id="player-dock">
      <div class="container dock-inner">
        <div class="dock-top">
          <button type="button" class="play-btn" id="play-btn" aria-label="Play argument">
            <span id="play-icon" aria-hidden="true">▶</span>
          </button>
          <div class="dock-meta">
            <p class="dock-title">${esc(options.name)}</p>
            <p class="dock-time"><span id="time-now">0:00</span> <span class="dock-dur">/ <span id="time-dur">0:00</span></span></p>
          </div>
        </div>
        <label class="scrub-label">
          <span class="visually-hidden">Seek</span>
          <input id="scrub" type="range" min="0" max="1" value="0" step="0.1" />
        </label>
        <div class="speed-row">
          <span class="speed-label" id="speed-label">Speed</span>
          <div class="speed-options" id="speed-options" role="radiogroup" aria-labelledby="speed-label"></div>
        </div>
        <p class="player-error" id="player-error" hidden>The Court’s recording didn’t load. Open it from the link above and try the player again.</p>
      </div>
    </div>

    <div id="site-footer"></div>

    <script type="module">
      import { initLayout } from '/src/js/layout.js';
      import { initListener } from '/src/js/listen.js';
      import argument from '/src/data/${options.slug}.json';

      initLayout();
      initListener(argument);
    </script>
  </body>
</html>
`;
}

export async function publishArgument(options: {
  slug: string;
  name: string;
  docket: string;
  arguedDisplay: string;
  arguedIso: string;
  status: string;
  counsel: string;
  duration: number;
  audioUrl: string;
  audioPage: string;
  transcriptUrl: string;
  question: string;
  summary: string;
  speakers: Speaker[];
  turns: Turn[];
  notes: DraftNotes;
}): Promise<{ href: string }> {
  const website = path.join(repoRoot(), "website");
  const byId = new Map(options.turns.map((turn) => [turn.id, turn]));
  const payload = {
    slug: options.slug,
    name: options.name,
    docket: options.docket,
    argued: options.arguedIso || options.arguedDisplay,
    duration: options.duration,
    audioUrl: options.audioUrl,
    audioPage: options.audioPage,
    transcriptUrl: options.transcriptUrl,
    question: options.notes.question.trim(),
    summary: options.notes.summary.trim(),
    summaryStatus: "draft",
    speakers: options.speakers,
    turns: options.turns,
    highlights: options.notes.highlights.map((highlight, index) => {
      const turn = byId.get(highlight.turnId);
      return {
        id: `h${index + 1}`,
        speaker: turn?.speaker ?? "",
        turnId: highlight.turnId,
        start: turn?.start ?? 0,
        title: highlight.title,
        note: highlight.note,
        quote: highlight.quote,
        draft: true,
      };
    }),
    friction: {
      title: "Friction",
      lede: "Where a legal theory meets resistance it cannot easily overcome.",
      kinds: FRICTION_KINDS,
      moments: options.notes.moments.map((moment, index) => {
        const start = byId.get(moment.startTurn);
        const end = byId.get(moment.endTurn);
        return {
          id: `f${index + 1}`,
          kind: moment.kind,
          start: start?.start ?? 0,
          end: end?.end ?? start?.end ?? 0,
          title: moment.title,
          who: moment.who,
          quote: moment.quote,
          note: moment.note,
          draft: true,
        };
      }),
    },
  };

  await writeFile(
    path.join(website, "src", "data", `${options.slug}.json`),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  await writeFile(
    path.join(website, "arguments", `${options.slug}.html`),
    renderListenPage({
      slug: options.slug,
      name: options.name,
      docket: options.docket,
      argued: options.arguedDisplay,
      status: options.status,
      counsel: options.counsel,
      speakers: options.speakers,
      audioPage: options.audioPage,
      transcriptUrl: options.transcriptUrl,
    }),
  );

  const catalogPath = path.join(website, "src", "data", "arguments-catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as CatalogEntry[];
  const entry: CatalogEntry = {
    slug: options.slug,
    name: options.name,
    docket: options.docket,
    argued: options.arguedDisplay || options.arguedIso,
    status: options.status || "No opinion yet",
    href: `/arguments/${options.slug}.html`,
    friction: true,
    summary: options.notes.question.trim(),
  };
  const existing = catalog.findIndex((item) => item.slug === options.slug);
  if (existing >= 0) catalog[existing] = entry;
  else catalog.unshift(entry);
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

  return { href: entry.href };
}
