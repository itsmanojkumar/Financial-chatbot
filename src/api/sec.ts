export type SecCompanyMatch = {
  cik: string;
  name: string;
  ticker: string;
  exchange: string;
};

export type SecMetricValue = {
  year: number;
  end: string;
  filed: string;
  form: string;
  value: number;
  unit: string;
};

export type SecMetric = {
  key: string;
  label: string;
  concept: string | null;
  unit: string;
  values: SecMetricValue[];
};

export type SecFiling = {
  form: string;
  filingDate: string;
  reportDate: string;
  description: string;
  accessionNumber?: string;
  url: string;
};

export type SecCompany = SecCompanyMatch & {
  tickers: string[];
  exchanges: string[];
  sic?: string;
  sicDescription?: string;
  fiscalYearEnd?: string;
  stateOfIncorporation?: string;
  mailingAddress?: Record<string, string> | null;
  businessAddress?: Record<string, string> | null;
  recentFilings: SecFiling[];
  metrics: SecMetric[];
};

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || `SEC request failed (${response.status}).`);
  }
  return data;
}

export async function searchSecCompanies(
  query: string,
  signal?: AbortSignal,
): Promise<SecCompanyMatch[]> {
  const data = await requestJson<{ companies: SecCompanyMatch[] }>(
    `/api/sec/search?q=${encodeURIComponent(query)}`,
    signal,
  );
  return data.companies;
}

export function getSecCompany(
  cik: string,
  signal?: AbortSignal,
): Promise<SecCompany> {
  return requestJson<SecCompany>(
    `/api/sec/company?cik=${encodeURIComponent(cik)}`,
    signal,
  );
}