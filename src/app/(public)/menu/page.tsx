/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";

import { CategoryNav } from "@/components/product/category-nav";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getMenuCategories } from "@/lib/catalog";
import { cafeOrCoffeeShopJsonLd } from "@/lib/seo";
import { exampleBusinessDetails } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Menú",
  description: `Todo el menú de ${exampleBusinessDetails.name}: cafés, bebidas frías, snacks y coctelería con su precio y disponibilidad actual.`,
  alternates: { canonical: "/menu" },
};

export default async function MenuPage() {
  const categories = await getMenuCategories();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 py-8 sm:py-12">
      <JsonLd data={cafeOrCoffeeShopJsonLd()} />
      <Card className="friends-surface relative mx-4 flex animate-fade-up overflow-hidden bg-primary text-primary-foreground">
        <CardHeader className="pr-28 pl-8 font-heading text-2xl leading-none tracking-wider">
          <h1>{"I'll Be There For You..."}</h1>
        </CardHeader>
        <CardContent>
          <img
            src="/images/friends_frame.png"
            alt=""
            width={1072}
            height={1340}
            className="absolute -top-28 -right-14 -z-10 h-auto w-44"
          />
          <img
            src="/images/friends_couch.png"
            alt=""
            width={1528}
            height={721}
            className="h-auto w-64"
          />
        </CardContent>
      </Card>

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
            className="flex scroll-mt-36 flex-col px-4"
          >
            <h2
              id={`${category.slug}-titulo`}
              className="font-heading text-xl text-coffee sm:text-5xl"
            >
              {category.name}
            </h2>

            {category.products.length === 0 ? (
              <p className="friends-surface p-5 text-sm text-muted-foreground">
                No hay productos en esta categoría todavía.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
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
