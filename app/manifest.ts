import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F1F5F1",
    theme_color: "#07231E",
    lang: "en-PH",
    categories: ["education", "government", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    // The primary action, so an installed app can jump straight to it.
    shortcuts: [
      { name: "Report a concern", url: "/report" },
      { name: "The EARTH Map", url: "/map" },
    ],
  };
}
