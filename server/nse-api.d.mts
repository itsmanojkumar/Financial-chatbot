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

export function searchNseCompanies(query: string): Promise<{
  companies: NseCompanyMatch[];
  listedCount: number;
}>;

export function getNseCompany(symbol: string): Promise<
  NseCompanyMatch & {
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
  }
>;

export function getNseMarketOverview(): Promise<{
  indices: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    previousClose: number;
    open: number;
    high: number;
    low: number;
    yearHigh: number;
    yearLow: number;
    advances: number;
    declines: number;
    unchanged: number;
    pe: number | null;
    pb: number | null;
    currency: "INR";
  }>;
  upcomingResults: Array<{
    symbol: string;
    company: string;
    purpose: string;
    description: string;
    date: string;
  }>;
  retrievedAt: string;
  exchange: string;
  indicesError?: string;
  calendarError?: string;
}>;

export function streamNseAnnualReport(
  symbol: string,
  reportId: string,
  rangeHeader?: string | null,
): Promise<Response>;