import type { NextRequest } from "next/server";
import { proxyRagRequest } from "../../../../lib/rag-proxy";

export const runtime = "nodejs";

export function POST(request: NextRequest) {
  return proxyRagRequest(request);
}
