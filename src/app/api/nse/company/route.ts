import { getNseCompany } from "../../../../../server/nse-api.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const symbol = new URL(request.url).searchParams.get("symbol") ?? "";
    return Response.json(await getNseCompany(symbol), {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load NSE company disclosures.";
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 502;
    return Response.json({ error: message }, { status });
  }
}