import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/constants";
import { JsonLd, organisationJsonLd, webSiteJsonLd } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { RevealProvider } from "@/components/layout/Reveal";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}. ${SITE.tagline}`,
    // Under 60 characters once a page title is substituted in.
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "environmental reporting Philippines",
    "EARTHLINK Philippines",
    "environmental action platform",
    "report illegal dumping Philippines",
    "environmental transparency",
  ],
  authors: [{ name: "Erick Cabal", url: "https://erickcabal.com" }],
  creator: "Erick Cabal",
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#07231E",
  width: "device-width",
  initialScale: 1,
  // Never lock zoom. Users must be able to reach 200 percent. WCAG 1.4.4.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <body className={`${fontVariables} font-body`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <DemoBanner />
        <Header />

        <main id="main">{children}</main>

        <Footer />

        <RevealProvider />
        <JsonLd data={[organisationJsonLd(), webSiteJsonLd()]} />
      </body>
    </html>
  );
}
