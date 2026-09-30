export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  "http://localhost:3000";

export const exampleBusinessDetails = {
  name: "Café de la Esquina",
  shortName: "El Rincón",
  tagline: "Café de especialidad y sobremesa desde 1994",
  description:
    "Carta digital de Café de la Esquina: cafés de especialidad, dulces caseras y algo para picar. Consulta precios y disponibilidad sin esperas.",
  telephone: "+34 910 000 000",
  email: "hola@cafe-de-la-esquina.example",
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
  { href: "/", label: "Inicio" },
  { href: "/carta", label: "Carta" },
  { href: "/login", label: "Iniciar sesión" },
] as const;
