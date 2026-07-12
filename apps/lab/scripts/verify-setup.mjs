#!/usr/bin/env node
/**
 * Verifies Blackletter Lab local setup against Supabase.
 * Usage: npm run verify-setup
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}
function fail(msg) {
  console.log(`✗ ${msg}`);
}
function info(msg) {
  console.log(`→ ${msg}`);
}

async function main() {
  let failed = false;
  console.log("\nBlackletter Lab — setup check\n");

  if (!fs.existsSync(envPath)) {
    fail("apps/lab/.env.local is missing");
    info("Copy .env.example to .env.local and paste your Supabase URL + anon key.");
    process.exit(1);
  }
  ok(".env.local exists");

  const env = loadEnv(envPath);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes("YOUR_PROJECT")) {
    fail("NEXT_PUBLIC_SUPABASE_URL looks unset — paste your real Project URL");
    failed = true;
  } else if (!url.startsWith("https://") || !url.includes("supabase")) {
    fail("NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase URL");
    failed = true;
  } else {
    ok(`Supabase URL set (${url.replace(/^https:\/\//, "").split(".")[0]}…)`);
  }

  if (!key || key === "your_anon_key" || key.length < 20) {
    fail("NEXT_PUBLIC_SUPABASE_ANON_KEY looks unset — paste your anon public key");
    failed = true;
  } else {
    ok("Anon key set");
  }

  if (failed) {
    console.log("\nFix .env.local, then run: npm run verify-setup\n");
    process.exit(1);
  }

  info("Checking Supabase Auth endpoint…");
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: key },
    });
    if (res.ok) {
      ok("Auth service reachable");
    } else {
      fail(`Auth health returned HTTP ${res.status}`);
      failed = true;
    }
  } catch (err) {
    fail(`Could not reach Supabase: ${err.message}`);
    failed = true;
  }

  info("Checking artifacts table via REST…");
  try {
    const res = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/artifacts?select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    const body = await res.text();
    if (res.status === 200) {
      ok("artifacts table exists (migration likely applied)");
    } else if (
      body.includes("Could not find the table") ||
      body.includes("does not exist") ||
      res.status === 404
    ) {
      fail("artifacts table not found — run supabase/migrations/001_initial.sql");
      failed = true;
    } else if (res.status === 401 || res.status === 403) {
      ok(`REST reachable (HTTP ${res.status}) — table likely exists; RLS is active`);
    } else {
      fail(`Unexpected REST response HTTP ${res.status}: ${body.slice(0, 160)}`);
      failed = true;
    }
  } catch (err) {
    fail(`REST check failed: ${err.message}`);
    failed = true;
  }

  info("Checking storage bucket…");
  try {
    const byName = await fetch(
      `${url.replace(/\/$/, "")}/storage/v1/bucket/artifacts`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    const byNameBody = await byName.text();
    if (byName.ok) {
      ok("artifacts storage bucket exists");
    } else if (
      byNameBody.includes("Bucket not found") ||
      byName.status === 404
    ) {
      // Publishable/anon keys sometimes cannot read bucket metadata.
      // Treat as a warning; confirm in the dashboard or via an image upload.
      info(
        'Could not confirm bucket via API. In Storage, confirm a private bucket named exactly "artifacts".',
      );
    } else {
      info(
        `Storage check inconclusive (HTTP ${byName.status}). Confirm bucket "artifacts" under Storage.`,
      );
    }
  } catch (err) {
    info(`Storage check skipped: ${err.message}`);
  }

  console.log("");
  if (failed) {
    fail("Setup incomplete — fix items above, then re-run.");
    process.exit(1);
  }
  ok("Setup looks good. Next: npm run dev → http://localhost:3000/login\n");
}

main();
