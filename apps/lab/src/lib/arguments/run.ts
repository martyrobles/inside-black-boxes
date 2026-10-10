import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { cacheDir, ensureRecording, readTranscriptPages, repoRoot, transcribeRecording } from "./media";
import { draftNotes } from "./notes";
import { arguedDate, cleanTranscript, parseTurns } from "./parse";
import { publishArgument } from "./publish";
import type { ArgumentRequest, JobState } from "./types";

const execFileAsync = promisify(execFile);

type JobGlobal = {
  current: JobState | null;
  running: boolean;
};

function jobs(): JobGlobal {
  const holder = globalThis as typeof globalThis & { __ibbArgumentJob?: JobGlobal };
  if (!holder.__ibbArgumentJob) holder.__ibbArgumentJob = { current: null, running: false };
  return holder.__ibbArgumentJob;
}

function jobPath(): string {
  return path.join(repoRoot(), "website", ".cache", "argument-job.json");
}

async function save(job: JobState): Promise<void> {
  jobs().current = job;
  await mkdir(path.dirname(jobPath()), { recursive: true });
  await writeFile(jobPath(), JSON.stringify(job, null, 2));
}

export async function readJob(): Promise<JobState | null> {
  if (jobs().current) return jobs().current;
  try {
    const saved = JSON.parse(await readFile(jobPath(), "utf8")) as JobState;
    if (saved.status === "running" && !jobs().running) {
      saved.status = "error";
      saved.error =
        "Lab stopped before this finished. Start it again. Word times already saved are not billed a second time.";
    }
    return saved;
  } catch {
    return null;
  }
}

export function validateRequest(input: ArgumentRequest): string | null {
  if (!/^\d{2}-\d+$/.test(input.docket)) return "Docket should look like 26-426.";
  if (!/^\d{4}$/.test(input.year)) return "Term folder year should be four digits, like 2025.";
  if (!input.name.trim()) return "Add the case name as you want it on the page.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug === "index") {
    return "Slug should be short lowercase words, like barbara.";
  }
  return null;
}

export function startArgumentJob(input: ArgumentRequest): { id: string } | { error: string } {
  const problem = validateRequest(input);
  if (problem) return { error: problem };
  if (jobs().running) return { error: "An argument is already processing. Leave this page open until it finishes." };

  const job: JobState = {
    id: `${input.slug}-${Date.now()}`,
    status: "running",
    log: ["Starting. The public site will not call a model. This run uses your OpenAI key."],
    slug: input.slug,
  };
  jobs().running = true;
  jobs().current = job;
  void save(job)
    .then(() => processArgument(input, job))
    .catch(async (error: unknown) => {
      job.status = "error";
      job.error = error instanceof Error ? error.message : "Processing failed.";
      job.log.push(job.error);
      await save(job);
    })
    .finally(() => {
      jobs().running = false;
    });
  return { id: job.id };
}

async function log(job: JobState, line: string): Promise<void> {
  job.log.push(line);
  await save(job);
}

async function processArgument(input: ArgumentRequest, job: JobState): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to apps/lab/.env.local and restart Lab.");
  }

  const jsonPath = path.join(repoRoot(), "website", "src", "data", `${input.slug}.json`);
  if (!input.replace && (await fileExists(jsonPath))) {
    throw new Error(
      `${input.slug} already has a listening page. Check Replace if you mean to write it again.`,
    );
  }

  const files = await ensureRecording({
    slug: input.slug,
    docket: input.docket,
    year: input.year,
    log: (line) => {
      void log(job, line);
    },
  });
  await log(job, "Reading the transcript.");
  const pages = await readTranscriptPages(files.pdfPath);
  const argued = arguedDate(pages);
  const parsed = parseTurns(cleanTranscript(pages));
  await log(job, `${parsed.turns.length} turns, ${parsed.speakers.length} speakers.`);

  const timed = await transcribeRecording({
    slug: input.slug,
    mp3Path: files.mp3Path,
    apiKey,
    log: (line) => {
      void log(job, line);
    },
  });

  await log(job, "Lining the transcript up with the recording.");
  const dir = cacheDir(input.slug);
  const turnsPath = path.join(dir, "turns-clean.json");
  const alignedPath = path.join(dir, "turns-aligned.json");
  await writeFile(turnsPath, JSON.stringify(parsed.turns));
  await execFileAsync("python3", [
    path.join(repoRoot(), "apps", "lab", "scripts", "align_turns.py"),
    turnsPath,
    timed.wordsPath,
    alignedPath,
  ]);
  const turns = JSON.parse(await readFile(alignedPath, "utf8"));

  await log(job, "Writing the draft summary and Friction. One chat call on your OpenAI key.");
  const notes = await draftNotes({
    apiKey,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    name: input.name.trim(),
    docket: input.docket,
    argued: argued.display,
    status: input.status.trim() || "No opinion yet",
    holding: input.holding.trim(),
    turns,
    speakers: parsed.speakers,
  });

  const published = await publishArgument({
    slug: input.slug,
    name: input.name.trim(),
    docket: input.docket,
    arguedDisplay: argued.display,
    arguedIso: argued.iso,
    status: input.status.trim() || "No opinion yet",
    counsel: input.counsel,
    duration: timed.duration,
    audioUrl: files.audioUrl,
    audioPage: files.audioPage,
    transcriptUrl: files.transcriptUrl,
    question: notes.question,
    summary: notes.summary,
    speakers: parsed.speakers,
    turns,
    notes,
  });

  job.status = "done";
  job.href = published.href;
  await log(job, `Wrote the listening page at ${published.href}. Notes are a draft until you review them.`);
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
