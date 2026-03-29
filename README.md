# Serverless Portfolio Template

A modern, high-performance, fully serverless portfolio platform built entirely on the Cloudflare developer ecosystem. Designed for developers looking for a fast, resilient, and virtually free way to host their professional presence.

![Open Source](https://img.shields.io/badge/Open%20Source-GPLv3-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat&logo=cloudflare&logoColor=white)

## ✨ Features
* **Lightning Fast:** Serves content globally from the edge using Cloudflare Workers.
* **Serverless Backend:** Built with Hono/TypeScript directly onto Cloudflare's edge network.
* **Integrated Database:** Utilizes Cloudflare D1 (Serverless SQL Database) with automated local migrations.
* **Edge Caching:** Cloudflare KV Namespace support for extremely fast reads and caching.
* **Dynamic Frontend:** Built top-to-bottom in React using Vite, featuring dynamic dynamic theme options and smooth animations.
* **Admin Dashboard:** Access your personalized dashboard at `/admin` to modify your profile, read contact forms, manage blog posts, and easily update credentials.

## 🛠 Tech Stack

**Frontend:**
- **React.js** (Vite) for fast rendering & building
- Vanilla CSS and CSS grid architecture for ultra-lightweight styling
- React Router DOM for simple native navigation

**Backend:**
- **Cloudflare Workers** handles all API connections & edge logic natively
- **Cloudflare D1** (SQLite edge structure) for persistent relational data 
- **Cloudflare KV** for key-value pair state management and caching
- **TypeScript** ensures robust, typed integrations

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed via `npm install -g wrangler`
- A free [Cloudflare Account](https://dash.cloudflare.com/sign-up)

### 2. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/portfolio-template.git
cd portfolio-template

# Securely install all dependencies (backend & frontend)
npm install
cd frontend && npm install && cd ..
```

### 3. Configure Cloudflare Resources
You must tell Cloudflare to generate the respective resources so the application can communicate correctly.
Run the following commands using the terminal:

1. **Create the D1 Database:**
   ```bash
   wrangler d1 create portfolio-db
   ```
   *Take note of the `database_id` returned by this command.*

2. **Create the KV Namespace:**
   ```bash
   wrangler kv:namespace create "CACHE"
   ```
   *Take note of the `id` returned by this command.*

### 4. Create your `wrangler.toml` file
We provide a sanitized generic template because you shouldn't commit your credentials.
1. Copy the `wrangler.example.toml` template into `wrangler.toml`:
   ```bash
   cp wrangler.example.toml wrangler.toml
   ```
2. Open `wrangler.toml` and replace:
   - `<YOUR_CLOUDFLARE_ACCOUNT_ID>` with your Cloudflare Account ID (located in your Cloudflare dashboard under Workers & Pages » Overview).
   - `<YOUR_DATABASE_ID>` with the ID generated in Step 3.
   - `<YOUR_KV_NAMESPACE_ID>` with the ID generated in Step 3.
   - `<YOUR_CUSTOM_DOMAIN_OR_PAGES_DEV>` with your frontend domain so CORS headers run natively.

### 5. Setup your Seed Configuration
1. Initialize the table logic for your database by running migrations.
   ```bash
   npm run db:migrate:local
   ```
2. Copy `src/db/seed.example.sql` and name it `src/db/seed.sql` to populate it with customized database models. 
3. After editing `seed.sql` with your credentials, name, and background:
   ```bash
   npm run db:seed:local
   ```
> **Note:** The default generated admin email is `admin@example.com` and the default password hash resolves to `admin123`. We recommend generating your own password hash using the `src/utils/password.ts` logic.

### 6. Test Locally Built
To run both the serverless backend and the React frontend simultaneously:
```bash
# Start frontend process
cd frontend
npm run dev

# Open a new terminal to spin up local wrangler container
wrangler dev
```

### 7. Deployment
Deploy everything globally across Cloudflare's network:
```bash
npm run deploy
```

---

## 👩‍💻 Standard Customization
You can log into `[your-deployed-domain]/admin` to easily edit Experience, Education, Technical Skills, and personal Profile data without editing the codebase.

## 📄 License
This project is officially licensed under the [GNU General Public License v3.0 (GPLv3)](LICENSE). You are free to redistribute, study, and modify the system entirely as long as derivative networks stay open-source.
