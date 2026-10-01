import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleOff,
  Coffee,
  MessageCircle,
  StarIcon,
} from "lucide-react";
import { cn } from "cn";

import { ProductImage } from "@/components/product/product-image";
import { ProductInteractions } from "@/components/product/product-interactions";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import {
  getProductBySlug,
  getProductRedirectSlug,
  getProductSlugs,
} from "@/lib/catalog";
import { getProductComments } from "@/lib/comments";
import { formatPrice } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";
import { getProductRatingSummary } from "@/lib/ratings";
import { breadcrumbListJsonLd, productJsonLd } from "@/lib/seo";
import { exampleBusinessDetails } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getProductSlugs();

  return slugs.map((slug) => ({ slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description: `${product.description} ${formatPrice(product.price)} en ${exampleBusinessDetails.name}.`,
    alternates: { canonical: `/menu/${product.slug}` },
    openGraph: {
      type: "article",
      title: product.name,
      description: product.description,
      url: `/menu/${product.slug}`,
    },
    twitter: {
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    const redirectSlug = await getProductRedirectSlug(slug);

    if (redirectSlug) {
      permanentRedirect(`/menu/${redirectSlug}`);
    }

    notFound();
  }

  const prisma = await getPrisma();
  const [summary, comments] = await Promise.all([
    getProductRatingSummary(prisma, product.id),
    getProductComments(prisma, product.id),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:gap-10 sm:py-12">
      <JsonLd
        data={productJsonLd({
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          available: product.available,
          imageUrl: product.imageUrl,
          ratingSummary: summary,
        })}
      />
      <JsonLd
        data={breadcrumbListJsonLd([
          { name: "Menú", href: "/menu" },
          { name: product.category.name },
          { name: product.name },
        ])}
      />
      <div className="relative aspect-square rounded-b-4xl overflow-hidden">
        <ProductImage
          imageUrl={product.imageUrl}
          categorySlug={product.category.slug}
          alt={product.name}
          sizes="(min-width: 1280px) 38rem, (min-width: 768px) 50vw, 92vw"
          priority
        />
      </div>
      <div className="flex flex-col gap-2 w-full px-4 justify-center">
        <h1 className="font-heading leading-none text-coffee text-3xl sm:text-6xl">
          {product.name}
        </h1>
        <div className="flex items-center justify-between font-heading text-coffee text-2xl">
          <span className="tabular-nums">{formatPrice(product.price)}</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <MessageCircle aria-hidden />
              <span className="sr-only">Comentarios:</span>
              {product.commentCount ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <StarIcon aria-hidden />
              <span className="sr-only">Valoración media:</span>
              {product.ratingAverage?.toFixed(1) ?? "–"}
            </span>
          </div>
        </div>
        <div className="flex w-full gap-2">
          {/* valoracion delproducto */}
          <StarIcon aria-hidden />
          <StarIcon aria-hidden />
          <StarIcon aria-hidden />
          <StarIcon aria-hidden />
          <StarIcon aria-hidden />
        </div>
        <div>
          <span className="font-heading text-coffee text-2xl">
            Descripción:
          </span>
          <p className="text-xl text-muted-foreground">{product.description}</p>
        </div>
        <div>
          <span className="font-heading text-coffee text-2xl">
            Comentarios:
          </span>
          <p className="text-xl text-muted-foreground">
            Aun no hay comentarios
          </p>
        </div>
      </div>
      {/* <article className="grid gap-0 md:grid-cols-2 md:gap-7">
        <div className="friends-surface relative -mt-7 flex flex-col gap-5 px-6 pt-12 pb-7 sm:px-8 sm:pb-8 md:mt-0 md:p-9">
          <p className="friends-kicker text-xs font-semibold text-primary">
            {product.category.name}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "text-3xl font-bold text-primary tabular-nums",
                !product.available && "text-muted-foreground",
              )}
            >
              {formatPrice(product.price)}
            </span>
            {!product.available && <Badge variant="outline">Agotado</Badge>}
            {summary.count > 0 ? (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-secondary/45 px-3 text-sm font-medium text-coffee">
                <Coffee
                  className="size-4 fill-current text-accent"
                  aria-hidden
                />
                {(summary.average ?? 0).toLocaleString("es-ES", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                de 5 · {summary.count}{" "}
                {summary.count === 1 ? "valoración" : "valoraciones"}
              </span>
            ) : null}
          </div>

          <p className="text-lg leading-8 text-muted-foreground">
            {product.description}
          </p>

          {product.available ? (
            <div className="flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-4 text-sm leading-6">
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-accent"
                aria-hidden
              />
              <p>
                Disponible hoy en {exampleBusinessDetails.shortName}. Puedes
                pedirlo en barra al llegar.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed p-4 text-sm leading-6 text-muted-foreground">
              <CircleOff className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p>
                Se ha agotado hoy. Vuelve a consultarlo mañana, seguimos
                reponiendo cada jornada.
              </p>
            </div>
          )}

          <div>
            <Link
              href="/menu"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/25 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver a la carta
            </Link>
          </div>
        </div>
      </article> */}

      {/* <ProductInteractions
        productId={product.id}
        productSlug={product.slug}
        summary={summary}
        comments={comments}
      /> */}
    </div>
  );
}
