import type { Metadata } from "next";
import Image from "next/image";

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
    <div className="site-container flex max-w-6xl flex-col gap-10 py-6 sm:gap-12 sm:py-10">
      <JsonLd data={cafeOrCoffeeShopJsonLd()} />
      <Card className="friends-surface relative min-h-64 animate-fade-up gap-0 overflow-hidden bg-primary py-0 text-primary-foreground sm:min-h-56 sm:flex-row sm:items-center sm:justify-between">
        <Image
          src="/images/friends_frame.svg"
          alt=""
          width={980}
          height={1225}
          loading="eager"
          className="pointer-events-none absolute -top-24 -right-12 h-auto w-40 opacity-70 sm:-top-28 sm:right-0 sm:w-52 lg:w-60"
        />
        <CardHeader className="relative z-10 w-full gap-2 px-6 pt-8 pb-4 text-center sm:min-w-0 sm:flex-1 sm:px-8 sm:py-8 sm:text-left lg:px-12">
          <h1 className="friends-kicker text-xs font-semibold text-peephole sm:text-sm">
            Menú
          </h1>
          <p
            lang="en"
            className="text-balance font-heading text-3xl leading-none tracking-wide sm:text-4xl lg:text-5xl"
          >
            I’ll Be There for You…
          </p>
        </CardHeader>
        <CardContent className="relative z-10 flex w-full justify-center px-6 pt-0 pb-6 sm:w-auto sm:shrink-0 sm:justify-end sm:px-6 sm:py-6 lg:pr-12">
          <Image
            src="/images/friends_couch.svg"
            alt=""
            width={1528}
            height={721}
            fetchPriority="high"
            className="h-auto w-full max-w-64 md:max-w-80 lg:max-w-96"
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
            className="flex scroll-mt-[calc(var(--site-header-height)+env(safe-area-inset-top)+5rem)] flex-col gap-3"
          >
            <h2
              id={`${category.slug}-titulo`}
              className="text-balance break-words font-heading text-3xl leading-none text-coffee sm:text-4xl lg:text-5xl"
            >
              {category.name}
            </h2>

            {category.products.length === 0 ? (
              <p className="friends-surface p-5 text-sm text-muted-foreground">
                No hay productos en esta categoría todavía.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 max-[359px]:grid-cols-1 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
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
