"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, BookOpen, LoaderCircle } from "lucide-react";

export default function SignInPage() {
  const [pending, setPending] = useState(false);

  const handleGoogleSignIn = async () => {
    setPending(true);
    try {
      await signIn("google", { redirectTo: "/workspace" });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f3f6f8] px-5 py-12 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_16%,rgba(13,148,136,0.12),transparent_38%),radial-gradient(ellipse_at_88%_80%,rgba(212,175,90,0.13),transparent_34%)]" />
      <section className="relative w-full max-w-md border-y border-slate-200/80 bg-white/85 px-6 py-9 shadow-[0_28px_80px_-48px_rgba(15,23,42,.3)] backdrop-blur-xl sm:border sm:px-9 sm:py-10 sm:rounded-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to markets
        </Link>

        <div className="mt-9 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-teal-300">
          <BookOpen className="h-5 w-5" />
        </div>
        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-teal-800">
          LedgerMind workspace
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-950">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Continue with your Google account.
        </p>

        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={pending}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-teal-700" />
          ) : (
            <span aria-hidden="true" className="font-display text-xl font-bold text-[#4285f4]">
              G
            </span>
          )}
          {pending ? "Connecting to Google…" : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          By continuing, you agree to use this service in accordance with its
          terms and privacy policy.
        </p>
      </section>
    </main>
  );
}