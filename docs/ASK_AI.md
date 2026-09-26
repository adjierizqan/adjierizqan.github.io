# Adjie Workspace Ask AI

The static portfolio calls an isolated Cloudflare Worker at `POST /ask`. The Worker adds the curated context from `data/portfolio-ai-context.json` and streams a response from the Workers AI binding `AI` using `@cf/zai-org/glm-4.7-flash`. No credentials are shipped to the browser.

## Cloudflare setup

1. Install or run a current Wrangler release from `cloudflare/ask-worker`.
2. Review `wrangler.jsonc`. Set `ALLOWED_ORIGINS` to the exact production portfolio origin and the local origins you use. The committed value includes `https://adjierizqan.github.io`, `http://localhost:3000`, and `http://localhost:4174`.
3. Keep the Workers AI binding named `AI` and the native rate-limit binding named `RATE_LIMITER`. Use a rate-limit namespace ID that is unique within the Cloudflare account if `11001` is already in use.
4. Run locally with `npx wrangler dev --config cloudflare/ask-worker/wrangler.jsonc` from the repository root.
5. Deploy explicitly with `npx wrangler deploy --config cloudflare/ask-worker/wrangler.jsonc`. Deployment is intentionally separate from the static site build.

Configure the frontend before `next build`:

```text
NEXT_PUBLIC_ASK_API_URL=https://<worker-hostname>
```

This is a public endpoint URL, not a credential. If it is absent or the Worker is unavailable, the Workspace keeps project browsing, résumé, and contact available and displays a concise fallback state.

## Contract

`POST /ask` accepts `{ message, projectId?, history? }`. Messages are limited to 800 characters and history to six user/assistant messages. The Worker restricts browser origins, caps the body and model output, uses the Cloudflare-native rate limiter, and returns Workers AI server-sent events without storing conversation data.
