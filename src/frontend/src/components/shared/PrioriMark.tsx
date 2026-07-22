export function PrioriMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Priori logo">
      <defs>
        <linearGradient id="prioriArc" x1="9" y1="9" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1B1440" />
          <stop offset=".55" stopColor="#5A2FE0" />
          <stop offset="1" stopColor="#9B7CFF" />
        </linearGradient>
        <filter id="prioriGlow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <g stroke="#9B7CFF" strokeWidth="1.7" strokeLinecap="round" opacity=".75">
        <line x1="31.6" y1="36.4" x2="33.8" y2="34.2" />
        <line x1="28.4" y1="38.9" x2="30.2" y2="37.1" />
      </g>
      <path d="M12.5 32.6 A15 15 0 1 1 35.5 32.6" stroke="url(#prioriArc)" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="35.5" cy="32.6" r="4.4" fill="#7C5CFF" filter="url(#prioriGlow)" />
      <circle cx="35.5" cy="32.6" r="3.6" fill="#fff" />
    </svg>
  );
}
