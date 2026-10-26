import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { ScrollProgressBar } from "@/components/motion";
import { StructuredData } from "@/components/structured-data";
import { CookieConsent } from "@/components/cookie-consent";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CCNetball | Netball coaching with Caitlyn Strachan",
    template: "%s · CCNetball",
  },
  description:
    "Caitlyn Strachan — former Australian Diamond, triple ANZ Championship premiership winner, Queensland selector, and head coach of the Queensland Firebirds reserve team in 2027. The complete netball platform: in-person coaching, video game analysis, the Netball Drills Library, Competition Builder, and the Netball Shop.",
  metadataBase: new URL("https://ccnetball.com"),
  openGraph: {
    title: "CCNetball | Netball coaching with Caitlyn Strachan",
    description:
      "Train with a former Australian Diamond, Queensland selector and Firebirds reserve head coach. Elite accredited coaching, video analysis, drills library, shop and tools — the complete netball platform.",
    url: "https://ccnetball.com",
    siteName: "CCNetball",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CCNetball | Netball coaching with Caitlyn Strachan",
    description:
      "Train with a former Australian Diamond, Queensland selector and Firebirds reserve head coach. Elite accredited coaching, video analysis, drills library, shop and tools.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Site chrome stays off printed pages (e.g. session plans). */}
        <div className="contents print:hidden">
          <ScrollProgressBar />
        </div>
        <PostHogProvider>
          <CartProvider>
            <div className="contents print:hidden">
              <SiteHeader />
            </div>
            <main className="flex-1">{children}</main>
            <div className="contents print:hidden">
              <SiteFooter />
            </div>
            <CartDrawer />
          </CartProvider>
        </PostHogProvider>
        <div className="contents print:hidden">
          <CookieConsent />
        </div>
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
