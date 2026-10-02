# LedgerMind — Financial Annual Report Chatbot (Frontend)

A Next.js App Router financial research workspace for public-company filings in the United States and India, with interactive Q&A, cited sources, a live SEC EDGAR explorer, and an NSE India company and announcements explorer.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the global market selector. Choose [United States](http://localhost:3000/us) for SEC EDGAR, [India](http://localhost:3000/india) for NSE India, or [Workspace](http://localhost:3000/workspace) for chat. Chat uses the RAG backend by default; set `NEXT_PUBLIC_USE_DEMO=true` to use placeholder answers instead.

Production build and server:

```bash
npm run build
npm start
```

## SEC EDGAR explorer

The top navigation includes a live SEC EDGAR explorer for U.S. public companies. Search by company name, ticker, or CIK to see the registrant profile, annual SEC-reported XBRL facts (revenue, net income, operating cash flow, assets, equity, cash, debt and diluted EPS), recent 10-K/10-Q/8-K/proxy filings, and links to original SEC documents. The explorer also includes quick ticker searches and a shortcut to ask LedgerMind about the selected company.

EDGAR data is requested by the server, not directly by the browser: `data.sec.gov` does not support browser CORS. The development server serves `/api/sec/*` automatically. For a deployed server, set `SEC_USER_AGENT` to an application name and a monitored contact email, for example `LedgerMind contact: analyst@example.com`, as requested by SEC developer guidance. SEC data is public and does not need an API key. Financial facts are informational; verify material values in the original filings.

## India market explorer

The India workspace is sourced from official NSE company, index, board-calendar, announcement and annual-report feeds. All data retrieval and PDF delivery run through server-side LedgerMind routes; the company UI does not send the user away to NSE pages. PDFs present in the latest annual-report feed are streamed into the in-app reader/download. If a report is not available for a symbol in that feed, it is marked pending rather than redirecting elsewhere. Other announcement, financial-results and shareholding readers are marked in progress. NSE listings/disclosures do not supply the same standardized company-facts API as SEC XBRL; India filings are shown as issuer-provided documents instead of being presented as comparable API facts.

The India market monitor reads NSE live-index and board-meeting feeds through the LedgerMind server. The upcoming-results panel only includes future calendar entries whose purpose or agenda states financial results; a board meeting is a scheduled consideration date, not a guarantee that results will be released that day.

The U.S. market panel includes S&P 500, Nasdaq Composite, Dow Jones Industrial Average and Russell 2000 quote snapshots via Yahoo Finance, refreshed about once a minute and labeled with the upstream quote timestamp. This is **not** licensed real-time exchange data; the SEC EDGAR service does not publish a centralized upcoming earnings calendar, so no U.S. result dates are inferred or invented. Use the linked index and company filing sources to confirm values and schedules.

The Next.js `/api/nse/*` routes access NSE data server-side, cache the company master for six hours and the announcement RSS feed for five minutes, and do not require browser-side exchange credentials. Exchange rules and upstream availability apply; verify each filing at NSE India. LedgerMind is independent and is not endorsed by NSE or SEC.

## Deploy (Render)

1. Push this repo to GitHub (`origin` is already set).
2. On [Render](https://dashboard.render.com/static/new), connect the repo.
3. The included Blueprint builds and runs the Next.js Node web service (`npm start`) to serve the site and SEC API route handlers.
4. Set the required `SEC_USER_AGENT` environment variable in Render to your application name and monitored contact email.
5. Keep `NEXT_PUBLIC_USE_DEMO=false` and set `RAG_API_BASE_URL` to your RAG API URL in Render. The Blueprint prompts for this value because it is deployment-specific. The browser calls the same-origin `/api/chat` route so CORS is avoided; only enable direct browser access if your upstream service explicitly supports CORS.

Use the included `render.yaml` blueprint when creating a Blueprint from the repo; the SEC route handlers require the Node web service rather than a static-only site.

## Connect your RAG backend

1. Copy `.env.example` to `.env` and set `RAG_API_BASE_URL` to your backend URL. Demo mode is disabled by default.
2. Run your API on **port 8000** or set `RAG_API_BASE_URL` to your API URL.

### Expected API

**POST** `/api/chat`

Request:

```json
{
  "message": "What drove revenue growth?",
  "conversationId": "optional-session-id",
  "reportIds": ["fy24"]
}
```

Response:

```json
{
  "reply": "Markdown answer text…",
  "conversationId": "session-id",
  "sources": [
    {
      "id": "chunk-1",
      "title": "Annual Report 2024 — MD&A",
      "page": 12,
      "reportYear": 2024,
      "snippet": "Optional excerpt…"
    }
  ]
}
```

Optional streaming: **POST** `/api/chat/stream` — newline-delimited JSON with `{ "token": "…" }` or `{ "delta": "…" }`. If streaming fails, the client falls back to `/api/chat`.

The same-origin Next.js `/api/chat` and `/api/chat/stream` routes proxy requests to `RAG_API_BASE_URL` (default: `http://localhost:8000`). Leave `NEXT_PUBLIC_ALLOW_DIRECT_CHAT_API` unset or `false` unless you intentionally want the browser to call the upstream RAG service directly.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Framer Motion
- react-markdown
