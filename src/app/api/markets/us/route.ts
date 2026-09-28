import { getUsMarketOverview } from "../../../../../server/us-market.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getUsMarketOverview(), {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "US index quotes are currently unavailable.";
    return Response.json({ error: message }, { status: 502 });
  }
}