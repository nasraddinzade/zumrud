import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Kataloq",
};

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container-x py-10 text-ink-500">…</div>}>
      <CatalogView />
    </Suspense>
  );
}
