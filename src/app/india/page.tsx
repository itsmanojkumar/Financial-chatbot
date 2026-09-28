import { IndiaMarketPage } from "../../components/MarketResearchPages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "India Markets · LedgerMind",
  description: "Explore NSE India company disclosures, live index data and officially scheduled upcoming financial results.",
};

export default function IndiaPage() {
  return <IndiaMarketPage />;
}