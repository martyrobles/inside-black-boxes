# Blackletter Lab — Decisions Log

Record of product and engineering decisions that bind implementation.  
Vision lives in `docs/PRODUCT_SPEC.md`. Build constraints live in `docs/BUILD_BRIEF.md`.

Status legend: **Accepted** · **Proposed (awaiting approval)** · **Superseded**

---

## D001 — Initial user and product scope

**Status:** Accepted  
**Date:** 2026-07-11

Blackletter Lab is initially:

- A private, single-user application
- Built primarily for Marty Robles-Avila
- Desktop-first, responsive on mobile
- Legal and legaltech oriented, while allowing broader creative material
- Not a public SaaS product
- Not a collaboration platform

**Must not build yet:** teams, subscriptions, permissions matrices, enterprise administration, public multi-tenant SaaS.

---

## D002 — Core workflow

**Status:** Accepted  
**Date:** 2026-07-11

Center of the application:

**Capture → Describe → Process → Search → Connect → Develop → Create an Output**

First working version must let the user:

1. Add something
2. Explain briefly why they saved it
3. Find it later
4. Connect it to other material
5. Turn it into an Idea
6. Turn that Idea into an article, post, Project, or creative concept

---

## D003 — Product vocabulary (locked)

**Status:** Accepted  
**Date:** 2026-07-11

Use these terms consistently in database, code, UI, and docs. Do not invent competing names without a new decision entry.

| Term | Meaning |
|------|---------|
| **Artifact** | Anything captured or uploaded |
| **Idea** | A concept derived from one or more Artifacts |
| **Project** | Sustained work developing an Idea |
| **Output** | A specific deliverable |
| **Collection** | A flexible grouping |
| **Connection** | A meaningful relationship between items |

Active Projects appear under **Projects Underway** in the UI.

---

## D004 — Exact MVP scope

**Status:** Accepted  
**Date:** 2026-07-11

**Include:**

- Authentication
- Typed Quick Capture
- Image uploads
- PDF and document uploads
- URL capture
- Required brief user description, with “I’m not sure yet”
- Persistent storage
- Searchable Artifact Library
- Tags
- Collections
- Artifact detail pages
- Ideas
- Projects (Projects Underway)
- Manual Connections
- Basic AI-generated summaries
- “What could this become?”
- Convert Artifact → Idea
- Convert Idea → Project
- Markdown export
- Responsive interface
- Clear loading, empty, success, and error states

**Defer:**

- Voice transcription
- Video intelligence / analysis
- Advanced semantic / visual search
- Image generation
- Screenplay formatting
- Browser extensions
- Native mobile apps
- Team collaboration
- Subscriptions
- Public publishing
- Autonomous AI agents
- Creative Collision as a required first-slice feature (may follow once core loop works)

---

## D005 — Inside Black Boxes relationship

**Status:** Accepted  
**Date:** 2026-07-11

Inside Black Boxes is a **Project Underway** inside Blackletter Lab, not a sibling product brand.  
The existing Vite site in `website/` remains the public podcast site and is separate from the Lab app.

---

## D006 — Design direction

**Status:** Accepted  
**Date:** 2026-07-11

- Serious, editorial, intellectual, modern
- Understated legaltech aesthetic
- Spacious layout, strong typography
- Off-white, charcoal, black, slate, restrained accents
- Dark mode supported
- Desktop-first
- Minimal decorative charts
- Feel: private research library + creative studio + intellectual laboratory
- Not a generic project-management dashboard

**Forbidden visuals:** gavels, scales of justice, courthouse columns, robots, glowing brains, generic AI graphics, excessive gradients, generic SaaS chrome.

---

## D007 — Privacy and AI behavior

**Status:** Accepted  
**Date:** 2026-07-11

- Authentication required
- Private-by-default data
- Server-side AI calls only
- No API keys in browser code
- Clear separation: original content vs user notes vs AI-generated material
- No silent overwriting of user work
- User approval before saving AI-generated connections or edits
- Source links and provenance
- Version history where outputs/drafts exist
- Data export
- Soft deletion and archive controls

