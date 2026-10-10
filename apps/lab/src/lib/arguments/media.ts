import { execFile } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { extractText, getDocumentProxy } from "unpdf";

const execFileAsync = promisify(execFile);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

export function repoRoot(): string {
  return path.resolve(process.cwd(), "../..");
}

export function cacheDir(slug: string): string {
  return path.join(repoRoot(), "website", ".cache", slug);
}

async function courtGet(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`The Court returned ${response.status} for ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function findTranscriptUrl(year: string, docket: string): Promise<string> {
  const index = `https://www.supremecourt.gov/oral_arguments/argument_transcript/${year}`;
  const html = (await courtGet(index)).toString("utf8");
  const match = html.match(
    new RegExp(`(?:\\.\\./)?argument_transcripts/${year}/${docket}_[a-z0-9]+\\.pdf`, "i"),
  );
  if (!match) {
    throw new Error(
      `No transcript for ${docket} in the ${year} folder. The term folder year is the one in the Court’s URL.`,
    );
  }
  return new URL(match[0], index).href;
}

export async function ensureRecording(options: {
  slug: string;
  docket: string;
  year: string;
  log: (line: string) => void;
}): Promise<{ pdfPath: string; mp3Path: string; transcriptUrl: string; audioPage: string; audioUrl: string }> {
  const dir = cacheDir(options.slug);
  await mkdir(dir, { recursive: true });
  const transcriptUrl = await findTranscriptUrl(options.year, options.docket);
  const audioUrl = `https://www.supremecourt.gov/media/audio/mp3files/${options.docket}.mp3`;
  const audioPage = `https://www.supremecourt.gov/oral_arguments/audio/${options.year}/${options.docket}`;
  const pdfPath = path.join(dir, `${options.docket}.pdf`);
  const mp3Path = path.join(dir, `${options.docket}.mp3`);

  if (!(await exists(pdfPath))) {
    options.log("Downloading the Court’s transcript.");
    await writeFile(pdfPath, await courtGet(transcriptUrl));
  } else {
    options.log("Using the transcript already saved on this computer.");
  }

  if (!(await exists(mp3Path))) {
    options.log("Downloading the Court’s recording. This is the long file.");
    await writeFile(mp3Path, await courtGet(audioUrl));
  } else {
    options.log("Using the recording already saved on this computer.");
  }

  return { pdfPath, mp3Path, transcriptUrl, audioPage, audioUrl };
}

async function exists(file: string): Promise<boolean> {
  try {
    const info = await stat(file);
    return info.size > 1000;
  } catch {
    return false;
  }
}

export async function readTranscriptPages(pdfPath: string): Promise<string[]> {
  const bytes = new Uint8Array(await readFile(pdfPath));
  const pdf = await getDocumentProxy(bytes);
  const extracted = await extractText(pdf, { mergePages: false });
  const text = extracted.text;
  return Array.isArray(text) ? text : [String(text ?? "")];
}

export async function mediaDuration(file: string): Promise<number> {
  const { stdout } = await execFileAsync("/usr/bin/afinfo", [file]);
  const match = stdout.match(/estimated duration:\s+([0-9.]+)/);
  if (!match) throw new Error(`Could not read the length of ${path.basename(file)}`);
  return Number(match[1]);
}

export async function transcribeRecording(options: {
  slug: string;
  mp3Path: string;
  apiKey: string;
  log: (line: string) => void;
}): Promise<{ wordsPath: string; duration: number }> {
  if (!ffmpegPath) throw new Error("ffmpeg is not available in this install.");
  const dir = cacheDir(options.slug);
  const wordsPath = path.join(dir, "words.json");
  if (await exists(wordsPath)) {
    options.log("Using word times already saved. This pass will not bill the speech API again.");
    const duration = await mediaDuration(options.mp3Path);
    return { wordsPath, duration };
  }

  const chunks = await splitAudio(ffmpegPath, options.mp3Path, dir, options.log);
  const words: { word: string; start: number; end: number }[] = [];
  let offset = 0;
  for (const chunk of chunks) {
    const cached = path.join(dir, `${path.basename(chunk, ".mp3")}-words.json`);
    let chunkWords: { word: string; start: number; end: number }[];
    if (await exists(cached)) {
      options.log(`Word times already saved for ${path.basename(chunk)}.`);
      chunkWords = JSON.parse(await readFile(cached, "utf8"));
    } else {
      options.log(`Timing ${path.basename(chunk)}. This bills your OpenAI account.`);
      chunkWords = await whisper(chunk, options.apiKey);
      await writeFile(cached, JSON.stringify(chunkWords));
    }
    for (const word of chunkWords) {
      words.push({
        word: word.word,
        start: round3(Number(word.start) + offset),
        end: round3(Number(word.end) + offset),
      });
    }
    offset += await mediaDuration(chunk);
  }
  await writeFile(wordsPath, JSON.stringify(words));
  options.log(`Timed ${words.length} words.`);
  return { wordsPath, duration: offset };
}

async function splitAudio(
  ffmpeg: string,
  mp3Path: string,
  dir: string,
  log: (line: string) => void,
): Promise<string[]> {
  const existing = await listChunks(dir);
  if (existing.length > 0) return existing;
  log("Splitting the recording into pieces the speech API will accept.");
  await execFileAsync(ffmpeg, [
    "-y",
    "-i",
    mp3Path,
    "-f",
    "segment",
    "-segment_time",
    "1500",
    "-reset_timestamps",
    "1",
    "-c",
    "copy",
    path.join(dir, "chunk-%02d.mp3"),
  ]);
  const chunks = await listChunks(dir);
  if (chunks.length === 0) throw new Error("The recording did not split.");
  return chunks;
}

async function listChunks(dir: string): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const names = (await readdir(dir))
    .filter((name) => /^chunk-\d+\.mp3$/.test(name))
    .sort();
  return names.map((name) => path.join(dir, name));
}

async function whisper(
  file: string,
  apiKey: string,
): Promise<{ word: string; start: number; end: number }[]> {
  const bytes = await readFile(file);
  const body = new FormData();
  body.append("model", "whisper-1");
  body.append("response_format", "verbose_json");
  body.append("timestamp_granularities[]", "word");
  body.append("language", "en");
  body.append("file", new Blob([bytes], { type: "audio/mpeg" }), path.basename(file));
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 240);
    throw new Error(`Speech timing failed (${response.status}): ${detail}`);
  }
  const payload = (await response.json()) as {
    words?: { word: string; start: number; end: number }[];
  };
  if (!payload.words?.length) throw new Error(`No words returned for ${path.basename(file)}`);
  return payload.words;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
