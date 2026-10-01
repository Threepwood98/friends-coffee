export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  "http://localhost:3000";

export const exampleBusinessDetails = {
  name: "Friends Coffee",
  shortName: "Friends",
  tagline: "I'll be there for you",
  description:
    "Carta digital de Friends Coffee: cafés de especialidad, dulces caseros y algo para picar. Consulta precios y disponibilidad sin esperas.",
  telephone: "+34 910 000 000",
  email: "email@friends.coffee",
  address: {
    streetAddress: "Calle Mayor 12",
    postalCode: "28013",
    addressLocality: "Madrid",
    addressRegion: "Madrid",
    addressCountry: "ES",
  },
  hours: [
    {
      day: "Monday",
      label: "Lunes a viernes",
      opens: "08:00",
      closes: "20:00",
    },
    {
      day: "Saturday",
      label: "Sábado",
      opens: "09:00",
      closes: "21:00",
    },
    { day: "Sunday", label: "Domingo", opens: "09:00", closes: "21:00" },
  ],
} as const;

export const navigation = [
  { href: "/menu", label: "Menú" },
  { href: "/cuenta", label: "Cuenta" },
] as const;
