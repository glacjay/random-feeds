# Random Feeds (Astro Migration)

Astro SSR migration for Random Feeds, targeting Cloudflare Workers deployment while keeping app logic portable.

## Local development

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm types` | Regenerate Wrangler runtime types (`wrangler types`) |
| `pnpm dev` | Type refresh + Astro dev server |
| `pnpm dev:astro` | Astro dev only (faster, no type refresh) |
| `pnpm build` | Type refresh + production build |
| `pnpm preview` | Type refresh + local preview |
| `pnpm cf:dev` | Build + run Worker locally with Wrangler |
| `pnpm cf:deploy` | Build + deploy to Cloudflare Workers |

## Cloudflare Workers deployment

### 1) Create SESSION KV namespaces

Astro Cloudflare adapter expects a `SESSION` KV binding for session storage.

```bash
pnpm wrangler kv namespace create SESSION
pnpm wrangler kv namespace create SESSION --preview
```

Then add the returned IDs to `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  { "binding": "SESSION", "id": "<PROD_ID>", "preview_id": "<PREVIEW_ID>" }
]
```

### 2) Authenticate Wrangler

```bash
pnpm wrangler login
```

### 3) Deploy

```bash
pnpm cf:deploy
```

## GitHub Actions deployment (Workers)

Use `cloudflare/wrangler-action` and configure repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Free-tier deployment guardrails

From Cloudflare official limits/pricing:

- Workers requests: **100,000/day** (free)
- CPU: **10ms/request** (free model)
- Static assets requests: **free & unlimited**
- Workers KV: **100k reads/day**, **1k writes/day**, **1GB storage**
- Workers Logs: **200k events/day**

This repo keeps observability sampling at `0.1` in `wrangler.jsonc` to reduce free-tier log pressure.
