import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Sifariş",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
