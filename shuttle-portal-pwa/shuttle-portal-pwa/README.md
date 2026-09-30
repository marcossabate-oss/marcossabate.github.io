# Shuttle Portal — Installable App Shell

## Why this exists (read this first)

Google Apps Script web apps (`script.google.com/.../exec`) are served inside a
sandboxed iframe that **Google controls**, not you. Because of that, there's
no way to attach an installable manifest/service worker directly to your
Apps Script URL — browsers only offer "Install app" for a manifest+service
worker on a page **you** host at a real top-level address.

This folder is that page: a tiny "shell" that fills the screen with your
live Apps Script app in an iframe. It's installable, opens with no browser
address bar, and shows an app icon on the home screen — but every screen you
see inside it is still your real Apps Script app, live, reading and writing
the same Google Sheet as always. Nothing about your Sheets backend changes.

Two shells are included, `driver/` and `admin/`, so each can have its own
name/icon on the home screen. Both simply load the **same** Apps Script URL
— your app already shows the right screen (Driver Portal vs Admin Dashboard)
based on who's logged in, so there's nothing else to configure per-role here.

**One limitation to know:** this only works with a live internet connection.
If a driver is offline, they'll see a friendly "You're offline" screen
instead of the app — there's no offline trip logging. Making that work would
mean rebuilding the trip form to queue submissions locally and sync later,
which is a much bigger project than wrapping the existing app.

## 1. Set your Apps Script URL

Open `config.js` and replace the placeholder with your deployment's `/exec`
URL (Apps Script editor → Deploy → Manage deployments):

```js
const APP_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Both `driver/index.html` and `admin/index.html` read from this one file.
**Redo this step any time you create a new deployment** — Apps Script gives
each one a new URL. (Editing an *existing* deployment's code without making
a new deployment keeps the same URL, so day-to-day code updates don't
require touching this file again.)

## 2. Host these files somewhere with a real HTTPS address

Any static host works. Easiest for most people: **GitHub Pages**, free, no
command line needed.

1. Create a new GitHub repository (public or private both work for Pages on
   a paid plan; use **public** if you're on GitHub's free plan).
2. Upload everything in this folder to the repo (drag-and-drop on the GitHub
   web UI works fine — keep the folder structure: `driver/`, `admin/`,
   `icons/`, `config.js`, `sw.js`, `index.html`).
3. Repo → **Settings → Pages** → Source: "Deploy from a branch" → Branch:
   `main` / `(root)` → Save.
4. GitHub gives you a URL like `https://yourname.github.io/repo-name/`.
   Open it — you should see the "Shuttle Portal" chooser page.

(Firebase Hosting or Netlify work just as well if you already use one of
those — same idea: upload this folder, no build step needed.)

## 3. Install it on a phone

Share the two direct links with people, e.g.:

- Drivers: `https://yourname.github.io/repo-name/driver/`
- Admins/Managers: `https://yourname.github.io/repo-name/admin/`

**Android (Chrome):** open the link → tap the ⋮ menu → **"Install app"** (or
Chrome may show an "Install" banner automatically). The icon appears on the
home screen/app drawer and opens full-screen, no browser bar.

**iPhone/iPad (Safari):** open the link → tap the **Share** icon → **"Add to
Home Screen"**. (Safari doesn't show an auto-install prompt like Chrome
does — this manual step is the only way on iOS, and it still gives a proper
full-screen app icon.)

## 4. Updating later

- **App code changes** (anything in your Apps Script project): just deploy
  as usual. Since both shells always load the live URL fresh, changes show
  up immediately — nobody needs to reinstall anything.
- **Shell changes** (icons, colors, this folder's files): re-upload to
  GitHub/your host, then bump `CACHE_NAME` in `sw.js` (e.g. `v1` → `v2`) so
  installed apps pick up the new version instead of serving a cached copy.

## Icons

`icons/*.png` are placeholders (a dark card with "DP"/"AP" in your brand
colors) so this works out of the box. Swap them for your real logo whenever
you like — keep the same filenames and sizes (192×192, 512×512, plus the
"-maskable" variants with extra padding, and 180×180 for iOS) and everything
else here keeps working unchanged.
