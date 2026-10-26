"use client";

import { useEffect, useState } from "react";
import { PRICE_RANGE } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function PriceRange({
  min,
  max,
  onCommit,
}: {
  min: number;
  max: number;
  onCommit: (min: number, max: number) => void;
}) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);

  useEffect(() => {
    setLo(min);
    setHi(max);
  }, [min, max]);

  const commit = () => {
    if (lo !== min || hi !== max) onCommit(Math.min(lo, hi), Math.max(lo, hi));
  };

  const span = PRICE_RANGE.max - PRICE_RANGE.min || 1;
  const leftPct = ((Math.min(lo, hi) - PRICE_RANGE.min) / span) * 100;
  const rightPct = ((Math.max(lo, hi) - PRICE_RANGE.min) / span) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-ink-900">
        <span>{formatPrice(Math.min(lo, hi))}</span>
        <span>{formatPrice(Math.max(lo, hi))}</span>
      </div>
      <div className="range-dual mt-1">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink-500/20" />
        <div
          className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold-500"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          aria-label="min"
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={1}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
        <input
          type="range"
          aria-label="max"
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={1}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
      </div>
    </div>
  );
}
