import type { MetadataRoute } from "next";

import { exampleBusinessDetails } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: exampleBusinessDetails.name,
    short_name: exampleBusinessDetails.shortName,
    description: exampleBusinessDetails.description,
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8EF",
    theme_color: "#4C2E8F",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
