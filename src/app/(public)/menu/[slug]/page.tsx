import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CircleOff, MessageCircle, StarIcon } from "lucide-react";

import { ProductImage } from "@/components/product/product-image";
import { ProductInteractions } from "@/components/product/product-interactions";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProductRedirectSlug } from "@/lib/catalog";
import { getProductComments } from "@/lib/comments";
import { formatPrice } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";
import { getProductRatingSummary } from "@/lib/ratings";
import { breadcrumbListJsonLd, productJsonLd } from "@/lib/seo";
import { exampleBusinessDetails } from "@/lib/site";

export const revalidate = 300;

const ratingFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function generateStaticParams() {
  return [];
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
  const ratingLabel =
    summary.average == null
      ? "Sin valoraciones"
      : `Valoración media: ${ratingFormatter.format(summary.average)} de 5`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:py-12 lg:px-4">
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
          {
            name: product.category.name,
            href: `/menu#${product.category.slug}`,
          },
          { name: product.name },
        ])}
      />

      <article className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="relative aspect-square overflow-hidden rounded-b-4xl bg-secondary/25 lg:sticky lg:top-24 lg:rounded-4xl">
          <ProductImage
            imageUrl={product.imageUrl}
            categorySlug={product.category.slug}
            alt={product.name}
            sizes="(min-width: 1024px) 30rem, 100vw"
            priority
            className={
              product.available ? undefined : "grayscale brightness-75"
            }
          />
          {!product.available && (
            <Badge
              variant="outline"
              className="absolute top-4 left-4 min-h-9 border-card bg-card/95 px-3 text-coffee shadow-sm backdrop-blur"
            >
              <CircleOff className="size-4" aria-hidden />
              Agotado
            </Badge>
          )}
        </div>

        <div className="flex w-full flex-col justify-center gap-3 px-4 lg:px-0 lg:py-4">
          <h1 className="font-heading text-3xl leading-none text-coffee sm:text-6xl">
            {product.name}
          </h1>

          <div className="flex items-center justify-between font-heading text-2xl text-coffee">
            <span
              aria-label={`Precio: ${product.price} pesos cubanos`}
              className="tabular-nums"
            >
              {formatPrice(product.price)}
            </span>
            <div className="flex gap-3">
              <span
                className="flex items-center gap-1"
                aria-label={`${comments.length} ${comments.length === 1 ? "comentario" : "comentarios"}`}
              >
                <MessageCircle aria-hidden />
                <span aria-hidden>{comments.length}</span>
              </span>
              <span
                className="flex items-center gap-1"
                aria-label={ratingLabel}
              >
                <StarIcon aria-hidden />
                <span aria-hidden>
                  {summary.average == null
                    ? "–"
                    : ratingFormatter.format(summary.average)}
                </span>
              </span>
            </div>
          </div>

          <ProductInteractions
            key={product.id}
            productId={product.id}
            productSlug={product.slug}
            summary={summary}
            comments={comments}
          >
            <section aria-labelledby="description-heading">
              <h2
                id="description-heading"
                className="font-heading text-2xl text-coffee"
              >
                Descripción:
              </h2>
              <p className="text-xl leading-8 text-muted-foreground">
                {product.description}
              </p>
            </section>
          </ProductInteractions>
        </div>
      </article>
    </div>
  );
}
