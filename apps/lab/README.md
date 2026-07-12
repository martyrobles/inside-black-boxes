# Blackletter Lab

Private, single-user creative intelligence library (Slices 1–3).

## What works now

- Authentication (Supabase Auth)
- Capture: quick note, image, PDF/document, URL
- Required brief description, or “I’m not sure yet”
- Persistent Artifact library with full-text search
- Artifact detail pages (original material separate from your description)
- Tags and Collections
- Ideas and Projects Underway
- Artifact → Idea → Project conversion
- Manual Connections
- On-request AI summary and “What could this become?”
- Private file storage for uploads (3 MB max)
- Brand collage login page
- Setup screen when env vars are missing

## What is deferred

Markdown export, automatic AI on upload — see `docs/BUILD_BRIEF.md`.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in URL + anon key.
3. Run migrations in the Supabase SQL editor, in order:
   `001_initial.sql`, `004_tags_collections_search.sql`,
   `005_ideas_projects_connections.sql` (and optionally `003_upload_limit_3mb.sql`).
4. Confirm the private `artifacts` storage bucket exists.
5. From this directory:

```bash
npm install
npm run dev
```

6. Open [http://localhost:3000/login](http://localhost:3000/login) and create your account.

Optional: disable email confirmation in Supabase Auth for solo local use.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Privacy note

This MVP is **not** represented as approved for client-confidential information. AI calls (when added) will be server-side only.

## Relationship to the podcast site

The public Inside Black Boxes site remains in `/website`. Inside Black Boxes is a **Project Underway** concept inside the Lab product vocabulary — not this app’s brand.
