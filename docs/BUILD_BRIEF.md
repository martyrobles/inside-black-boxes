# Blackletter Lab — Build Brief

Instructions for implementation. Read with `docs/PRODUCT_SPEC.md` and `docs/DECISIONS.md`.

**Status:** Slice 1 implemented in `apps/lab`. Continue one vertical slice at a time per `docs/STATUS.md`.

---

## Mission

Blackletter Lab is a new private, single-user creative intelligence application.

Read `docs/PRODUCT_SPEC.md` carefully before making architectural or implementation decisions.

---

## 1. Initial user and scope

The initial application is built for one private user. It is not currently a public SaaS product, collaboration platform, or enterprise system.

- Desktop-first and responsive on mobile
- Especially useful for legal, legaltech, generative AI, administrative law, immigration law, writing, product ideation, and creative projects
- Must also accept broader material: photographs, graffiti, video (store later; no video intelligence in MVP), observations, quotations, and story ideas

---

## 2. Core workflow

**Capture → Describe → Process → Search → Connect → Develop → Create an Output**

The application must make it easy to save imperfect material before the user knows what it will become.

---

## 3. Product vocabulary

Use consistently in database, code, interface, and documentation:

- **Artifact** — anything captured or uploaded
- **Idea** — a concept derived from one or more Artifacts
- **Project** — sustained work developing an Idea (UI: **Projects Underway**)
- **Output** — a particular deliverable
- **Collection** — a flexible grouping of items
- **Connection** — an explicit relationship between items

Do not create competing terms without explaining why and logging a decision.

---

## 4. First MVP

### Include

- Authentication
- Typed Quick Capture
- Image uploads
- PDF and document uploads
- URL capture
- Brief required user description, with “I’m not sure yet”
- Persistent storage
- Searchable Artifact Library
- Tags
- Collections
- Artifact detail pages
- Ideas
- Projects
- Manual Connections
- Basic AI-generated summaries
- “What could this become?” action
- Convert Artifact to Idea
- Convert Idea to Project
- Markdown export
- Responsive interface
- Clear loading, empty, success, and error states

### Do not attempt in the first milestone

Advanced video analysis, voice transcription, browser extensions, native mobile apps, team collaboration, subscriptions, public publishing, or autonomous AI agents.

---

## 5. Visual direction

Serious, editorial, intellectual, private, modern.

Generous spacing, strong typography, restrained colors, dark-mode support.

Feel like a private research library, creative studio, and intellectual laboratory — not a generic project-management dashboard.

Avoid: gavels, courthouse columns, scales of justice, robots, glowing AI imagery, excessive gradients, decorative charts, generic SaaS styling.

---

## 6. Privacy and AI rules

- Private by default
- Authentication required
- AI calls server-side only
- Never expose API keys in browser code
- Preserve original uploaded and written material
- Keep original content separate from user notes and AI-generated material
- Never silently overwrite user work
- Require user approval before making AI suggestions permanent
- Maintain provenance and development history
- Provide archive, delete, and export capabilities
- Do not claim MVP is approved for client-confidential information
- Do not present generated legal analysis as verified

---

## 7. Engineering process

Before writing application code:

1. Inspect the repository
2. Recommend architecture and stack
3. Explain the recommendation in plain English
4. Propose the database model
5. Identify required environment variables and external services
6. Create a phased roadmap
7. Define acceptance criteria for the first vertical slice
8. Record important decisions in `docs/DECISIONS.md`

Rules:

- Do not build the entire specification in one pass
- Do not create placeholder buttons that appear functional but do nothing
- Build one complete vertical slice at a time and verify it runs before continuing
- Preserve existing `website/` and `episodes/` functionality

After each milestone:

- Run the project
- Run type checking
- Run linting
- Run available tests
- Fix errors caused by the implementation
- Confirm the acceptance criteria
- Update the README and project documentation
- Summarize what changed and what remains

---

## Relationship to existing repo

| Path | Role |
|------|------|
| `website/` | Public Inside Black Boxes site (Vite). Leave intact. |
| `episodes/` | Podcast production markdown. Leave intact. |
| `docs/` | Lab product and build docs |
| `apps/lab/` (proposed) | New Blackletter Lab Next.js application |

Inside Black Boxes is a Project Underway inside the Lab, not the Lab’s product name.
