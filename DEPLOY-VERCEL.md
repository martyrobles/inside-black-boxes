# Deploy Inside Black Boxes to Vercel

Beginner-friendly guide for publishing the website at a public URL (e.g. `https://inside-black-boxes.vercel.app`).

## Overview

Vercel hosts your website on the internet. The usual path:

1. Put your code on **GitHub** (free code storage in the cloud)
2. Connect **Vercel** to that GitHub repo
3. Vercel builds and publishes the site automatically

Every time you push changes to GitHub, Vercel can redeploy the site for you.

---

## What you need before starting

- [ ] Node.js installed (you already ran `npm install` successfully)
- [ ] A **GitHub** account — https://github.com/signup
- [ ] A **Vercel** account — https://vercel.com/signup (use “Continue with GitHub”)

Allow about **30–45 minutes** the first time.

---

## Part 1 — Save your project to Git (on your Mac)

Git tracks changes so Vercel can download your code from GitHub.

### 1. Open Terminal

`Cmd + Space` → type **Terminal** → Enter

### 2. Go to the project folder

```bash
cd ~/Projects/inside-black-boxes
```

### 3. Tell Git who you are (first time only)

Use your real name and the email tied to your GitHub account:

```bash
git config --global user.name "Marty Robles-Avila"
git config --global user.email "YOUR_GITHUB_EMAIL@example.com"
```

Replace the email with yours.

### 4. Create the first save point (commit)

Copy and paste these lines **one at a time**, pressing Enter after each:

```bash
git add .
git status
git commit -m "Initial commit: podcast website and episode files"
```

After `git status`, you should see files listed in green. After `commit`, you should see a message like `X files changed`.

---

## Part 2 — Put the project on GitHub

### 1. Create a new repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `inside-black-boxes` (or any name you like)
3. **Description:** optional — e.g. “Inside Black Boxes podcast website”
4. Choose **Private** (recommended while testing) or **Public**
5. **Do NOT** check “Add a README” — your project already has files
6. Click **Create repository**

### 2. Connect your Mac folder to GitHub

GitHub shows a page with commands. Use the section **“…or push an existing repository from the command line.”**

In Terminal (still in `~/Projects/inside-black-boxes`), run these three lines — **replace `YOUR_USERNAME`** with your GitHub username:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inside-black-boxes.git
git push -u origin main
```

### 3. Sign in when asked

- A browser window may open for GitHub login
- Or Terminal may ask for username and **Personal Access Token** (not your password)

**If it asks for a password:** GitHub no longer accepts account passwords for git push. Create a token:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check **repo** → Generate
3. Copy the token and paste it when Terminal asks for a password

### 4. Confirm upload worked

Refresh your GitHub repo page in the browser. You should see folders like `website/` and `episodes/`.

---

## Part 3 — Deploy on Vercel

### 1. Sign up / log in to Vercel

1. Go to https://vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access GitHub when prompted

### 2. Import your project

1. On the Vercel dashboard, click **Add New…** → **Project**
2. Find **inside-black-boxes** in the list → click **Import**

### 3. Configure the project (IMPORTANT)

Vercel must build the site from the **`website`** subfolder, not the repo root.

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite (should auto-detect) |
| **Root Directory** | Click **Edit** → select or type `website` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

Leave everything else as default.

### 4. Deploy

Click **Deploy**.

Wait 1–2 minutes. You’ll see a progress log, then **Congratulations!**

### 5. Open your live site

Click **Visit** or copy the URL Vercel gives you, e.g.:

```
https://inside-black-boxes-xxxxx.vercel.app
```

Test these pages:

- `/` — homepage
- `/episodes.html` — episode archive
- `/about.html` — about page
- `/episodes/urias-orellana.html` — featured episode

---

## Part 4 — Custom domain (optional, later)

1. Vercel project → **Settings** → **Domains**
2. Add a domain you own (e.g. `insideblackboxes.com`)
3. Follow Vercel’s DNS instructions at your domain registrar

Skip this until you have a domain you want to use.

---

## Updating the site later

After you change files on your Mac:

```bash
cd ~/Projects/inside-black-boxes
git add .
git commit -m "Describe what you changed"
git push
```

Vercel automatically rebuilds and republishes within a few minutes.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `git: command not found` | Install Xcode Command Line Tools: run `xcode-select --install` in Terminal |
| `git push` rejected | Make sure the GitHub repo is empty (no README added on create) |
| Vercel build fails | Confirm **Root Directory** is set to `website` |
| Site loads but pages 404 | Use paths with `.html` (e.g. `/episodes.html`) or redeploy after fixing root directory |
| Blank page | Check Vercel **Deployments** → click failed deploy → read **Build Logs** |

---

## Quick checklist

- [ ] Git commit created locally
- [ ] Code pushed to GitHub
- [ ] Vercel project imported from GitHub
- [ ] Root Directory = `website`
- [ ] Deploy succeeded
- [ ] Live URL opens in browser

Your live URL will look like: `https://inside-black-boxes.vercel.app` (exact name depends on your Vercel project name).
