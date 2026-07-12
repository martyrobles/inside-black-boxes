# Blackletter Lab — Implementation Status

## Current milestone: Slice 4 (complete in code)

**Shipped in `apps/lab`:**

### Slice 1–3
- Capture, Library, Tags, Collections, Ideas, Projects, Connections

### Slice 4
- On-request AI summary
- “What could this become?” concept drafts
- Accept / reject / Accept as Idea (never silent overwrite)
- Blocks privileged / do-not-send-to-model Artifacts
- Migration: `006_ai_suggestions.sql`
- Login page uses brand collage hero (`public/login-hero.png`)
- Cinematic landing at `/` (rising-ridge coastal hero, Library / Capture / Ratiocinate)
- Ratiocinate placeholder at `/ratiocinate`

**Not yet:** Markdown export, automatic AI on upload, Creative Collision, Ratiocinate feature

## Required for Slice 4

1. Run `apps/lab/supabase/migrations/006_ai_suggestions.sql` in Supabase SQL Editor  
2. Add `OPENAI_API_KEY=...` to `apps/lab/.env.local`  
3. Restart `npm run dev`

## Run locally

See `apps/lab/README.md`.
