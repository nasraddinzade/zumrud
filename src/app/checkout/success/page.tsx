import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessView } from "@/components/checkout/SuccessView";

export const metadata: Metadata = {
  title: "Sifariş qəbul olundu (demo)",
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container-x py-10" />}>
      <SuccessView />
    </Suspense>
  );
}
