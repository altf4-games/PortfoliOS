# PortfoliOS

My interactive 3D portfolio, built as a working operating-system interface: three switchable
desktops (macOS-style Golden Gate, Retro 98 and Hyprland) with a Unix-style terminal, fourteen
apps and draggable windows, sitting in front of a 3D room you can step into and look around.
Phones get their own phone OS.

Originally built in Unity/WebGL; rewritten as a Next.js + Three.js web app for a fraction of the
load size and no game-engine runtime overhead — meaningfully faster to load and run, especially
on phones and lower-end desktops.

**Live:** [pradyum.vercel.app](https://pradyum.vercel.app)

## Features

### Three desktops, one set of apps

Every app is written once and restyled by the active desktop. Switch from Settings, the logo
menu, the Start menu, the launcher, or `theme <name>` in the terminal; each switch plays that
system's own boot sequence.

| Desktop | Look | Details |
| --- | --- | --- |
| **Golden Gate** (default) | macOS 27-style, frosted Liquid Glass | Menu bar with logo menu and Control Center, Spotlight (<kbd>⌘K</kbd>), a magnifying Dock with adjustable size, traffic-light windows that minimize into the Dock |
| **Retro 98** | Pixel-perfect late-90s desktop | Bevelled windows, taskbar with a Start menu (Programs, Find, Switch Desktop, Shut Down), 16×16 pixel icons, BIOS POST boot, optional CRT scanlines |
| **Hyprland** | Riced Linux tiling WM | Dwindle tiling, Waybar, five workspaces, rofi-style launcher, systemd boot log, keyboard-driven |

Hyprland keybinds use <kbd>Alt</kbd> in place of Super, since browsers swallow the Super key:
<kbd>Alt</kbd>+<kbd>Enter</kbd> terminal, <kbd>Alt</kbd>+<kbd>D</kbd> launcher,
<kbd>Alt</kbd>+<kbd>Q</kbd> close, <kbd>Alt</kbd>+<kbd>F</kbd> fullscreen,
<kbd>Alt</kbd>+<kbd>1–5</kbd> workspaces, <kbd>Alt</kbd>+arrows to move focus.

On first boot, About Me opens centred on the desktop.

### Apps

About Me · Projects · Experience · Open Source · Trophies · Games · Coding Stats · Research ·
Resume · Files · Terminal · Music · Arcade · Settings

- **Open Source** lists merged PRs pulled straight from GitHub search: nothing to enter by hand.
  Individual PRs or whole repos can be hidden from `/admin`.
- **Games** scrapes the itch.io profile live, with covers and links.
- **Coding Stats** pulls LeetCode, Codeforces, CodeChef and GitHub numbers live.
- **Research** holds publications; **Projects** adds case studies alongside pinned repos.
- **Arcade** is a small stacking game. **Music** plays a CC0 lo-fi playlist ([HoliznaCC0, *Winter Lofi*](https://freemusicarchive.org/music/holiznacc0/winter-lofi)) with a live visualizer.
- **Settings** has desktop previews, per-desktop wallpapers (plus a custom upload), glass
  frost, Dock size and magnification, CRT, volume, a 3D toggle, and easter-egg progress.

Every live source falls back to a committed snapshot, so the site never shows an empty window.

### Terminal

Still the centrepiece, with every original command intact: `help`, `about`, `whoami`,
`education`, `experience`, `skills`, `techstack`, `achievements`, `hackathons`, `projects`,
`resume`, `github`, `linkedin`, `fortune`, `sudo`, `reboot`, `exit`, `escape`, and
`uname`/`version`/`date`/`uptime`/`hostname`/`pwd`/`ls`/`cat`/`echo`.

New in v3: `neofetch`, `oss`, `games`, `stats`, `open <app>`, `theme <name>`, `explore`, `eggs`,
`cowsay`, `matrix`, `hire-me`, `history`, `cd`, `vim`/`nvim`/`emacs`, plus a few hidden ones. Tab
completion, a theme-aware prompt (zsh-style, `C:\PORTFOLIO>` or a `❯` prompt), and history persisted across
visits.

### Phone OS

Phones get a dedicated phone OS in the Golden Gate style rather than a shrunken desktop: a lock
screen you swipe up, a home screen with a profile widget and Dock, apps that zoom open from
their icon, and a swipe-up home gesture. It shares the same apps and data as the desktop.

### 3D room

- A camera intro sweeps across the room and pushes into the monitor before the desktop boots
- The monitor shows the current wallpaper, and the wall TV shows Fragments of Fear
- Press <kbd>Esc</kbd> (or the cube in the Dock) to step out: drag to look around, scroll to
  zoom, and click the hotspots on objects in the room to open the matching app
- Lighting follows the active desktop: warm dusk, CRT glow, or a slow RGB cycle for Hyprland
- Rendering pauses entirely while the desktop covers the room, and degrades gracefully on slow
  GPUs. The room model is Draco/WebP-compressed.

Sound starts muted (volume 0) and the music only plays once you turn it up.

### Easter eggs

Fourteen of them, from the classics to a few that only make sense once you've explored the room.
Settings tracks how many you've found, and `eggs` in the terminal hands out hints.

### Wallpapers

High-resolution wallpapers per desktop: San Francisco and fog photography for Golden Gate,
night skies and neon for Hyprland (both from [Unsplash](https://unsplash.com), with the photographer
credited on hover in Settings), and 16-colour pixel art for Retro 98.

### Admin panel (`/admin`)

Gated by GitHub OAuth and restricted to a single account. Edits everything the site shows:
profile, bio, resume link, experience (with bullets), education, skills, tech stack,
hackathons, achievements, case studies, publications, and which GitHub projects appear. It also
shows the auto-fetched PR list with per-PR hide toggles and excluded repos, takes extra PRs by
hand, and can reset content to the repository defaults.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **3D:** Three.js via react-three-fiber, drei and postprocessing
- **Animation:** Motion
- **Styling:** Tailwind CSS v4, with a `data-theme` token layer that restyles every app per desktop
- **State:** Zustand (persisted settings)
- **Auth:** Auth.js (GitHub OAuth, single-account allowlist)
- **Content storage:** Upstash Redis (via the Vercel Marketplace), with a JSON file fallback
- **Deployment:** Vercel, auto-deploying on push to `main`

## Project structure

```
web/
├── src/
│   ├── app/                # Routes: /, /admin, API routes (github-prs, games, stats, resume)
│   ├── apps/               # The apps, written once, plus icons and the app registry
│   ├── themes/
│   │   ├── golden/          # Golden Gate shell: menu bar, Dock, Spotlight, windows
│   │   ├── retro/           # Retro 98 shell: taskbar, Start menu, bevelled windows
│   │   └── hypr/            # Hyprland shell: tiling, Waybar, launcher
│   ├── components/
│   │   ├── os/              # Shared desktop: boot screens, effects, toasts, drag logic
│   │   ├── phone/           # Phone OS
│   │   ├── scene/           # Three.js room, camera rig, lighting, hotspots
│   │   └── admin/           # Admin dashboard UI
│   ├── lib/                # Content, GitHub/itch/stats fetchers, wallpapers, easter eggs
│   ├── store/              # Zustand app state (windows, workspaces, settings)
│   └── auth.ts             # Auth.js config
├── content/                # Default content and live-data snapshots
└── public/
    ├── models/             # Compressed 3D room (glb)
    ├── scene/              # Textures for the room (TV)
    └── wallpapers/         # golden/, retro/, hypr/
```

## Local development

```bash
cd web
npm install
npm run dev
```

Copy `web/.env.example` to `web/.env.local` and fill in:

- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`: a GitHub OAuth App (for `/admin` login)
- `ALLOWED_GITHUB_LOGIN`: the only GitHub username allowed to sign in
- `AUTH_SECRET`: generate with `npx auth secret`
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: an Upstash Redis store (via Vercel's Storage →
  Marketplace), for saving admin edits
- `GITHUB_TOKEN`: optional, a token with no scopes checked. It raises rate limits for pinned
  repos, merged PRs and GitHub stats.

Without the KV variables the site runs off `web/content/site-data.json`, but `/admin` saves will
fail. Without `GITHUB_TOKEN`, PRs and repos come from the public REST API, then from the
snapshots in `web/content/`. If KV already holds content from v2, use **Reset to repository
defaults** in `/admin` once to pick up the new fields.

## Deployment

Deployed on Vercel with the project's **Root Directory** set to `web` (this is a monorepo — the
Next.js app doesn't live at the repo root). Auto-deploys on every push to `main`.

## Contact

**Pradyum Mistry**

- GitHub: [@altf4-games](https://github.com/altf4-games)
- LinkedIn: [pradyum-mistry](https://linkedin.com/in/pradyum-mistry)

## License

This project is available under the [MIT License](LICENSE).
