import type { Speaker, Turn } from "./types";

const DROP_LINE =
  /^(Official - Subject to Final Review|Heritage Reporting Corporation|\d{1,3})$/;

const JUSTICE_ORDER = [
  "roberts",
  "thomas",
  "alito",
  "sotomayor",
  "kagan",
  "gorsuch",
  "kavanaugh",
  "barrett",
  "jackson",
];

const SPEAKER_RE =
  /((?:CHIEF JUSTICE|JUSTICE|GENERAL|MR\.|MS\.)\s+[A-Z][A-Z .'\-]+?)\s*:/g;

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function cleanTranscript(pages: string[]): string {
  const kept: string[] = [];
  for (const raw of pages) {
    for (const line of raw.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || DROP_LINE.test(s)) continue;
      kept.push(s);
    }
  }
  let text = kept.join(" ");
  text = text.replace(
    /(?:ORAL|REBUTTAL) ARGUMENT OF .+? ON BEHALF OF (?:THE )?(?:PETITIONERS|RESPONDENTS)(?: IN CASE NO\. \d{2}-\d+)?/gi,
    " ",
  );
  text = text.replace(/P R O C E E D I N G S/g, " ");
  text = text.replace(/\(\d{1,2}:\d{2} [ap]\.m\.\)/gi, " ");
  text = text.replace(/(\w)- ([a-z])/g, "$1-$2");
  text = text.replace(/\s+/g, " ").trim();
  const closing = /case was submitted\.?\)?/i.exec(text);
  if (closing) {
    text = text.slice(0, closing.index + closing[0].length);
  }
  return text;
}

export function arguedDate(pages: string[]): { display: string; iso: string } {
  const blob = pages.join("\n");
  const match = blob.match(/Date:\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return { display: "", iso: "" };
  const display = `${match[1]} ${match[2]}, ${match[3]}`;
  const month = MONTHS[match[1].toLowerCase()];
  const iso = month
    ? `${match[3]}-${month}-${match[2].padStart(2, "0")}`
    : display;
  return { display, iso };
}

function speakerId(label: string): string {
  const words = label
    .replace(/^(CHIEF JUSTICE|JUSTICE|GENERAL|MR\.|MS\.)\s+/, "")
    .trim()
    .split(/\s+/);
  return (words[words.length - 1] || "speaker").toLowerCase().replace(/[^a-z]/g, "");
}

function speakerName(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function speakerLabel(raw: string, id: string): string {
  if (raw.startsWith("CHIEF JUSTICE")) return "Chief Justice Roberts";
  if (raw.startsWith("JUSTICE")) return `Justice ${speakerName(id)}`;
  if (raw.startsWith("GENERAL")) return `General ${speakerName(id)}`;
  if (raw.startsWith("MS.")) return `Ms. ${speakerName(id)}`;
  return `Mr. ${speakerName(id)}`;
}

export function parseTurns(text: string): { turns: Turn[]; speakers: Speaker[] } {
  const matches = [...text.matchAll(SPEAKER_RE)];
  if (matches.length === 0) {
    throw new Error("No speaker labels found in the transcript.");
  }

  const turns: Turn[] = [];
  const seen = new Map<string, Speaker>();

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const raw = match[1].replace(/\s+/g, " ").trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    const body = text.slice(start, end).replace(/\s+/g, " ").trim();
    if (!body) continue;

    let id = speakerId(raw);
    if (!id) id = `speaker${turns.length + 1}`;
    if (!seen.has(id)) {
      const kind = raw.startsWith("JUSTICE") || raw.startsWith("CHIEF") ? "justice" : "advocate";
      seen.set(id, {
        id,
        name: speakerName(id),
        label: speakerLabel(raw, id),
        kind,
        role: kind === "advocate" ? "Counsel" : undefined,
      });
    }

    turns.push({
      id: `t${turns.length + 1}`,
      speaker: id,
      text: body,
    });
  }

  const speakers = [...seen.values()].sort((a, b) => {
    const ai = JUSTICE_ORDER.indexOf(a.id);
    const bi = JUSTICE_ORDER.indexOf(b.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return 0;
  });

  return { turns, speakers };
}
