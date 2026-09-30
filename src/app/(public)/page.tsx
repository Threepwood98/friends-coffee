import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CupSoda } from "lucide-react";

import { CouchScene } from "@/components/layout/couch-scene";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getFeaturedProducts, getMenuCategories } from "@/lib/catalog";
import { cafeOrCoffeeShopJsonLd } from "@/lib/seo";
import { exampleBusinessDetails } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  description: `Cafés de especialidad, dulces caseras y opciones saladas en ${exampleBusinessDetails.name}. Consulta precios, descripciones y disponibilidad de toda la carta sin esperas.`,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getMenuCategories(),
    getFeaturedProducts(3),
  ]);

  const productCount = categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12">
      <JsonLd data={cafeOrCoffeeShopJsonLd()} />
      <section className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex animate-fade-up flex-col gap-6">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            {exampleBusinessDetails.shortName}
          </p>
          <h1 className="font-heading max-w-3xl text-5xl font-normal tracking-tight text-balance text-coffee sm:text-6xl">
            La carta de {exampleBusinessDetails.name}, al día y sin esperas
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {exampleBusinessDetails.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/carta"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ver la carta completa
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/registro"
              className="inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Crear una cuenta
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {productCount} productos en {categories.length} categorías,{" "}
            {exampleBusinessDetails.hours[0].label.toLowerCase()} de{" "}
            {exampleBusinessDetails.hours[0].opens} a{" "}
            {exampleBusinessDetails.hours[0].closes}.
          </p>
        </div>

        <div className="animate-fade-up [animation-delay:160ms]">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-[0_18px_40px_-18px_var(--door)] sm:p-6">
            <CouchScene />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="destacados"
        className="flex animate-fade-up flex-col gap-6 [animation-delay:260ms]"
      >
        <h2
          id="destacados"
          className="font-heading text-3xl font-normal tracking-tight text-coffee"
        >
          Para empezar el día
        </h2>
        {featured.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  categorySlug={product.category.slug}
                  priority={index === 0}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Todavía no hay productos disponibles en la carta.
          </p>
        )}
      </section>

      <section aria-labelledby="categorias" className="flex flex-col gap-6">
        <h2
          id="categorias"
          className="font-heading text-3xl font-normal tracking-tight text-coffee"
        >
          Categorías
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/carta#${category.slug}`}
                className="frame-peephole flex h-full min-h-11 flex-col gap-1 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/10 hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="font-heading text-2xl font-normal">
                  {category.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {category.products.length}{" "}
                  {category.products.length === 1 ? "producto" : "productos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CupSoda className="size-4" aria-hidden />
        Hay sitio en el sofá para ti.
      </p>
    </div>
  );
}
