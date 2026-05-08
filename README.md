# ClientFlow Ops

ClientFlow Ops is a delivery operations dashboard for teams managing multiple client projects.  
It combines pipeline tracking, risk visibility, progress management, and portfolio-level metrics in one interface.

## Stack

- React 19
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Vite
- ESLint

## Run locally

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a repo named `clientflow-studio` (or update `base` in `vite.config.js` if repo name differs).
2. Push this project to GitHub.
3. Run:

```bash
npm run deploy
```

4. In GitHub repo settings, ensure Pages is set to serve from `gh-pages` branch.

## Key capabilities

- Pipeline board with status progression workflow
- Search, filtering, and sorting across active projects
- Risk, budget, and progress tracking with portfolio KPIs
- Persistent local state for a stable operations workspace
