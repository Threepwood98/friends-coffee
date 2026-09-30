import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";

import { ProductImage } from "@/components/product/product-image";
import { ProductInteractions } from "@/components/product/product-interactions";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProductSlugs } from "@/lib/catalog";
import { getProductComments } from "@/lib/comments";
import { formatPrice } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";
import { getProductRatingSummary } from "@/lib/ratings";
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
    description: `${product.description} ${formatPrice(product.priceCents)} en ${exampleBusinessDetails.name}.`,
    alternates: { canonical: `/carta/${product.slug}` },
    openGraph: {
      type: "article",
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const prisma = await getPrisma();
  const [summary, comments] = await Promise.all([
    getProductRatingSummary(prisma, product.id),
    getProductComments(prisma, product.id),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <nav aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground"
            >
              Inicio
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4" />
          </li>
          <li>
            <Link
              href="/carta"
              className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground"
            >
              Carta
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4" />
          </li>
          <li>
            <Link
              href={`/carta#${product.category.slug}`}
              className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="py-3 text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <article className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
          <ProductImage
            imageUrl={product.imageUrl}
            categorySlug={product.category.slug}
            alt={product.name}
            sizes="(min-width: 768px) 40rem, 92vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            {product.category.name}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                !product.available && "text-muted-foreground",
              )}
            >
              {formatPrice(product.priceCents)}
            </span>
            {!product.available && <Badge variant="outline">Agotado</Badge>}
          </div>

          <p className="text-lg leading-8 text-muted-foreground">
            {product.description}
          </p>

          {product.available ? (
            <p className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              Disponible hoy en {exampleBusinessDetails.shortName}. Puedes
              pedirlo en barra al llegar.
            </p>
          ) : (
            <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
              Se ha agotado hoy. Vuelve a consultarlo mañana, seguimos
              reponiendo cada jornada.
            </p>
          )}

          <div>
            <Link
              href="/carta"
              className="inline-flex min-h-11 items-center rounded-md border px-5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Volver a la carta
            </Link>
          </div>
        </div>
      </article>

      <ProductInteractions
        productId={product.id}
        productSlug={product.slug}
        summary={summary}
        comments={comments}
      />
    </div>
  );
}
