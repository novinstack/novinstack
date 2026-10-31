# NovinStack Assistant — Cloudflare Workers AI (Free)

The chat API runs with Cloudflare's native Workers AI binding; it does **not** require an OpenAI API key.

Deploy with `npm install && npx wrangler deploy`, set `TURNSTILE_SECRET_KEY` using `npx wrangler secret put TURNSTILE_SECRET_KEY`, and configure the public Worker URL and Turnstile site key in `docs/config.js`.

The Workers Free plan includes a daily Workers AI allocation (currently 10,000 neurons/day). It is not unlimited; quota exhaustion returns HTTP 429 with `code: DAILY_LIMIT`. Stay on the Free plan to avoid usage charges. Turnstile is not a substitute for rate limiting. Brand facts are curated in `src/knowledge.js`.

Documentation: https://developers.cloudflare.com/workers-ai/platform/pricing/
