# Resona AI — Employees

Standalone Next.js app. Own git repo — own branches (usually `main`).

## Local setup

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev
```

App: http://localhost:3001  
Requires `resona-ai-be` on port 4000.

## Production env

```bash
cp .env.production.example .env.production
# edit NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

| File | Use |
|------|-----|
| `.env.local` | Local `npm run dev` |
| `.env.production` | Local `npm run build` / `npm start` |
| Vercel env vars | Deployed Production (same key as above) |

On Vercel, set **Production**:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

Then rebuild so the value is embedded in the client bundle.

Also allow this app’s origin in the API `CORS_ORIGINS` (e.g. `https://employees.your-domain.com`).
