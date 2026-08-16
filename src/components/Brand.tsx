/** Identidad EBYZOM: marca "EB" reconstruida en SVG + firma discreta. */

export function EbyzomMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="EBYZOM">
      <circle cx="50" cy="50" r="47" fill="none" stroke="#34A853" strokeWidth="2" />
      <g>
        <path
          d="M50 16 H34 C20 16 12 27 12 50 C12 73 20 84 34 84 H50 Z"
          fill="#34A853"
        />
        <path
          d="M50 16 H64 C78 16 86 27 86 38 C86 45 82 49 78 50 C82 51 86 55 86 62 C86 73 78 84 64 84 H50 Z"
          fill="#3B6FC4"
        />
        <rect x="22" y="38" width="56" height="9" rx="4.5" fill="#fff" />
        <rect x="22" y="53" width="56" height="9" rx="4.5" fill="#fff" />
      </g>
    </svg>
  );
}

export function EbyzomWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-tight ${className}`}>
      <span style={{ color: "#34A853" }}>EBY</span>
      <span style={{ color: "#3B6FC4" }}>Z</span>
      <span style={{ color: "#34A853" }}>OM</span>
    </span>
  );
}

export function CreadoPorEbyzom({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-white/55 ${className}`}>
      <EbyzomMark size={18} />
      <span className="text-[11px] tracking-[0.18em] uppercase">Creado por</span>
      <EbyzomWordmark className="text-[13px]" />
    </div>
  );
}
