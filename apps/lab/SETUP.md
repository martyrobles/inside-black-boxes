# Blackletter Lab — Local setup checklist

Do these in order. Check each box as you finish.

## 1. Env file (required)

- [ ] Open Supabase → your project → **Project Settings** (gear) → **API**
- [ ] Copy **Project URL** (looks like `https://xxxxx.supabase.co`)
- [ ] Copy **anon public** key (long JWT string — use **anon**, not service_role)
- [ ] In the repo, create `apps/lab/.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_anon_key_here
```

## 2. Database + storage (required)

- [ ] Supabase → **SQL Editor** → New query
- [ ] Open `apps/lab/supabase/migrations/001_initial.sql`, copy all of it
- [ ] Paste into SQL Editor → **Run**
- [ ] Confirm it finishes without errors
- [ ] Supabase → **Storage** → confirm a private bucket named **`artifacts`** exists

## 3. Auth (recommended for solo use)

- [ ] Supabase → **Authentication** → **Providers** → **Email**
- [ ] Turn **off** “Confirm email” so you can sign up and use the app immediately

## 4. Verify

```bash
cd apps/lab
npm run verify-setup
```

All checks should show ✓.

## 5. Run the app

```bash
cd apps/lab
npm run dev
```

- [ ] Open http://localhost:3000/login
- [ ] **Create account** (this is the Lab app user — separate from your Supabase login)
- [ ] Capture a quick note
- [ ] Capture an image
- [ ] Confirm both appear in **Library**

## What “created an account in Supabase” means

| Account | Purpose |
|---------|---------|
| Supabase dashboard login | Manages the project (you already did this) |
| Lab app Sign up on `/login` | Your private app user (do this after env + SQL) |

You need both.
