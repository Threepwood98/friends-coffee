import { ImageResponse } from "next/og";

import { FriendsWordmark } from "@/components/brand/friends-wordmark";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice, resolveProductImage } from "@/lib/format";
import { getFriendsFontBuffer } from "@/lib/friends-font";
import { getPrisma } from "@/lib/prisma";
import { getProductRatingSummary } from "@/lib/ratings";
import { exampleBusinessDetails, siteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const friendsFont = { name: "Friends", data: getFriendsFontBuffer() };

interface ProductImageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductOpenGraphImage({
  params,
}: ProductImageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#FFF8EF",
          color: "#241712",
          fontSize: 48,
        }}
      >
        <FriendsWordmark
          style={{ fontFamily: "Friends", fontWeight: 400, fontSize: 84 }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 28,
          }}
        >
          Este producto ya no está en la carta
        </p>
      </div>,
      {
        ...size,
        fonts: [friendsFont],
      },
    );
  }

  const prisma = await getPrisma();
  const summary = await getProductRatingSummary(prisma, product.id);
  const imageUrl = resolveProductImage(product);
  const ogImageUrl = imageUrl.startsWith("/")
    ? `${siteUrl}${imageUrl}`
    : imageUrl;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        background: "#FFF8EF",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: "0 0 520px",
          alignItems: "center",
          justifyContent: "center",
          background: "#241712",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ogImageUrl}
          alt=""
          width="520"
          height="630"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "0 72px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 26,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#7A5C43",
          }}
        >
          {product.category.name} · {exampleBusinessDetails.name}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "Friends",
            fontWeight: 400,
            fontSize: 76,
            lineHeight: 1.08,
            color: "#241712",
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 52,
            fontWeight: 700,
            color: "#4C2E8F",
          }}
        >
          {formatPrice(product.priceCents)}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            lineHeight: 1.4,
            color: "#7A5C43",
          }}
        >
          {product.description}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: "#241712",
          }}
        >
          {summary.count > 0
            ? `${(summary.average ?? 0).toFixed(1)} de 5 · ${summary.count} ${
                summary.count === 1 ? "valoración" : "valoraciones"
              }`
            : "Sin valoraciones todavía"}
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts: [friendsFont],
    },
  );
}
