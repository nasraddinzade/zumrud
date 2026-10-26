import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getProduct } from "@/lib/catalog";
import { ProductView } from "@/components/product/ProductView";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.brand} ${product.name} ${product.volumeMl} ml`,
    description: product.description?.az,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductView slug={slug} />;
}
