import "dotenv/config";

import { copyFileSync, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { resolveSqlitePath } from "./lib/database";

const SQLITE_MAGIC = "SQLite format 3\0";

function isSqliteFile(filePath: string): boolean {
  const buffer = readFileSync(filePath).subarray(0, 16);

  return Buffer.from(buffer).toString("latin1") === SQLITE_MAGIC;
}

function currentTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const snapshotArg = process.argv[2];

  if (!snapshotArg) {
    console.error("Uso: pnpm db:restore <ruta-al-snapshot.db>");
    process.exitCode = 1;
    return;
  }

  const snapshotPath = path.resolve(snapshotArg);

  if (!existsSync(snapshotPath)) {
    console.error(`El snapshot no existe: ${snapshotPath}`);
    process.exitCode = 1;
    return;
  }

  if (!isSqliteFile(snapshotPath)) {
    console.error(
      `El archivo no parece una base SQLite válida: ${snapshotPath}`,
    );
    process.exitCode = 1;
    return;
  }

  const databasePath = resolveSqlitePath();
  console.log(
    `Vas a restaurar ${snapshotPath} (${statSync(snapshotPath).size} bytes) sobre ${databasePath}.`,
  );
  console.log(
    "Asegúrate de que la aplicación esté detenida: restaurar con la app escribiendo corrompería los datos.",
  );

  if (existsSync(databasePath)) {
    const safetyCopy = `${databasePath}.pre-restore-${currentTimestamp()}`;
    copyFileSync(databasePath, safetyCopy);
    console.log(`Copia de seguridad previa guardada en: ${safetyCopy}`);
  }

  copyFileSync(snapshotPath, databasePath);
  console.log(`Base de datos restaurada en: ${databasePath}`);
  console.log(
    "Reinicia la aplicación. No hace falta migrar de nuevo salvo que el snapshot sea de otro esquema.",
  );
}

main().catch((error: unknown) => {
  console.error(
    `No se pudo restaurar la base de datos: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
