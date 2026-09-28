import { getNseMarketOverview } from "../../../../../server/nse-api.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getNseMarketOverview(), {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "NSE market data is currently unavailable.";
    return Response.json({ error: message }, { status: 502 });
  }
}