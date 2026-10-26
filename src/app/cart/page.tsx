import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Səbət",
};

export default function CartPage() {
  return <CartView />;
}
