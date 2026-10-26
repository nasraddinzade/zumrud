"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "@/lib/catalog";
import type { Product } from "@/data/types";

export type CartItem = { slug: string; qty: number };
export type CartLine = { product: Product; qty: number };

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  total: number;
  hydrated: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CART_STORAGE_KEY = "zumrud-cart";
const MAX_QTY = 20;

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is CartItem =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as CartItem).slug === "string" &&
          typeof (x as CartItem).qty === "number",
      )
      .filter((x) => x.qty > 0 && getProduct(x.slug) !== undefined);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Читаем корзину после монтирования, чтобы серверный и первый клиентский рендер совпали.
  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const add = useCallback((slug: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === slug ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i,
        );
      }
      return [...prev, { slug, qty: Math.min(MAX_QTY, qty) }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items.flatMap((i) => {
      const product = getProduct(i.slug);
      return product ? [{ product, qty: i.qty }] : [];
    });
    return {
      items,
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.qty * l.product.price, 0),
      hydrated,
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, hydrated, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
