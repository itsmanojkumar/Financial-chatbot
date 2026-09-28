import { UnitedStatesMarketPage } from "../../components/MarketResearchPages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "United States Markets · LedgerMind",
  description: "Explore US company filings and SEC EDGAR data alongside indicative major US index levels.",
};

export default function UnitedStatesPage() {
  return <UnitedStatesMarketPage />;
}