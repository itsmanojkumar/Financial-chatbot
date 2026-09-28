import { handleSecApi } from "../../../../../server/sec-api.mjs";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return (
    (await handleSecApi(request)) ??
    Response.json({ error: "SEC company endpoint not found." }, { status: 404 })
  );
}