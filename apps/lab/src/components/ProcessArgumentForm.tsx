"use client";

import { useEffect, useState } from "react";
import type { JobState } from "@/lib/arguments/types";

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bv\.\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProcessArgumentForm() {
  const [docket, setDocket] = useState("");
  const [year, setYear] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("No opinion yet");
  const [holding, setHolding] = useState("");
  const [counsel, setCounsel] = useState("");
  const [replace, setReplace] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<JobState | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let stop = false;
    async function poll() {
      const response = await fetch("/api/arguments");
      if (!response.ok || stop) return;
      const payload = (await response.json()) as { job: JobState | null };
      if (!stop) setJob(payload.job);
    }
    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 2000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const running = job?.status === "running" || pending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/arguments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docket, year, name, slug, status, holding, counsel, replace }),
      });
      const payload = (await response.json()) as { error?: string; id?: string };
      if (!response.ok) {
        setError(payload.error || "Could not start.");
        return;
      }
      setJob({
        id: payload.id || "job",
        status: "running",
        log: ["Starting. The public site will not call a model. This run uses your OpenAI key."],
        slug,
      });
    } catch {
      setError("Could not reach Lab.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="detail-grid">
      <form className="capture-form" onSubmit={onSubmit}>
        <label className="field">
          <span className="label">Docket</span>
          <input
            className="input"
            value={docket}
            onChange={(event) => setDocket(event.target.value)}
            placeholder="26-426"
            required
          />
        </label>
        <label className="field">
          <span className="label">Term folder year</span>
          <input
            className="input"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="2025"
            required
          />
          <span className="muted small">
            The year in the Court’s transcript URL. An April argument in October Term 2025 uses 2025.
          </span>
        </label>
        <label className="field">
          <span className="label">Case name</span>
          <input
            className="input"
            value={name}
            onChange={(event) => {
              const next = event.target.value;
              setName(next);
              if (!slugTouched) setSlug(slugFromName(next));
            }}
            placeholder="DHS v. D.V.D."
            required
          />
        </label>
        <label className="field">
          <span className="label">Page slug</span>
          <input
            className="input"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            placeholder="d-v-d"
            required
          />
        </label>
        <label className="field">
          <span className="label">Opinion line</span>
          <input
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="label">Holding, if one has issued</span>
          <textarea
            className="input input--area"
            rows={3}
            value={holding}
            onChange={(event) => setHolding(event.target.value)}
            placeholder="Leave blank when the Court has not decided."
          />
        </label>
        <label className="field">
          <span className="label">Counsel, optional</span>
          <textarea
            className="input input--area"
            rows={3}
            value={counsel}
            onChange={(event) => setCounsel(event.target.value)}
            placeholder={"For the petitioners | Gen. D. John Sauer\nFor the respondents | Cecillia D. Wang"}
          />
        </label>
        <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.6rem" }}>
          <input
            type="checkbox"
            checked={replace}
            onChange={(event) => setReplace(event.target.checked)}
          />
          <span>Replace an existing listening page</span>
        </label>
        {error ? (
          <p className="banner banner--error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={running}>
          {running ? "Processing…" : "Process this argument"}
        </button>
      </form>

      <section className="panel">
        <p className="label panel__label">This run</p>
        {job ? (
          <>
            <p className="muted small">{job.status}</p>
            <ol className="prose">
              {job.log.map((line, index) => (
                <li key={`${job.id}-${index}`}>{line}</li>
              ))}
            </ol>
            {job.status === "done" && job.href ? (
              <p>
                <a href={`http://127.0.0.1:5173${job.href}`}>Open the local listening page</a>
              </p>
            ) : null}
            {job.error ? (
              <p className="banner banner--error" role="alert">
                {job.error}
              </p>
            ) : null}
          </>
        ) : (
          <p className="muted">Nothing processing.</p>
        )}
      </section>
    </div>
  );
}
