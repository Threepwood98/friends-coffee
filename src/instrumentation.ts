export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializePrisma } = await import("@/lib/prisma");

    await initializePrisma();
  }
}
