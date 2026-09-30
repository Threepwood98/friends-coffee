import "dotenv/config";

import { mkdirSync, statSync } from "node:fs";
import path from "node:path";

import { v2 as cloudinary } from "cloudinary";

import { getPrisma } from "../src/lib/prisma";
import { projectRoot, resolveSqlitePath } from "./lib/database";

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

async function uploadToCloudinary(snapshotPath: string, publicId: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.log(
      "Cloudinary no configurado: se omite la copia remota (revisa CLOUDINARY_*).",
    );
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const result = await cloudinary.uploader.upload(snapshotPath, {
    resource_type: "raw",
    folder: "friends-coffee/backups",
    public_id: publicId,
    unique_filename: false,
    overwrite: false,
  });

  console.log(
    `Copia remota subida a Cloudinary: ${result.public_id} (${result.secure_url})`,
  );
}

async function main() {
  const databasePath = resolveSqlitePath();
  const snapshotName = `friends-coffee-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.db`;
  const backupDir = path.join(projectRoot, "backups");

  mkdirSync(backupDir, { recursive: true });

  const snapshotPath = path.join(backupDir, snapshotName);
  const prisma = await getPrisma();

  try {
    // VACUUM INTO genera una copia consistente aunque la app esté escribiendo.
    await prisma.$executeRawUnsafe(
      `VACUUM INTO '${escapeSqlLiteral(snapshotPath)}'`,
    );
  } finally {
    await prisma.$disconnect();
  }

  const sizeBytes = statSync(snapshotPath).size;
  console.log(
    `Copia local creada: ${snapshotPath} (${sizeBytes} bytes, base ${databasePath})`,
  );

  await uploadToCloudinary(snapshotPath, snapshotName.replace(/\.db$/, ""));
}

main().catch((error: unknown) => {
  console.error(
    `No se pudo crear la copia de seguridad: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
