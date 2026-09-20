# PortfoliOS

My interactive 3D portfolio, built as a functional operating-system interface: a real desktop
environment with a Unix-style terminal, draggable/resizable windows, and a dock, sitting in front
of a 3D room you can step into and look around.

Originally built in Unity/WebGL; rewritten as a Next.js + Three.js web app for a fraction of the
load size and no game-engine runtime overhead — meaningfully faster to load and run, especially
on phones and lower-end desktops.

**Live:** [pradyum.vercel.app](https://pradyum.vercel.app)

## Features

### macOS-style desktop

- Draggable, resizable windows with real traffic-light controls (close/minimize/maximize)
- A dock and menu bar with a live clock
- Selectable wallpapers (including a custom upload), reflected both on the desktop and on the
  monitor screen inside the 3D room
- On mobile, windows open maximized (a floating window manager doesn't fit a phone screen) and
  the whole page force-rotates into landscape via CSS, since iOS Safari doesn't support the
  Screen Orientation Lock API

### Terminal

A from-scratch Unix-style shell: `help`, `about`, `education`, `experience`, `skills`,
`achievements`, `techstack`, `hackathons`, `projects`, `resume`, `github`, `linkedin`, `whoami`,
`fortune`, `sudo`, `reboot`, `exit`, `escape` (or press <kbd>Esc</kbd>), plus the usual
`uname`/`date`/`uptime`/`hostname`/`pwd`/`ls`/`cat`/`echo`. Command history persists across
sessions.

### Explore mode

Press <kbd>Esc</kbd> to leave the desktop and freely look around the 3D room (drag to rotate).
The room model is Draco/WebP-compressed to a fraction of its original size for fast loading.

### Live project & hackathon data

- GitHub pinned repos fetched live via the GraphQL API (falls back to a static snapshot if no
  token is configured)
- Custom projects (not on GitHub, private, or hosted elsewhere) can be added manually
- Hackathon wins, work experience, education, skills, and tech stack are all editable

### Admin panel (`/admin`)

Everything above that used to be hardcoded — resume link, bio, hackathons, work experience,
education, tech stack, skills, achievements, and which GitHub projects to show — is editable
through a password-free admin panel gated by GitHub OAuth, restricted to a single allowed
account. No more editing a backend endpoint to change the resume link.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **3D:** Three.js via react-three-fiber
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Auth:** Auth.js (GitHub OAuth, single-account allowlist)
- **Content storage:** Upstash Redis (via the Vercel Marketplace), with a JSON file fallback
- **Deployment:** Vercel, auto-deploying on push to `main`

## Project structure

```
web/
├── src/
│   ├── app/                # Routes: /, /admin, /admin/login, API routes
│   ├── components/
│   │   ├── os/              # Desktop, windows, terminal, dock, menu bar
│   │   ├── scene/            # Three.js room, camera rig, lighting
│   │   └── admin/            # Admin dashboard UI
│   ├── lib/                 # Content loading, GitHub API, KV, wallpapers
│   ├── store/                # Zustand app state (windows, mode, settings)
│   └── auth.ts               # Auth.js config
├── content/
│   └── site-data.json        # Default content (fallback when KV isn't configured)
└── public/
    ├── models/                # Compressed 3D room (glb)
    └── wallpapers/            # Wallpaper presets
```

## Local development

```bash
cd web
npm install
npm run dev
```

Copy `web/.env.example` to `web/.env.local` and fill in:

- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — a GitHub OAuth App (for `/admin` login)
- `ALLOWED_GITHUB_LOGIN` — the only GitHub username allowed to sign in
- `AUTH_SECRET` — generate with `npx auth secret`
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — an Upstash Redis store (via Vercel's Storage →
  Marketplace), for saving admin edits
- `GITHUB_TOKEN` — optional, a token with no scopes checked, for live pinned-repo data

Without `KV_REST_API_URL`/`KV_REST_API_TOKEN`, the site still runs fine off
`web/content/site-data.json`, but `/admin` saves will fail. Without `GITHUB_TOKEN`, the Projects
window falls back to `web/content/github-fallback.json`.

## Deployment

Deployed on Vercel with the project's **Root Directory** set to `web` (this is a monorepo — the
Next.js app doesn't live at the repo root). Auto-deploys on every push to `main`.

## Contact

**Pradyum Mistry**

- GitHub: [@altf4-games](https://github.com/altf4-games)
- LinkedIn: [pradyum-mistry](https://linkedin.com/in/pradyum-mistry)

## License

This project is available under the [MIT License](LICENSE).
