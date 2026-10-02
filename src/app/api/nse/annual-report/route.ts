import { streamNseAnnualReport } from "../../../../../server/nse-api.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    return await streamNseAnnualReport(
      url.searchParams.get("symbol") ?? "",
      url.searchParams.get("reportId") ?? "",
      request.headers.get("range"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch this NSE annual report.";
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 502;
    return Response.json({ error: message }, { status });
  }
}