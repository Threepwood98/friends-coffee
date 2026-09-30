import type { Metadata } from "next";

import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import { getMenuCategories } from "@/lib/catalog";
import { exampleBusinessDetails } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Carta",
  description: `Toda la carta de ${exampleBusinessDetails.name} organizada por categorías: cafés, especialidades, dulces y salados, con su precio y disponibilidad actual.`,
  alternates: { canonical: "/carta" },
};

export default async function CartaPage() {
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
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Nuestra carta
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          {productCount} productos en {categories.length} categorías. Hoy hay{" "}
          {availableCount} disponibles y el resto se marca como agotado.
        </p>
      </header>

      <CategoryNav
        categories={categories.map((category) => ({
          name: category.name,
          slug: category.slug,
        }))}
      />

      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          La carta está siendo preparada. Vuelve en un rato.
        </p>
      ) : (
        categories.map((category) => (
          <section
            key={category.id}
            id={category.slug}
            aria-labelledby={`${category.slug}-titulo`}
            className="flex scroll-mt-20 flex-col gap-5"
          >
            <h2
              id={`${category.slug}-titulo`}
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              {category.name}
            </h2>

            {category.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay productos en esta categoría todavía.
              </p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
