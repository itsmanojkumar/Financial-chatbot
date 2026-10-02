export type NseCompanyMatch = {
  symbol: string;
  name: string;
  series: string;
  listingDate: string;
  paidUpValue: number | null;
  marketLot: number | null;
  isin: string;
  faceValue: number | null;
};

export type NseAnnouncement = {
  companyName: string;
  description: string;
  publishedAt: string;
};

export type NseCompany = NseCompanyMatch & {
  filings: NseAnnouncement[];
  annualReports: Array<{
    id: string;
    companyName: string;
    description: string;
    publishedAt: string;
    year: string;
  }>;
  annualReportsError?: string;
  directoryCount: number;
  sourceUpdatedAt: string;
};

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || `NSE request failed (${response.status}).`);
  }
  return data;
}

export async function searchNseCompanies(
  query: string,
  signal?: AbortSignal,
): Promise<{ companies: NseCompanyMatch[]; listedCount: number }> {
  return requestJson(
    `/api/nse/search?q=${encodeURIComponent(query)}`,
    signal,
  );
}

export function getNseCompany(
  symbol: string,
  signal?: AbortSignal,
): Promise<NseCompany> {
  return requestJson(
    `/api/nse/company?symbol=${encodeURIComponent(symbol)}`,
    signal,
  );
}
