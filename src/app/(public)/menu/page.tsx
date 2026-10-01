import type { Metadata } from "next";
import { CheckCircle2, Coffee, Layers3 } from "lucide-react";

import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getMenuCategories } from "@/lib/catalog";
import { cafeOrCoffeeShopJsonLd } from "@/lib/seo";
import { exampleBusinessDetails } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Menú",
  description: `Toda la carta de ${exampleBusinessDetails.name} organizada por categorías: cafés, especialidades, dulces y salados, con su precio y disponibilidad actual.`,
  alternates: { canonical: "/menu" },
};

export default async function MenuPage() {
  const categories = await getMenuCategories();

  const productCount = categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );
  const availableCount = categories.reduce(
    (total, category) =>
      total + category.products.filter((product) => product.available).length,
    0,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:py-12">
      <JsonLd data={cafeOrCoffeeShopJsonLd()} />
      <header className="friends-surface relative isolate flex animate-fade-up flex-col gap-5 overflow-hidden bg-primary p-7 text-primary-foreground sm:p-10 lg:p-12">
        <div
          aria-hidden
          className="absolute -top-20 right-8 -z-10 size-56 rounded-full border-[22px] border-peephole/90"
        />
        <div
          aria-hidden
          className="absolute right-52 -bottom-20 -z-10 size-48 rounded-full bg-accent/35 blur-2xl"
        />
        <p className="friends-kicker flex items-center gap-2 text-xs font-semibold text-peephole">
          <Coffee className="size-4" aria-hidden />
          Todo lo que servimos hoy
        </p>
        <h1 className="font-heading max-w-3xl text-5xl leading-none font-normal tracking-tight text-balance sm:text-7xl">
          Nuestra carta
        </h1>
        <p className="max-w-2xl text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8">
          Recorre la carta por categorías, consulta el precio y comprueba qué
          puedes pedir ahora mismo en barra.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-foreground/10 px-4 font-medium">
            <Layers3 className="size-4 text-peephole" aria-hidden />
            {productCount} productos · {categories.length} categorías
          </span>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-foreground/10 px-4 font-medium">
            <CheckCircle2 className="size-4 text-peephole" aria-hidden />
            {availableCount} disponibles hoy
          </span>
        </div>
      </header>

      <CategoryNav
        categories={categories.map((category) => ({
          name: category.name,
          slug: category.slug,
        }))}
      />

      {categories.length === 0 ? (
        <p className="friends-surface p-7 text-muted-foreground">
          La carta está siendo preparada. Vuelve en un rato.
        </p>
      ) : (
        categories.map((category) => (
          <section
            key={category.id}
            id={category.slug}
            aria-labelledby={`${category.slug}-titulo`}
            className="flex scroll-mt-36 flex-col gap-5"
          >
            <div className="flex flex-col items-start justify-between gap-3 border-b border-coffee/10 pb-3 sm:flex-row sm:items-end sm:gap-4">
              <div className="min-w-0">
                <p className="friends-kicker mb-1 text-[0.68rem] font-semibold text-primary">
                  Sección de la carta
                </p>
                <h2
                  id={`${category.slug}-titulo`}
                  className="font-heading text-4xl font-normal tracking-tight text-coffee sm:text-5xl"
                >
                  {category.name}
                </h2>
              </div>
              <span className="inline-flex min-h-9 items-center rounded-full bg-secondary/45 px-3 text-xs font-semibold text-coffee">
                {category.products.length}{" "}
                {category.products.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            {category.products.length === 0 ? (
              <p className="friends-surface p-5 text-sm text-muted-foreground">
                No hay productos en esta categoría todavía.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
                {category.products.map((product) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      categorySlug={category.slug}
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
