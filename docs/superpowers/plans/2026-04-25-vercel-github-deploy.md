# Vercel + GitHub Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Push the retro-portfolio project to a new GitHub repo and deploy it live on Vercel with all environment variables set.

**Architecture:** Git init locally → push to GitHub → import into Vercel via CLI → set env vars (Spotify keys) → verify live URL works end-to-end.

**Tech Stack:** Git, GitHub CLI (`gh`), Vercel CLI (`vercel`), Next.js 15 (already building cleanly)

---

## Pre-flight facts

- Project root: `X:/CC/retro-portfolio`
- No git repo exists yet (confirmed)
- `.gitignore` already present (excludes `.env.local`, `node_modules`, `.next`)
- Build passes cleanly (`pnpm build` succeeds, 0 TS errors)
- Env vars needed on Vercel:
  - `SPOTIFY_CLIENT_ID` = `4adcf6ef69744ce6be30640943110c0e`
  - `SPOTIFY_CLIENT_SECRET` = `80d4dbe0aaed437e960dfa44987d8b97`
  - `SPOTIFY_REFRESH_TOKEN` = `AQBeCIGX...` (full token in `.env.local`)

---

### Task 1: Initialise git and make first commit

**Files:**
- Modify: `.gitignore` (verify `.env.local` is excluded — it already is)

- [ ] **Step 1: Init repo**

```bash
cd X:/CC/retro-portfolio
git init
git branch -M main
```

Expected output: `Initialized empty Git repository in X:/CC/retro-portfolio/.git/`

- [ ] **Step 2: Verify .env.local is gitignored**

```bash
git check-ignore -v .env.local
```

Expected: `.gitignore:1:.env*    .env.local`
If nothing prints, open `.gitignore` and add `.env.local` on its own line before continuing.

- [ ] **Step 3: Stage all files**

```bash
git add .
git status
```

Verify `.env.local` does NOT appear in the staged list.

- [ ] **Step 4: First commit**

```bash
git commit -m "feat: initial retro portfolio — Win98 desktop with Spotify + Letterboxd"
```

Expected: summary line showing files committed, no errors.

---

### Task 2: Create GitHub repository and push

**Requires:** GitHub CLI (`gh`) — check with `gh --version`. If missing, download from https://cli.github.com and run `gh auth login`.

- [ ] **Step 1: Confirm gh is authenticated**

```bash
gh auth status
```

Expected: `Logged in to github.com as <your-username>`
If not logged in: `gh auth login` → choose GitHub.com → HTTPS → browser auth.

- [ ] **Step 2: Create repo and push in one command**

```bash
gh repo create retro-portfolio --public --source=. --remote=origin --push
```

Expected output ends with:
```
✓ Created repository <username>/retro-portfolio on GitHub
✓ Pushed commits to https://github.com/<username>/retro-portfolio.git
```

- [ ] **Step 3: Verify on GitHub**

```bash
gh repo view --web
```

This opens the repo in your browser. Confirm you can see all the files.

---

### Task 3: Deploy to Vercel

**Requires:** Vercel CLI — check with `vercel --version`. If missing: `npm i -g vercel` then `vercel login`.

- [ ] **Step 1: Confirm vercel CLI is ready**

```bash
vercel --version
vercel whoami
```

Expected: version number + your Vercel username.
If not logged in: `vercel login` → choose GitHub → browser auth.

- [ ] **Step 2: Link and deploy**

Run from the project root:

```bash
cd X:/CC/retro-portfolio
vercel
```

When prompted:
- **Set up and deploy?** → `Y`
- **Which scope?** → select your personal account
- **Link to existing project?** → `N`
- **Project name?** → `retro-portfolio` (or press Enter for default)
- **In which directory is your code?** → `.` (press Enter)
- **Want to modify settings?** → `N`

Vercel auto-detects Next.js. It will build and give you a preview URL like:
`https://retro-portfolio-abc123.vercel.app`

- [ ] **Step 3: Confirm preview URL loads**

Open the URL in browser. The Win98 desktop should appear.
The Spotify and Letterboxd windows may show errors — that's expected until env vars are added in Task 4.

---

### Task 4: Add environment variables to Vercel

- [ ] **Step 1: Add Spotify Client ID**

```bash
vercel env add SPOTIFY_CLIENT_ID production
```

When prompted for value, paste: `4adcf6ef69744ce6be30640943110c0e`
When prompted for environments, select: `Production`, `Preview`, `Development` (all three).

- [ ] **Step 2: Add Spotify Client Secret**

```bash
vercel env add SPOTIFY_CLIENT_SECRET production
```

Paste value: `80d4dbe0aaed437e960dfa44987d8b97`
Select all three environments.

- [ ] **Step 3: Add Spotify Refresh Token**

```bash
vercel env add SPOTIFY_REFRESH_TOKEN production
```

Paste the full token from `.env.local` (starts with `AQBeCIGX...`).
Select all three environments.

- [ ] **Step 4: Redeploy to pick up env vars**

```bash
vercel --prod
```

This triggers a production deployment. Wait for the URL — it will be your permanent production URL:
`https://retro-portfolio.vercel.app` (or similar).

---

### Task 5: Update Spotify redirect URI for production

The Spotify OAuth callback is registered for `127.0.0.1:3000`. The live site has a different domain, so you need to add the production URL.

- [ ] **Step 1: Get your production domain**

```bash
vercel ls
```

Note the `.vercel.app` domain shown.

- [ ] **Step 2: Add redirect URI in Spotify dashboard**

1. Go to https://developer.spotify.com/dashboard
2. Click your app → **Edit Settings**
3. Under **Redirect URIs**, add:
   ```
   https://<your-domain>.vercel.app/api/auth/spotify/callback
   ```
4. Click **Save**

- [ ] **Step 3: Verify Spotify works on production**

Visit `https://<your-domain>.vercel.app` → open the **Now Playing** window.
It should show your current or last-played Spotify track.

---

### Task 6: Set up automatic deploys from GitHub (optional but recommended)

Vercel auto-connects to GitHub when you use `vercel --prod`, but confirm it:

- [ ] **Step 1: Check GitHub integration**

Go to https://vercel.com/dashboard → your project → **Settings** → **Git**.
Confirm it shows your `retro-portfolio` GitHub repo connected to the `main` branch.

- [ ] **Step 2: Test auto-deploy**

Make a trivial change locally (e.g., add a space to a comment), commit and push:

```bash
git add -A
git commit -m "chore: test auto-deploy"
git push origin main
```

Go to Vercel dashboard → **Deployments** — a new deployment should appear within 30 seconds.

- [ ] **Step 3: Confirm deployment completes**

Wait ~1 minute. Vercel shows ✅ when done. Visit the production URL and confirm the change is live.

---

## Verification checklist

After all tasks complete:

- [ ] `https://<your-domain>.vercel.app` loads the Win98 desktop
- [ ] Letterboxd window shows diary (RSS) and watchlist (paginated)
- [ ] Now Playing window shows Spotify track
- [ ] `git push origin main` triggers a new Vercel deployment automatically
- [ ] `.env.local` is NOT in the GitHub repo (`gh api repos/<user>/retro-portfolio/contents/.env.local` returns 404)
