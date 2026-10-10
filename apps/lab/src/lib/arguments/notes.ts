import type { Speaker, Turn } from "./types";

export type DraftNotes = {
  question: string;
  summary: string;
  highlights: {
    turnId: string;
    title: string;
    note: string;
    quote: string;
  }[];
  moments: {
    kind: "confrontation" | "revelation" | "collision";
    startTurn: string;
    endTurn: string;
    title: string;
    who: string;
    quote: string;
    note: string;
  }[];
};

const KINDS = ["confrontation", "revelation", "collision"] as const;

function fold(value: string): string {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function spanText(turns: Turn[], startId: string, endId: string): string {
  const start = turns.findIndex((turn) => turn.id === startId);
  const end = turns.findIndex((turn) => turn.id === endId);
  if (start < 0 || end < start) return "";
  return turns.slice(start, end + 1).map((turn) => turn.text).join(" ");
}

export function validateNotes(turns: Turn[], notes: DraftNotes): string[] {
  const problems: string[] = [];
  if (!notes.question?.trim()) problems.push("Missing question.");
  if (!notes.summary?.trim()) problems.push("Missing summary.");
  if (notes.highlights?.length !== 4) problems.push("Need exactly 4 highlights.");
  if (notes.moments?.length !== 6) problems.push("Need exactly 6 friction moments.");

  for (const kind of KINDS) {
    const count = notes.moments?.filter((moment) => moment.kind === kind).length ?? 0;
    if (count !== 2) problems.push(`Need 2 ${kind} moments, got ${count}.`);
  }

  for (const highlight of notes.highlights ?? []) {
    const turn = turns.find((item) => item.id === highlight.turnId);
    if (!turn) {
      problems.push(`Highlight ${highlight.title} uses an unknown turn.`);
      continue;
    }
    if (!fold(turn.text).includes(fold(highlight.quote || ""))) {
      problems.push(`Highlight quote is not in ${highlight.turnId}: ${highlight.quote}`);
    }
  }

  for (const moment of notes.moments ?? []) {
    if (!KINDS.includes(moment.kind)) problems.push(`Unknown kind ${moment.kind}.`);
    const text = spanText(turns, moment.startTurn, moment.endTurn);
    if (!text) {
      problems.push(`Moment ${moment.title} has a bad turn range.`);
      continue;
    }
    if (!fold(text).includes(fold(moment.quote || ""))) {
      problems.push(`Moment quote is not in ${moment.startTurn}–${moment.endTurn}: ${moment.quote}`);
    }
  }

  return problems;
}

export async function draftNotes(options: {
  apiKey: string;
  model: string;
  name: string;
  docket: string;
  argued: string;
  status: string;
  holding: string;
  turns: Turn[];
  speakers: Speaker[];
}): Promise<DraftNotes> {
  const labels = new Map(options.speakers.map((speaker) => [speaker.id, speaker.label]));
  const transcript = options.turns
    .map((turn) => `${turn.id} [${labels.get(turn.speaker) ?? turn.speaker}] ${turn.text}`)
    .join("\n");

  const facts = [
    `Case: ${options.name}`,
    `Docket: ${options.docket}`,
    options.argued ? `Argued: ${options.argued}` : null,
    `Status to respect: ${options.status || "No opinion yet"}`,
    options.holding
      ? `Verified holding, which you may mention and must not go beyond: ${options.holding}`
      : "No holding was supplied. Do not invent a decision, a vote, or a disposition.",
  ]
    .filter(Boolean)
    .join("\n");

  let problems: string[] = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const notes = await complete(options.apiKey, options.model, facts, transcript, problems);
    problems = validateNotes(options.turns, notes);
    if (problems.length === 0) return notes;
  }
  throw new Error(problems.join(" "));
}

async function complete(
  apiKey: string,
  model: string,
  facts: string,
  transcript: string,
  problems: string[],
): Promise<DraftNotes> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You draft listening notes for one Supreme Court oral argument.",
            "Use only the transcript and the facts you are given.",
            "Every quote must be an exact contiguous phrase from a turn, copied with the transcript's words.",
            "Write in plain sentences a careful reader can follow. No slogans.",
            "These notes are a draft, not legal advice, and not a verified holding unless a holding was supplied.",
            "Return JSON with question, summary, highlights, and moments.",
            "question: one sentence, the legal question the hour is about.",
            "summary: about 150 words. Name the advocates the way the transcript labels them. Say what each side is asking the Court to accept.",
            "highlights: exactly 4 objects, each with turnId, title, note, quote.",
            "moments: exactly 6 objects. Two kind=confrontation, two kind=revelation, two kind=collision.",
            "confrontation: a justice keeps pressing an advocate and does not take the first answer.",
            "revelation: a quiet question draws a concession that could decide the case.",
            "collision: two readings meet, sometimes between justices.",
            "Each moment has kind, startTurn, endTurn, title, who, quote, note.",
            "startTurn is the turn where the moment begins. endTurn is the last turn that is part of it.",
            "The quote must appear inside that turn range.",
            "Do not describe anyone raising their voice unless the transcript says laughter or the words show it.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            facts,
            problems.length
              ? `Your previous draft failed these checks. Fix them without inventing quotes:\n${problems.join("\n")}`
              : "",
            "Transcript:",
            transcript,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 240);
    throw new Error(`Notes failed (${response.status}): ${detail}`);
  }
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("The notes call returned nothing.");
  return JSON.parse(text) as DraftNotes;
}
