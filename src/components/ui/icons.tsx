// Line and filled icons used in more than one place. All are decorative (aria-hidden).

type IconProps = { size: number; className?: string };

/** Green tick in a pale green circle. */
export function CheckIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="11" fill="#E3F2E6" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#1F7A3A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Red cross in a pale red circle. */
export function CrossIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="11" fill="#FDE8E6" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#B42318" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Right arrow. */
export function ArrowIcon({ size, stroke = "currentColor", strokeWidth = 2 }: IconProps & { stroke?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Opening quotation mark. */
export function QuoteIcon({ size, fill }: IconProps & { fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.5 6C6.5 7.2 4.5 9.8 4.5 13.2V18H10v-5.5H7.3c0-2 1.1-3.5 3-4.3L9.5 6zm10 0c-3 1.2-5 3.8-5 7.2V18H20v-5.5h-2.7c0-2 1.1-3.5 3-4.3L19.5 6z"
        fill={fill}
      />
    </svg>
  );
}

/** Head-and-shoulders outline, for photo placeholders. */
export function PersonIcon({ size, strokeWidth }: IconProps & { strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

/** Telephone handset. */
export function PhoneIcon({ size, stroke }: IconProps & { stroke: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
