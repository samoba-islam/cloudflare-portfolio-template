# Frontend Standalone Deploy (Cloudflare Pages)

This frontend is configured to run as a standalone Cloudflare Pages app and use the existing Worker backend.

## API Target

Production builds read `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://samoba-portfolio.shawon-hossain-env.workers.dev/api
```

For local override, copy `frontend/.env.example` to `frontend/.env.local` and set your own Worker URL.

## Cloudflare Pages Settings

- Framework preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build:pages`
- Build output directory: `dist`

## Local Verification

```bash
cd frontend
npm install
npm run build:pages
npm run preview:pages
```

Then open `http://localhost:4173`.
