import { handleSecApi } from "../../../../../server/sec-api.mjs";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return (await handleSecApi(request)) ?? Response.json({ companies: [] });
}