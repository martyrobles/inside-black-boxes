# Inside Black Boxes — Project Context

## What we're building

A podcast and companion website centered on the U.S. Supreme Court. Not a dry legal-recap site — the goal is smart, clever, opinionated commentary paired with primary source material.

**Show name:** Inside Black Boxes  
**Host:** Marty Robles-Avila  
**Domain:** insideblackboxes.com (planned)

## Core features (vision)

- Host and stream audio/video of actual SCOTUS oral arguments
- Written and/or audio commentary layered on arguments (case-by-case or term-by-term)
- Clip creation: short, shareable moments from arguments (memorable exchanges, gotcha moments, key quotes)
- Podcast feed (RSS) that mirrors/complements the website content
- Browsing by case, term, justice, or topic

## Tone / voice

Insightful and clever — sharp analysis with personality, not academic or dry. Should feel like a smart friend explaining what actually happened and why it matters.

**Current production note:** Early episodes lean practitioner-focused (immigration and administrative law). The voice should stay sharp and accessible as coverage broadens — avoid hot takes, but don't be dry.

## Current state (what exists today)

### Website (`website/`)

- Static site built with **Vite**, deployed to **Vercel**
- Root directory for Vercel: `website/`
- Content data in `website/src/data/site.js` (episodes, tracked cases, host info)
- Pages: home, episodes archive, about, per-episode detail pages under `website/episodes/`
- Design system in `website/src/styles/main.css`

### Episode production (`episodes/`)

Each episode lives in `episodes/[case-slug]/`:

| File | Purpose |
|------|---------|
| `outline.md` | Recording script / segment structure |
| `show-notes.md` | Published episode page content (from `show-notes-template.md`) |
| `clips.md` | Short-form clip specs (quotes, captions, voiceover, approval checklist) |
| `sources.md` | Primary sources and verification links |

**Episode types:** Opinion drop · Oral argument debrief · Term wrap

**Workflow:** Draft outline → record → write show notes → produce clips → publish to site and LinkedIn.

### Featured test episode

`urias-orellana` — dry-run opinion drop on *Urias-Orellana v. Bondi* (No. 24-777). Tests the full production pipeline.

### Tracked pending cases

Trump v. Barbara (birthright citizenship), Mullin v. Doe / Trump v. Miot (TPS), Blanche v. Lau (returning LPRs).

## Tech stack

| Layer | Current | Under consideration |
|-------|---------|---------------------|
| Website | Vite static site on Vercel | Headless CMS, or stay static with markdown |
| Podcast hosting | Not set up (`audioUrl: null`) | Podbean, Buzzsprout, Transistor, or self-hosted |
| Media / arguments | Not integrated | Oyez.org, supremecourt.gov — licensing TBD |
| Clips | Manual (Canva + CapCut/Descript) | Semi-automated pipeline TBD |
| RSS | Not built | Generated from episode data or podcast host |

**Principle:** Prefer simple, shippable solutions. Don't over-engineer before the workflow is proven.

## Open questions

- Build vs. platform (Podbean/Buzzsprout + custom site) vs. fully custom
- Where to source official argument audio/video and attribution requirements
- How clips get made — manual vs. semi-automated pipeline
- Whether commentary is text, audio, or both
- How broad SCOTUS coverage should be vs. immigration/admin law focus

## Content standards

- All holdings and quotes verified against official slip opinions before publish
- Note AI assistance in show materials; attorney-verified before recording
- Clips require approval checklist (quote verified, caption approved, exported)
- Educational content only — not legal advice

## Repo layout

```
inside-black-boxes/
├── AGENTS.md                 # This file — project context for AI agents
├── docs/                     # Blackletter Lab product + build docs
├── apps/
│   └── lab/                  # Blackletter Lab (Next.js private app)
├── show-notes-template.md    # Template for episode show notes
├── episodes/                 # Episode production files (markdown)
│   └── [case-slug]/
├── website/                  # Vite public podcast site (Vercel deploy root)
│   ├── src/data/site.js      # Episodes, cases, host — edit to add content
│   ├── episodes/             # Episode detail HTML pages
│   └── ...
└── DEPLOY-VERCEL.md          # Deployment guide
```

## Blackletter Lab

Private single-user creative intelligence app in `apps/lab`. Product docs: `docs/PRODUCT_SPEC.md`, `docs/BUILD_BRIEF.md`, `docs/DECISIONS.md`, `docs/STATUS.md`. Inside Black Boxes is a **Project Underway** inside Lab — not the Lab product name. Leave `website/` and `episodes/` intact when working on Lab.

## When adding content

1. Create `episodes/[case-slug]/` with outline, show notes, clips, sources
2. Add episode entry to `website/src/data/site.js`
3. Create `website/episodes/[case-slug].html` detail page
4. Register new page in `website/vite.config.js` if needed
