import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store",
} as const;

export async function GET() {
  try {
    const prisma = await getPrisma();
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      { status: "ok" },
      {
        headers: responseHeaders,
      },
    );
  } catch (error: unknown) {
    console.error("Health check failed.", error);

    return Response.json(
      { status: "unavailable" },
      {
        status: 503,
        headers: responseHeaders,
      },
    );
  }
}
