import type { NextRequest } from "next/server";

const RAG_API_BASE =
  process.env.RAG_API_BASE_URL ||
  process.env.NEXT_PUBLIC_RAG_API_BASE_URL ||
  "http://localhost:8000";

export async function proxyRagRequest(request: NextRequest) {
  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, RAG_API_BASE);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  try {
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
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("connection");
    responseHeaders.delete("transfer-encoding");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? `Could not reach the RAG API at ${RAG_API_BASE}. ${error.message}`
            : "Could not reach the RAG API.",
      },
      { status: 502 },
    );
  }
}