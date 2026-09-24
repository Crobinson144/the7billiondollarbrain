import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatWidget } from "@/components/ChatWidget";
import { env, publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "The 7 Billion Dollar Brain | Business services for small businesses", template: "%s | The 7 Billion Dollar Brain" },
  description: "Consulting, start-up support, business planning, market research, turnaround and HR services for small businesses. Leveling the playing field for small businesses.",
  openGraph: { siteName: "The 7 Billion Dollar Brain", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
        <ChatWidget crispId={publicEnv.crispWebsiteId} tawkProperty={publicEnv.tawkPropertyId} tawkWidget={publicEnv.tawkWidgetId} />
      </body>
    </html>
  );
}
