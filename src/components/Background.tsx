export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-teal-500/10 blur-[120px] dark:opacity-100 opacity-40" />
      <div className="absolute -right-1/4 top-1/3 h-[480px] w-[480px] rounded-full bg-gold-500/10 blur-[100px] dark:opacity-100 opacity-50" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.35] opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--app-grid-dot) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
