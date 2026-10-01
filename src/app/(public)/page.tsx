import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Coffee, MapPin, Sparkles } from "lucide-react";

import { CouchScene } from "@/components/layout/couch-scene";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
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
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8 sm:gap-20 sm:py-12">
      <JsonLd data={cafeOrCoffeeShopJsonLd()} />
      <section className="friends-surface relative isolate grid overflow-hidden bg-primary text-primary-foreground lg:grid-cols-[1.05fr_0.95fr]">
        <div
          aria-hidden
          className="absolute -top-24 -left-20 size-64 rounded-full border-[24px] border-peephole/85"
        />
        <div
          aria-hidden
          className="absolute right-[42%] -bottom-24 size-52 rounded-full bg-accent/35 blur-2xl"
        />

        <div className="relative order-2 flex animate-fade-up flex-col justify-center gap-6 p-7 sm:p-10 lg:order-1 lg:p-14">
          <p className="friends-kicker flex items-center gap-2 text-xs font-semibold text-peephole">
            <Sparkles className="size-4" aria-hidden />
            Bienvenido a {exampleBusinessDetails.shortName}
          </p>
          <h1 className="font-heading max-w-3xl text-5xl leading-[0.95] font-normal tracking-tight text-balance sm:text-7xl">
            Tu café, tu sofá, tu gente
          </h1>
          <p className="max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8">
            {exampleBusinessDetails.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/carta"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-colors hover:bg-accent/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
            >
              Ver la carta
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/registro"
              className="inline-flex min-h-12 items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
            >
              Haz sitio en el sofá
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-primary-foreground/10 p-3">
              <Coffee className="mb-2 size-5 text-peephole" aria-hidden />
              <p className="font-semibold">{productCount} productos</p>
              <p className="text-xs text-primary-foreground/70">
                {categories.length} categorías
              </p>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-3">
              <Clock3 className="mb-2 size-5 text-peephole" aria-hidden />
              <p className="font-semibold">
                {exampleBusinessDetails.hours[0].opens}–
                {exampleBusinessDetails.hours[0].closes}
              </p>
              <p className="text-xs text-primary-foreground/70">
                {exampleBusinessDetails.hours[0].label}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-primary-foreground/10 p-3 sm:col-span-1">
              <MapPin className="mb-2 size-5 text-peephole" aria-hidden />
              <p className="font-semibold">
                {exampleBusinessDetails.address.addressLocality}
              </p>
              <p className="text-xs text-primary-foreground/70">
                {exampleBusinessDetails.address.streetAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="relative order-1 flex min-h-72 items-center justify-center p-4 sm:min-h-96 sm:p-8 lg:order-2">
          <div className="friends-raised relative flex h-full min-h-64 w-full items-end overflow-hidden rounded-[2.25rem] bg-card p-4 sm:min-h-80 sm:p-6">
            <CouchScene />
            <div className="absolute right-4 bottom-4 max-w-48 rounded-2xl border border-coffee/10 bg-card/95 p-3 text-coffee shadow-lg backdrop-blur sm:right-6 sm:bottom-6">
              <p className="font-heading text-xl font-normal">
                Tu mesa está lista
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                Pide en barra y quédate a la sobremesa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative flex flex-col gap-16 sm:gap-20">
        <svg
          aria-hidden
          viewBox="0 0 1200 720"
          className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full lg:block"
        >
          <path
            d="M1060 30C760 90 1060 270 720 330S280 430 160 690"
            fill="none"
            stroke="var(--sofa)"
            strokeWidth="5"
            strokeDasharray="12 16"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>

        <section aria-labelledby="categorias" className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="friends-kicker mb-2 text-xs font-semibold text-primary">
                Elige tu antojo
              </p>
              <h2
                id="categorias"
                className="font-heading text-4xl font-normal tracking-tight text-coffee sm:text-5xl"
              >
                Categorías
              </h2>
            </div>
            <Link
              href="/carta"
              className="hidden min-h-11 items-center gap-2 rounded-full border border-primary/25 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
            >
              Ver todas
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {categories.map((category) => {
              const preview = category.products[0];

              return (
                <li key={category.id}>
                  <Link
                    href={`/carta#${category.slug}`}
                    className="friends-surface friends-raised group flex h-full min-h-11 flex-col overflow-hidden p-2.5 transition-transform motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="relative aspect-4/3 overflow-hidden rounded-[1.35rem] bg-secondary/30">
                      <ProductImage
                        imageUrl={preview?.imageUrl ?? null}
                        categorySlug={category.slug}
                        alt=""
                        sizes="(min-width: 1024px) 18rem, 46vw"
                        className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                      />
                    </span>
                    <span className="flex flex-col gap-0.5 px-2 pt-3 pb-2">
                      <span className="font-heading text-xl leading-tight font-normal text-coffee sm:text-2xl">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground sm:text-sm">
                        {category.products.length}{" "}
                        {category.products.length === 1
                          ? "producto"
                          : "productos"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="destacados"
          className="flex animate-fade-up flex-col gap-6 [animation-delay:180ms]"
        >
          <div>
            <p className="friends-kicker mb-2 text-xs font-semibold text-primary">
              Recién preparados
            </p>
            <h2
              id="destacados"
              className="font-heading text-4xl font-normal tracking-tight text-coffee sm:text-5xl"
            >
              Para empezar el día
            </h2>
          </div>
          {featured.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {featured.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    categorySlug={product.category.slug}
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="friends-surface p-6 text-muted-foreground">
              Todavía no hay productos disponibles en la carta.
            </p>
          )}
        </section>
      </div>

      <aside className="friends-surface friends-raised flex flex-col items-start justify-between gap-5 overflow-hidden bg-secondary/35 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-accent text-accent-foreground">
            <Coffee className="size-7" aria-hidden />
          </span>
          <div>
            <p className="font-heading text-3xl font-normal text-coffee">
              Hay sitio en el sofá
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Crea tu cuenta para valorar y compartir la sobremesa.
            </p>
          </div>
        </div>
        <Link
          href="/registro"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          Crear cuenta
        </Link>
      </aside>
    </div>
  );
}
