# Samoba Serverless Portfolio (Cloudflare + React)

Production-ready portfolio platform with a public portfolio site, blog, contact system, and admin dashboard.  
It runs fully serverless on Cloudflare Workers and uses D1 for data, KV for caching, and optional R2 for file storage.

## Maintained By

- **Shawon Hossain Samoba**
- **GitHub:** [@samoba-islam](https://github.com/samoba-islam)
- **Template Purpose:** Production-ready serverless portfolio starter for developers

![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)
![Database](https://img.shields.io/badge/Database-Cloudflare%20D1-FFCC00)

## Overview

This project includes:

- A modern public portfolio homepage (`/`) with sections for hero, about, skills, experience, education, projects, achievements, blog preview, and contact.
- A blog listing page (`/blog`) and blog post detail page (`/blog/:slug`) with markdown content support.
- An admin authentication flow (`/login`) and protected admin panel (`/admin`) for content management.
- A serverless REST API under `/api/*` for all portfolio and dashboard operations.
- Deployment-ready Cloudflare configuration (Workers + static assets + D1 + KV, optional R2).

## What You Can Manage From Admin

Inside `/admin`, the dashboard provides CRUD management for:

- Profile
- Experience
- Education
- Projects
- Skills
- Achievements
- Blog posts (draft/published states)
- Contact messages (read/unread + deletion)
- Admin credentials (email/password update)
- Dashboard stats + recent message summary

## Tech Stack

### Frontend

- React 18 + Vite
- React Router
- React Markdown + `remark-gfm`
- Vanilla CSS (custom design system)
- Theme context (dark/light mode persistence in `localStorage`)

### Backend

- Cloudflare Workers (TypeScript)
- Cloudflare D1 (SQLite at the edge)
- Cloudflare KV (API response caching)
- Optional Cloudflare R2 (file upload and serving)
- JWT-based authentication

## Architecture

- `frontend/dist` is built and served as static assets by Cloudflare.
- Worker handles `/api/*` routes first (`run_worker_first`).
- Public content is fetched from D1.
- Frequently requested resources are cached in KV.
- Admin routes require `Authorization: Bearer <token>`.
- File uploads use R2 when configured.

## Project Structure

```txt
portfolio/
├─ src/                      # Worker backend (TypeScript)
│  ├─ db/                    # schema.sql + seed.example.sql
│  ├─ middleware/            # auth, cache, cors
│  ├─ routes/                # API route handlers
│  ├─ utils/                 # jwt, password, validation, response
│  ├─ index.ts               # router entry point
│  └─ types.ts               # env + model typings
├─ frontend/                 # React + Vite app
│  ├─ src/
│  │  ├─ api/                # API client wrapper
│  │  ├─ components/         # portfolio + admin UI components
│  │  ├─ context/            # auth + theme providers
│  │  └─ pages/              # route pages
│  └─ vite.config.js
├─ .github/workflows/        # CI/CD deployment workflow
├─ wrangler.example.toml     # Cloudflare template config
└─ package.json              # root scripts
```

## API Surface (Summary)

### Public endpoints

- `GET /api/profile`
- `GET /api/experience`
- `GET /api/education`
- `GET /api/projects`
- `GET /api/skills`
- `GET /api/achievements`
- `GET /api/blog`
- `GET /api/blog/:slug`
- `POST /api/contact`
- `GET /api/files/:key` (R2 file serving)

### Auth/admin endpoints

- `POST /api/login`
- `POST /api/setup` (one-time account bootstrap using setup key)
- `PUT /api/admin/settings`
- CRUD: `/api/experience`, `/api/education`, `/api/projects`, `/api/skills`, `/api/achievements`, `/api/blog`
- Contacts admin: `GET /api/contacts`, `PUT /api/contacts/:id/read`, `DELETE /api/contacts/:id`
- Files admin: `POST /api/upload`, `DELETE /api/upload/:key`
- `GET /api/dashboard/stats`

## Prerequisites

- Node.js 18+
- npm
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account

## Quick Start

### 1. Install dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Cloudflare resources

Create resources and keep the generated IDs:

```bash
wrangler d1 create portfolio-db
wrangler kv namespace create CACHE
```

Optional (for file upload support):

```bash
wrangler r2 bucket create portfolio-files
```

### 3. Create `wrangler.toml`

Copy template:

```bash
cp wrangler.example.toml wrangler.toml
```

Update placeholders in `wrangler.toml`:

- `account_id`
- `database_name` and `database_id`
- KV namespace `id`
- `CORS_ORIGIN`

If using R2, add a bucket binding:

```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "portfolio-files"
```

### 4. Set required secret

The Worker requires `JWT_SECRET`:

```bash
wrangler secret put JWT_SECRET
```

Use a long random value in production.

### 5. Initialize database

Create `src/db/seed.sql` from example:

```bash
cp src/db/seed.example.sql src/db/seed.sql
```

Then run:

```bash
npm run db:migrate:local
npm run db:seed:local
```

## Local Development

Run frontend and Worker in separate terminals:

```bash
# terminal 1
npm run dev:frontend

# terminal 2
npm run dev
```

- Frontend: `http://localhost:5173`
- Worker API: local Wrangler URL

## First Admin Login

After seeding example data:

- Email: `admin@example.com`
- Password: `admin123`

Strongly recommended:

- Change credentials immediately from Admin > Settings.
- Replace seed values before production.
- Rotate `JWT_SECRET` for live deployments.

## Build and Deploy

```bash
npm run deploy
```

<<<<<<< HEAD
This command:
=======
---
## 👤 Author

**Shawon Hossain**

- GitHub: [@samoba-islam](https://github.com/samoba-islam)
- Website: [samoba.pages.dev](https://samoba.pages.dev)

---
>>>>>>> e3127824329a4068f54fa9c6b890ff0dc2e04d7f

1. Builds frontend assets.
2. Deploys Worker + assets to Cloudflare.

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys on push to `main`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Available Root Scripts

- `npm run dev` - Run Wrangler locally
- `npm run dev:frontend` - Run Vite frontend
- `npm run build:frontend` - Build frontend assets
- `npm run deploy` - Build frontend + deploy Worker
- `npm run db:migrate` - Apply schema to remote D1
- `npm run db:migrate:local` - Apply schema to local D1
- `npm run db:seed` - Seed remote D1
- `npm run db:seed:local` - Seed local D1
- `npm run db:reset:local` - Local migrate + seed
- `npm run setup:local` - Install deps + reset local DB

## Notes and Best Practices

- Keep `wrangler.toml` and secrets out of public repositories.
- Restrict `CORS_ORIGIN` to your real frontend domain in production.
- R2 is optional; upload endpoints return `503` if R2 is not configured.
- Blog tags are stored as JSON strings; keep a consistent tag format.
- Cache invalidation is already wired for content mutation routes.

## License

Licensed under [GNU GPL v3](LICENSE).
