# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies (uses pnpm)
pnpm dev              # Regenerate Wrangler types + Astro dev server
pnpm dev:astro        # Astro dev only (faster, skips type refresh)
pnpm build            # Regenerate Wrangler types + production build
pnpm preview          # Regenerate Wrangler types + local preview
pnpm types            # Regenerate Wrangler runtime types only
pnpm cf:dev           # Full build + run Worker locally with Wrangler
pnpm cf:deploy        # Full build + deploy to Cloudflare Workers
```

There are no lint or test scripts currently configured.

## Architecture

**Stack**: Astro SSR (`output: 'server'`) with React islands (`@astrojs/react`), deployed to Cloudflare Workers via `@astrojs/cloudflare`. Styling: Tailwind CSS + shadcn/ui (Radix Nova style). Package manager: pnpm.

**External API**: The app is a frontend for a [BazQux](https://bazqux.com) (Fever/Google Reader-compatible RSS) account. All data comes from `https://bazqux.com` proxied through `src/lib/api.ts`. Authentication uses GoogleLogin tokens stored in httpOnly cookies.

### Route structure

| Route | Purpose |
|---|---|
| `/` (index) | Lists folders with unread counts + recently read section |
| `/folder?id=...` | Shows random unread items from a folder; "Reload All" / "Load More" buttons regenerate the batch |
| `/item?id=...&folderId=...` | Full article view with mark-as-read, open-original, remove actions |
| `/login` | Login form (ClientLogin auth against BazQux) |
| `/recently` | List of recently read items (from cookie) |
| `/broken-feeds` | Randomly samples subscriptions to find feeds that don't return HTTP 200 |
| `/api/login` | POST — authenticates, sets token cookie |
| `/api/load-random-items` | POST — core algorithm for selecting random unread items from a folder |
| `/api/mark-as-read` | POST — marks item read via API, updates folder cache + recently-read cookies |
| `/api/remove-item` | POST — removes item from folder cache cookie only |

### Data flow pattern

Pages fetch data server-side in Astro frontmatter (`---` blocks) using functions from `src/lib/data.ts`, then render Astro templates with React interactive islands (`client:load` / `client:visible`). API routes handle mutations that update cookies and call the BazQux API.

### Cookie-based state

- `token` — GoogleLogin auth token (httpOnly, 1 week)
- `localRandomItemIds:{folderId}` — Per-folder cache of item IDs to show (httpOnly, 1 week)
- `recentlyReadItemIds` — Last 42 recently read item IDs (httpOnly, 1 week)
- `sessionStorage` key `refresh-folder-on-back` — Flag so folder page reloads after navigating back from an item

### Random item selection (`/api/load-random-items`)

The algorithm in `src/pages/api/load-random-items.ts`:
1. Gets all subscriptions in the folder that have unreads
2. Selects 7 subscriptions (`LOADING_COUNT`) using weighted random sampling biased toward higher unread counts
3. For each selected subscription, fetches both oldest and newest unread item IDs from the BazQux API
4. Samples items from each subscription (proportional to log-scaled unread count), shuffles, deduplicates
5. Stores the resulting item ID list in a cookie, returns full item details

### Key libraries

- **shadcn/ui** components live in `src/components/ui/` (Button, Card, Input, Label)
- **dayjs** for date formatting
- **react-toastify** for toast notifications
- **react-error-boundary** wraps the app in `GlobalProviders.tsx`
- **class-variance-authority** + **tailwind-merge** + **clsx** for the `cn()` utility in `src/lib/utils.ts`
- **LXGW WenKai** font for body text (`src/styles/global.css`)
