import { hash } from "bcrypt";
import { z } from "zod";

import { prisma } from "../src/lib/prisma";
import { userRoleSchema } from "../src/lib/validators/user";

const BCRYPT_COST = 12;
const REQUIRE_ADMIN_FLAG = "--require-admin";
const ADMIN_ROLE = userRoleSchema.parse("ADMIN");

const adminCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(12)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

const catalog = [
  {
    name: "Cafés",
    slug: "cafes",
    position: 1,
    products: [
      {
        name: "El espresso de siempre",
        slug: "espresso-de-siempre",
        description:
          "Doble extracción de nuestro blend con notas de cacao, avellana tostada y un final de caramelo.",
        priceCents: 220,
      },
      {
        name: "El americano de la tertulia",
        slug: "americano-de-la-tertulia",
        description:
          "Espresso largo con agua caliente, aroma intenso y cuerpo ligero para alargar la conversación.",
        priceCents: 260,
      },
      {
        name: "El cappuccino del reencuentro",
        slug: "cappuccino-del-reencuentro",
        description:
          "Espresso, leche vaporizada y una nube de espuma terminada con un toque delicado de canela.",
        priceCents: 330,
      },
    ],
  },
  {
    name: "Especialidades",
    slug: "especialidades",
    position: 2,
    products: [
      {
        name: "El latte de caramelo del sofá",
        slug: "latte-caramelo-del-sofa",
        description:
          "Café espresso con leche cremosa y caramelo casero, equilibrado para una pausa larga y cómoda.",
        priceCents: 390,
      },
      {
        name: "El mocha de la mirilla",
        slug: "mocha-de-la-mirilla",
        description:
          "Chocolate negro, espresso y leche sedosa coronados con cacao puro y una pizca de sal marina.",
        priceCents: 410,
      },
      {
        name: "El cold brew del vecindario",
        slug: "cold-brew-del-vecindario",
        description:
          "Infusión en frío durante dieciséis horas, servida con hielo y un giro fresco de piel de naranja.",
        priceCents: 380,
      },
    ],
  },
  {
    name: "Dulces",
    slug: "dulces",
    position: 3,
    products: [
      {
        name: "La tarta de queso naranja",
        slug: "tarta-queso-naranja",
        description:
          "Tarta de queso horneada con base crujiente y una compota suave de naranja preparada en casa.",
        priceCents: 450,
      },
      {
        name: "La cookie para compartir",
        slug: "cookie-chocolate-compartida",
        description:
          "Galleta de mantequilla con chocolate negro y con leche, centro tierno y escamas de sal.",
        priceCents: 290,
      },
    ],
  },
  {
    name: "Salados",
    slug: "salados",
    position: 4,
    products: [
      {
        name: "El bagel del descanso",
        slug: "bagel-del-descanso",
        description:
          "Bagel tostado con queso crema, aguacate, tomate aliñado y brotes frescos de temporada.",
        priceCents: 560,
      },
      {
        name: "El croissant de pavo y brie",
        slug: "croissant-pavo-brie",
        description:
          "Croissant de mantequilla relleno de pavo asado, queso brie y mostaza suave con miel.",
        priceCents: 590,
      },
    ],
  },
] as const;

async function seedCatalog() {
  const created = await prisma.$transaction(async (transaction) => {
    const [userCount, categoryCount, productCount] = await Promise.all([
      transaction.user.count(),
      transaction.category.count(),
      transaction.product.count(),
    ]);

    if (userCount > 0 || categoryCount > 0 || productCount > 0) {
      return false;
    }

    for (const category of catalog) {
      await transaction.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          position: category.position,
          products: {
            create: category.products.map((product) => ({
              ...product,
              available: true,
            })),
          },
        },
      });
    }

    return true;
  });

  console.info(
    created
      ? "Seeded 4 categories and 10 products."
      : "Catalog already initialized; no changes applied.",
  );
}

function readAdminCredentials() {
  const requireAdmin = process.argv.includes(REQUIRE_ADMIN_FLAG);
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) {
    if (requireAdmin) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required for the production seed.",
      );
    }

    console.info("Admin seed skipped because credentials are not configured.");
    return null;
  }

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be configured together.",
    );
  }

  const credentials = adminCredentialsSchema.safeParse({ email, password });

  if (!credentials.success) {
    throw new Error(
      "Admin credentials are invalid. Use a valid email and a password of at least 12 characters and at most 72 bytes.",
    );
  }

  return credentials.data;
}

async function seedAdmin(
  credentials: z.infer<typeof adminCredentialsSchema> | null,
) {
  if (!credentials) {
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (existingUser) {
    const existingRole = userRoleSchema.safeParse(existingUser.role);

    if (!existingRole.success || existingRole.data !== ADMIN_ROLE) {
      throw new Error(
        "The configured admin email belongs to a non-admin user; no changes were applied.",
      );
    }

    console.info("Admin already exists; no changes applied.");
    return;
  }

  const passwordHash = await hash(credentials.password, BCRYPT_COST);

  await prisma.user.create({
    data: {
      email: credentials.email,
      name: "Administrador",
      passwordHash,
      role: ADMIN_ROLE,
    },
  });

  console.info("Admin created.");
}

async function main() {
  const adminCredentials = readAdminCredentials();

  await seedCatalog();
  await seedAdmin(adminCredentials);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
