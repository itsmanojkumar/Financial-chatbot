import type { NextRequest } from "next/server";
import { auth } from "../auth";

const RAG_API_BASE =
  process.env.RAG_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_RAG_API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");
const RAG_API_KEY = process.env.RAG_API_KEY || "";

export async function proxyRagRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isChatRoute = pathname === "/api/chat" || pathname === "/api/chat/stream";
  const isConversationRoute =
    pathname === "/api/conversations" || pathname.startsWith("/api/conversations/");
  const isAccountRoute = pathname === "/api/account";
  const isPaymentRoute =
    pathname === "/api/payments/orders" || pathname === "/api/payments/verify";
  if (!isChatRoute && !isConversationRoute && !isAccountRoute && !isPaymentRoute) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  if (((isChatRoute || isPaymentRoute) && request.method !== "POST") ||
      (isConversationRoute && !["GET", "DELETE"].includes(request.method)) ||
      (isAccountRoute && request.method !== "GET")) {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  if (!RAG_API_BASE) {
    return Response.json(
      { error: "The chat backend is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (process.env.NODE_ENV === "production" && !RAG_API_KEY) {
    return Response.json(
      { error: "The chat backend credential is not configured." },
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
    if (RAG_API_KEY) headers.set("X-Backend-API-Key", RAG_API_KEY);
    // Every request reaches the backend from this server's IP; pass the
    // visitor's so signed-out users are rate limited separately.
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")?.trim();
    if (clientIp) headers.set("X-Client-IP", clientIp);
    const session = await auth();
    if (session?.user?.id) {
      headers.set("X-Auth-User-Id", session.user.id);
      if (session.user.email) headers.set("X-Auth-User-Email", session.user.email);
      if (session.user.name) headers.set("X-Auth-User-Name", session.user.name);
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
      // Client errors carry a message meant for the user (for example the
      // free-plan limit); server errors stay generic.
      let message = "The analysis service could not complete the request.";
      if (upstream.status >= 400 && upstream.status < 500) {
        const body = (await upstream.json().catch(() => null)) as { detail?: unknown } | null;
        if (typeof body?.detail === "string") message = body.detail;
      }
      return Response.json(
        { error: message },
        { status: upstream.status, headers: { "Cache-Control": "no-store" } },
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