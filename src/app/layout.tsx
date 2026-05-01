import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { ScrollProgressBar } from "@/components/motion";
import { StructuredData } from "@/components/structured-data";
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
    "Caitlyn Strachan played for the Australian Diamonds and won three premierships with the Vixens and Firebirds. Now she coaches netball athletes across Australia. 1-on-1, small group, team training, video analysis and online mentoring.",
  metadataBase: new URL("https://ccnetball.com"),
  openGraph: {
    title: "CCNetball | Netball coaching with Caitlyn Strachan",
    description:
      "Train with a former Australian Diamond and triple premiership winner. 1-on-1, group, team and online netball coaching across Australia.",
    url: "https://ccnetball.com",
    siteName: "CCNetball",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CCNetball | Netball coaching with Caitlyn Strachan",
    description:
      "Train with a former Australian Diamond. 1-on-1, group, team and online coaching.",
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
        <ScrollProgressBar />
        <PostHogProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </PostHogProvider>
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
