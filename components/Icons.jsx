// Minimal line-art icons (no emoji, no icon-font dependency). Each accepts
// a `size` and inherits color via currentColor so it matches surrounding text.

export function BasketIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h16l-1.5 10.5a1 1 0 0 1-1 .5H6.5a1 1 0 0 1-1-.5L4 9Z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      <path d="M9 13v3M12 13v3M15 13v3" />
    </svg>
  );
}

export function PinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function LeafIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c8 0 15-6 16-16C11 5 4 12 4 20Z" />
      <path d="M6 18C10 13 14 10 19 5" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}

export function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
