import { searchNseCompanies } from "../../../../../server/nse-api.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q") ?? "";
    return Response.json(await searchNseCompanies(query), {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load NSE listed companies.";
    return Response.json({ error: message }, { status: 502 });
  }
}