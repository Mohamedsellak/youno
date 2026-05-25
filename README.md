# Youno — Website Intelligence Analyzer

> Analyze any website to extract company info, tech stack, GTM signals, and B2B SaaS fit score — powered by AI enrichment.

## 🌐 Live Demo

**Deployed on Vercel:** [https://youno.vercel.app](https://youno.netlify.app) *(update after deployment)*

---

## ✨ What It Does

Enter any website URL (e.g. `stripe.com`) and Youno will:

1. **Scrape & parse** the homepage HTML to extract metadata, links, and signals
2. **Detect the tech stack** via simple, fast string matching on HTML and headers
3. **Identify GTM signals** — pricing pages, demo CTAs, careers, blog, social links, tracking tools
4. **Enrich via Hunter.io** — discover company email patterns and contacts
5. **Enrich via AI (OpenRouter)** — use an LLM for company classification, industry detection, and size estimation
6. **Compute a B2B SaaS Fit Score** with transparent, rules-based reasoning

---

## 🏛 Live Session Explanation Sheet (Cheat Sheet)

If you are asked to walk through the project in a live session, here is a simple and extremely clear explanation of what is going on:

### 1. The Core Architecture (`app/api/analyze/route.ts`)
*   **Orchestration Pipeline:** When a URL is submitted, the API route handles everything sequentially: rate-limit checks, cache lookups, HTML fetching, HTML parsing, API enrichment (Hunter + LLM in parallel), scoring, and caching.
*   **Parallel Execution:** We use `Promise.all` to run Hunter.io and OpenRouter LLM requests in parallel to minimize response times.
*   **Graceful Degradation:** The pipeline never breaks. If Hunter.io fails (limit reached) or the LLM is rate-limited, the system gracefully continues, returning deterministic metadata scraping and tech stack information.

### 2. URL Normalization & SSRF Protection (`lib/url.ts`)
*   **Normalization:** We clean the URL (e.g., adding `https://` if missing).
*   **Security:** We block SSRF (Server-Side Request Forgery) by explicitly checking and blocking localhost (`127.0.0.1`, `[::1]`), internal metadata domains (`metadata.google.internal`), and private IP subnets (e.g., `192.168.x.x`, `10.x.x.x`).

### 3. High Performance HTML Fetching (`lib/fetchHtml.ts`)
*   **Constraints:** We enforce a `10s` timeout and a `10MB` size ceiling to protect the server from getting stuck on endless streams or memory-intensive heavy resources.

### 4. Simple Tech Detection (`lib/detectTech.ts`)
*   **Explainable Design:** Instead of complex regex libraries or heavy dependencies, we use clean, straightforward case-insensitive string matching (`lowerHtml.includes(...)`). This is extremely fast, highly maintainable, and perfect for live-explaining.

### 5. Smart LLM Enrichment & Fallbacks (`lib/enrich.ts`)
*   **Fallback Chain:** Free LLM endpoints can occasionally be rate-limited. We built an automated model fallback chain that attempts primary `google/gemma-4-31b-it:free`, then tries Llama, DeepSeek, and finally the `openrouter/free` meta-router.
*   **Structured JSON Output:** We instruct the LLM to output pure JSON and use a robust regex parsing fallback in case markdown code blocks (` ```json `) are included in the response.

### 6. Rule-Based SaaS Fit Score (`lib/score.ts`)
*   **Transparent Rules:** The B2B SaaS fit engine assigns points deterministically (+2 for a pricing page link, +2 for demo CTA, +1 for Intercom/HubSpot marketing tools, -2 for Shopify e-commerce markers).

---

## 🏗 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 16 (App Router) | Server-side API routes, React Server Components, Vercel-ready |
| **Language** | TypeScript | Type safety across the full stack |
| **Styling** | Tailwind CSS v4 | Utility-first, dark mode, rapid UI development |
| **Components** | shadcn/ui | Beautiful, accessible, composable UI primitives |
| **Validation** | Zod | Schema validation for API inputs |
| **Scraping** | Cheerio | Fast server-side HTML parsing (no headless browser needed) |
| **LLM** | OpenRouter API | Access to free models (Google Gemma, Llama, DeepSeek) |
| **Email Intel** | Hunter.io API | Domain email discovery |
| **Deployment** | Vercel | Zero-config deployment for Next.js |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/youno.git
cd youno

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Run the dev server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key from [OpenRouter](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | No | LLM model ID (default: `google/gemma-4-31b-it:free`) |
| `HUNTER_API_KEY` | No | API key from [Hunter.io](https://hunter.io/api-keys) — app works without it |
| `APP_RATE_LIMIT_MAX` | No | Max requests per window (default: 10) |
| `APP_RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 600000 = 10min) |

---

## 📁 Project Structure

```
youno/
├── app/
│   ├── api/analyze/route.ts    # POST /api/analyze — main pipeline
│   ├── globals.css             # Tailwind + shadcn theme
│   ├── layout.tsx              # Root layout (dark mode, SEO)
│   └── page.tsx                # Home page (server component)
├── components/
│   ├── analyzer-client.tsx     # Interactive form + results (client component)
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── types.ts               # TypeScript types & data models
│   ├── validate.ts            # Zod input validation
│   ├── url.ts                 # URL normalization + SSRF protection
│   ├── fetchHtml.ts           # HTML fetcher (timeout, size limit)
│   ├── extractSignals.ts      # Cheerio-based signal extraction
│   ├── detectTech.ts          # Tech stack detection (simple string checks)
│   ├── hunter.ts              # Hunter.io API client
│   ├── enrich.ts              # OpenRouter LLM enrichment with fallbacks
│   ├── score.ts               # B2B SaaS fit score calculator
│   ├── rateLimit.ts           # In-memory rate limiter (IP tracking Map)
│   ├── cache.ts               # In-memory TTL cache (Map + TTL)
│   └── utils.ts               # shadcn utility (cn)
├── .env.example
├── README.md
└── TODO.md
```

---

## 🔒 Security

- **SSRF Protection**: Blocks localhost, private IPs (10/8, 192.168/16, 172.16/12), .local domains
- **Rate Limiting**: In-memory sliding window (10 req / 10 min per IP)
- **Size Limits**: 10MB max HTML response, 10s fetch timeout
- **No Client Secrets**: All API keys are server-side only
- **Input Validation**: Zod schema validation on all inputs

---

## ⚠️ Current Limitations

- **In-memory cache/rate-limit**: Resets on server restart. Not suitable for multi-instance deployments (use Redis in production).
- **Single page scraping**: Only analyzes the homepage HTML. Sub-pages are not crawled.
- **JavaScript-heavy sites**: Uses Cheerio (no JS execution). Sites that render entirely client-side may yield limited results.
- **Free LLM models**: May have rate limits, slower responses, or lower quality vs. paid models.
- **Hunter.io free plan**: Limited to 25 requests/month.

---

## 📄 License

MIT
