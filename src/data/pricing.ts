import type { UserPlan } from "../types/app";

export type PricingTier = {
  id: UserPlan | "enterprise";
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted?: boolean;
  cta: string;
  features: string[];
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Explore annual reports with core Q&A and citations.",
    cta: "Current plan",
    features: [
      "50 questions / month",
      "1 report year indexed",
      "Source snippets & page refs",
      "Chat history (7 days)",
      "Light & dark mode",
    ],
  },
  {
    id: "pro",
    name: "Pro Analyst",
    price: "$29",
    period: "/ month",
    description: "For investors and analysts who live in filings.",
    highlighted: true,
    cta: "Upgrade to Pro",
    features: [
      "Unlimited questions",
      "5 report years + 10-K/10-Q add-ons",
      "Compare YoY metrics in chat",
      "Export threads (PDF & Markdown)",
      "Priority RAG latency",
      "Saved prompts & watchlists",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$99",
    period: "/ seat / mo",
    description: "Shared workspace for research desks and IR teams.",
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Shared knowledge base",
      "Role-based access",
      "Audit log & compliance mode",
      "API access for internal tools",
      "Dedicated onboarding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Private deployment on your documents and VPC.",
    cta: "Book a demo",
    features: [
      "On-prem or private cloud",
      "Custom embedding models",
      "SSO / SAML",
      "SLA & dedicated support",
      "White-label UI",
    ],
  },
];
