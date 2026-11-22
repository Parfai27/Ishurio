/** The Ishurio mark (three dots and a square, the square in the accent) and the name. */
export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="4.5" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="4.5" fill="currentColor" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" className="fill-brand-500" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[19px] font-medium tracking-tight ${className}`}>
      <Mark />
      Ishurio
    </span>
  );
}
