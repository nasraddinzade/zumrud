import Link from "next/link";

// Знак: тёмно-зелёный круг, золотая корона и монограмма Z.
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="32" cy="32" r="31" fill="#0B2A21" stroke="#C9A227" strokeWidth="1.5" />
      <path
        d="M20 23 L24.5 16 L29 22 L32 14 L35 22 L39.5 16 L44 23 Z"
        fill="#C9A227"
      />
      <text
        x="32"
        y="50"
        textAnchor="middle"
        fontFamily="Georgia, 'Noto Serif Display', serif"
        fontSize="28"
        fontWeight="600"
        fill="#C9A227"
      >
        Z
      </text>
    </svg>
  );
}

export function Logo({
  name,
  tagline,
  inverted = false,
}: {
  name: string;
  tagline?: string;
  inverted?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={name}>
      <LogoMark size={40} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-lg font-semibold tracking-wide ${
            inverted ? "text-cream-50" : "text-emerald-900"
          }`}
        >
          {name}
        </span>
        {tagline ? (
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-500">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
