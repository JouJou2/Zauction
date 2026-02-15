# Deploy Zauction Backend to Railway (with Railway Postgres)

This guide deploys the backend in `zauction-backend/` and uses Railway's managed PostgreSQL database.

## 1) Create a Railway project

1. Go to Railway and create a new project.
2. Add a **PostgreSQL** service (Railway Database feature).
3. Add a **GitHub Repo** service and point the root directory to `zauction-backend`.

## 2) Backend service settings

Railway will use `railway.json` in this folder:

- Build command: `npm install && npm run build`
- Start command: `npm run railway:start`

`railway:start` runs:

- `prisma migrate deploy`
- `node dist/server.js`

So DB migrations apply automatically on deploy.

## 3) Set backend environment variables

In backend service → Variables, set:

- `NODE_ENV=production`
- `PORT=${{RAILWAY_PUBLIC_PORT}}` (optional; Railway usually injects `PORT` automatically)
- `DATABASE_URL=<from Railway Postgres Variables tab>`
- `JWT_SECRET=<strong random string>`
- `FRONTEND_URL=<your frontend URL>`

Optional (if you use these features):

- `GOOGLE_CLIENT_ID`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `EMAIL_OTP_REQUIRED`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `WHATSAPP_OTP_ENABLED`
- `WHATSAPP_BRIDGE_URL`

> `FRONTEND_URL` also supports multiple origins, comma-separated.

## 4) Deploy and verify

After deploy, open:

- `https://<your-backend-domain>/health`

You should see JSON with `status: "ok"`.

## 5) Connect frontend to Railway backend

In `frontend/js/api.js`, API base URL is now configurable in 3 ways (priority order):

1. `window.ZAUCTION_API_BASE_URL`
2. `localStorage['zauction_api_base_url']`
3. `<meta name="zauction-api-base-url" content="...">`

If none are set, it falls back to `http://localhost:3000/api`.

### Quick production setup option

Add this snippet before loading `js/api.js` in your HTML pages:

```html
<script>
  window.ZAUCTION_API_BASE_URL = 'https://<your-backend-domain>';
</script>
```

`/api` is appended automatically if missing.

## 6) One-time browser override (no code change)

You can test immediately in browser console:

```js
localStorage.setItem('zauction_api_base_url', 'https://<your-backend-domain>');
location.reload();
```

## Notes

- Railway Postgres already provides the correct `DATABASE_URL`; use it directly.
- If CORS errors appear, make sure `FRONTEND_URL` exactly matches your frontend origin (protocol + domain, no trailing slash).
