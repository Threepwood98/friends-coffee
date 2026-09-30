import { toJsonLdJson } from "@/lib/seo";

/**
 * Renderiza JSON-LD en el HTML estático de un Server Component.
 * El contenido es serialización JSON de datos propios (nunca HTML de usuario)
 * y se escapan los `<` para que no pueda cerrarse el `<script>`.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLdJson(data) }}
    />
  );
}
