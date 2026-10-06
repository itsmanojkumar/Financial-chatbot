import type { Account } from "../hooks/useAccount";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type OrderResponse = {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
};

export class CheckoutError extends Error {}

let scriptPromise: Promise<void> | null = null;

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new CheckoutError("Could not load Razorpay checkout. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !data) {
    throw new CheckoutError(data?.error || `Checkout failed (${response.status}).`);
  }
  return data;
}

/**
 * Pays for one month of Pro with Razorpay and returns the upgraded account,
 * or null if the buyer closes the payment window.
 */
export async function buyProPlan(buyer: { name?: string | null; email?: string | null }): Promise<Account | null> {
  const [order] = await Promise.all([
    postJson<OrderResponse>("/api/payments/orders", { plan_id: "pro", billing_country: "IN" }),
    loadRazorpay(),
  ]);
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new CheckoutError("Razorpay checkout is unavailable.");

  return new Promise<Account | null>((resolve, reject) => {
    const checkout = new Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "LedgerMind",
      description: "Pro Analyst · 1 month",
      prefill: { name: buyer.name ?? undefined, email: buyer.email ?? undefined },
      theme: { color: "#0f766e" },
      handler: (payment) => {
        postJson<{ account: Account }>("/api/payments/verify", {
          order_id: payment.razorpay_order_id,
          payment_id: payment.razorpay_payment_id,
          signature: payment.razorpay_signature,
        }).then(
          (result) => resolve(result.account),
          reject,
        );
      },
      // Failed attempts are shown inside Razorpay's window, which lets the
      // buyer retry; closing it without paying resolves to null.
      modal: { ondismiss: () => resolve(null) },
    });
    checkout.open();
  });
}
