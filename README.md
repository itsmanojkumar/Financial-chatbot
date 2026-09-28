# LedgerMind — Financial Annual Report Chatbot (Frontend)

A Next.js App Router financial research application for your **annual report RAG pipeline**: interactive Q&A, markdown answers, cited sources, and a live SEC EDGAR company explorer.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo mode is on by default so you can try the UI without a backend. The live EDGAR explorer is served through Next.js route handlers at `/api/sec/*`.

Production build and server:

```bash
npm run build
npm start
```

## SEC EDGAR explorer

The top navigation includes a live SEC EDGAR explorer for U.S. public companies. Search by company name, ticker, or CIK to see the registrant profile, annual SEC-reported XBRL facts (revenue, net income, operating cash flow, assets, equity, cash, debt and diluted EPS), recent 10-K/10-Q/8-K/proxy filings, and links to original SEC documents. The explorer also includes quick ticker searches and a shortcut to ask LedgerMind about the selected company.

EDGAR data is requested by the server, not directly by the browser: `data.sec.gov` does not support browser CORS. The development server serves `/api/sec/*` automatically. For a deployed server, set `SEC_USER_AGENT` to an application name and a monitored contact email, for example `LedgerMind contact: analyst@example.com`, as requested by SEC developer guidance. SEC data is public and does not need an API key. Financial facts are informational; verify material values in the original filings.

## Deploy (Render)

1. Push this repo to GitHub (`origin` is already set).
2. On [Render](https://dashboard.render.com/static/new), connect the repo.
3. The included Blueprint builds and runs the Next.js Node web service (`npm start`) to serve the site and SEC API route handlers.
4. Set the required `SEC_USER_AGENT` environment variable in Render to your application name and monitored contact email.
5. Set `NEXT_PUBLIC_USE_DEMO=true` for demo chat. For live chat, set `RAG_API_BASE_URL` on the server to your RAG API URL; `NEXT_PUBLIC_RAG_API_BASE_URL` is available when the browser should contact the API directly.

Use the included `render.yaml` blueprint when creating a Blueprint from the repo; the SEC route handlers require the Node web service rather than a static-only site.

## Connect your RAG backend

1. Copy `.env.example` to `.env` and set `NEXT_PUBLIC_USE_DEMO=false`.
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

The same-origin Next.js `/api/chat` and `/api/chat/stream` routes proxy requests to `RAG_API_BASE_URL` (default: `http://localhost:8000`).

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- Framer Motion
- react-markdown
