# LedgerMind — Financial Annual Report Chatbot (Frontend)

A polished React chat UI for your **annual report RAG pipeline**: instant Q&A, markdown answers, and a sources panel for citations.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Demo mode is on by default so you can try the UI without a backend.

Production build locally:

```bash
npm run build
npm run preview
```

## Deploy (Render static site)

1. Push this repo to GitHub (`origin` is already set).
2. On [Render](https://dashboard.render.com/static/new), connect the repo.
3. **Build command:** `npm install && npm run build`
4. **Publish directory:** `dist`
5. **Environment:** `VITE_USE_DEMO=true` (or set `VITE_API_BASE_URL` to your RAG API before build).

Or use the included `render.yaml` blueprint when creating a Blueprint from the repo.

## Connect your RAG backend

1. Copy `.env.example` to `.env` and set `VITE_USE_DEMO=false`.
2. Run your API on **port 8000** (or set `VITE_API_BASE_URL`).

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

Vite proxies `/api` → `http://localhost:8000` during development (see `vite.config.ts`).

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- react-markdown
