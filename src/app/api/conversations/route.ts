import type { NextRequest } from "next/server";
import { proxyRagRequest } from "../../../lib/rag-proxy";

export function GET(request: NextRequest) {
  return proxyRagRequest(request);
}