import type { NextRequest } from "next/server";

const RAG_API_BASE =
  process.env.RAG_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_RAG_API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

export async function proxyRagRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname !== "/api/chat" && pathname !== "/api/chat/stream") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (!RAG_API_BASE) {
    return Response.json(
      { error: "The chat backend is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const base = new URL(RAG_API_BASE);
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password
    ) {
      throw new Error("Invalid RAG_API_BASE_URL");
    }

    const target = new URL(pathname + request.nextUrl.search, base);
    const headers = new Headers();
    for (const name of ["accept", "content-type"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      // Streaming requests should not buffer the RAG service's response.
      // @ts-expect-error Node's fetch supports duplex for streaming request bodies.
      duplex: "half",
      signal: request.signal,
      cache: "no-store",
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstream.headers.get("content-type");
    if (contentType) responseHeaders.set("Content-Type", contentType);

    if (!upstream.ok) {
      return Response.json(
        { error: "The analysis service could not complete the request." },
        { status: upstream.status, headers: responseHeaders },
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        error: "The analysis service is temporarily unavailable.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}