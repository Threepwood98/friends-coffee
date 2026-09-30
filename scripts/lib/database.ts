import { fileURLToPath } from "node:url";
import path from "node:path";

export const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export function resolveSqlitePath(): string {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error("DATABASE_URL no está definida.");
  }

  const match = /^file:(.+)$/.exec(raw);

  if (!match) {
    throw new Error(
      "DATABASE_URL debe apuntar a un archivo SQLite (formato file:...).",
    );
  }

  const filePath = match[1];

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  // Prisma resuelve las rutas relativas respecto al directorio del schema.
  return path.resolve(projectRoot, "prisma", filePath);
}
