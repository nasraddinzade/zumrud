"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/types";
import { formatPrice, formatVolume } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
  className = "",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-square w-full bg-white p-3">
        <Image
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          fill
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-cream-50 px-3 pb-3.5 pt-3">
        <div className="label-caps truncate">{product.brand}</div>
        <div className="line-clamp-2 text-sm font-medium leading-snug text-ink-900">
          {product.name}
        </div>
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
          <span className="text-xs text-ink-500">{formatVolume(product.volumeMl)}</span>
          <span className="font-serif text-base font-semibold text-gold-500">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
