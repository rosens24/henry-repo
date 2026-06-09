import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Henry IV",
    short_name: "Henry IV",
    description: "Voice-first command website for Cleanz, Cedar Neck Realty, and Health OS.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#030303",
    theme_color: "#030303",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  };
}