**Explicit limits:**

- MVP is **not** represented as approved for client-confidential information
- Generated legal analysis must **not** be presented as verified

---

## D008 — Engineering process

**Status:** Accepted  
**Date:** 2026-07-11

- Inspect before changing
- Plan before coding
- Build one complete vertical slice at a time
- No fake buttons that appear functional but do nothing
- No mock data once persistence is implemented
- Test after each stage
- Fix build and type errors
- Update documentation
- Preserve existing working functionality (`website/`, episode markdown)
- Explain major technical decisions in plain English
- Do not implement the entire specification in one pass

After each milestone: run project, typecheck, lint, tests; confirm acceptance criteria; update README/docs; summarize what changed and what remains.

---

## D009 — Recommended stack

**Status:** Accepted  
**Date:** 2026-07-11  
**Approved by:** Marty (chat confirmation)

| Concern | Decision |
|---------|----------|
| App framework | Next.js (App Router) + TypeScript |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| File storage | Supabase Storage |
| AI | Server-side only, with provider abstraction |
| Initial AI provider | OpenAI (swappable via abstraction; Anthropic optional later) |
| Hosting | Vercel, private deployment behind login |
| AI processing | Manual / on-request only (not automatic on upload) |
| Photo EXIF location | Do not retain or use |
| Deletion | Soft delete + archive |
| URL capture (MVP) | Store URL + fetched title/metadata; full article text later |
| Max upload (MVP) | 3 MB per file |
| Local development | Authentication required (no trusted bypass in MVP) |
| Repo layout | New app at `apps/lab/`; leave `website/` and `episodes/` intact |

---

## D010 — Open questions

**Status:** Accepted (resolved)  
**Date:** 2026-07-11

| Question | Decision |
|----------|----------|
| Supabase vs alternative | **Supabase** for auth, Postgres, and storage |
| Initial AI provider | **OpenAI**, behind abstraction |
| Login during local development | **Required** |
| Maximum upload size | **3 MB** |
| URL capture depth | **Link + title/metadata only** in MVP |
| Permanent file deletion | Soft delete first; **hard delete allowed** from archive/trash after user confirms |
| AI processing trigger | **On request only** |
| Photo location metadata | **Never store** in MVP |
| Initial deploy | **Private Vercel app behind login** |

---

## D012 — Slice 2 implementation

**Status:** Accepted  
**Date:** 2026-07-11

Slice 2 shipped in `apps/lab`:

- Tags, Collections, Library full-text search
- Migration: `004_tags_collections_search.sql`

See `docs/STATUS.md`.

---

## D013 — Slice 3 implementation

**Status:** Accepted  
**Date:** 2026-07-11

Slice 3 shipped in `apps/lab`:

- Ideas, Projects Underway, manual Connections
- Artifact → Idea → Project conversion
- Migration: `005_ideas_projects_connections.sql`

See `docs/STATUS.md`.

---

## D014 — Slice 4 + login hero

**Status:** Accepted  
**Date:** 2026-07-11

- Login page uses sepia/collage brand art (`public/login-hero.png`)
- Slice 4 AI: on-request summary + What could this become?, user approval required
- Migration: `006_ai_suggestions.sql`

See `docs/STATUS.md`.

---

## Decision index

| ID | Title | Status |
|----|-------|--------|
| D001 | Initial user and scope | Accepted |
| D002 | Core workflow | Accepted |
| D003 | Product vocabulary | Accepted |
| D004 | Exact MVP scope | Accepted |
| D005 | Inside Black Boxes relationship | Accepted |
| D006 | Design direction | Accepted |
| D007 | Privacy and AI behavior | Accepted |
| D008 | Engineering process | Accepted |
| D009 | Stack | Accepted |
| D010 | Open questions | Accepted (resolved) |
| D011 | Slice 1 implementation | Accepted |
| D012 | Slice 2 implementation | Accepted |
| D013 | Slice 3 implementation | Accepted |
| D014 | Slice 4 + login hero | Accepted |
