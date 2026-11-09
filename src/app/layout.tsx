import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { TYPEKIT_KIT_ID } from "@/lib/typekit";
import "./globals.css";

const nohemi = localFont({
  src: [
    { path: "../../public/fonts/nohemi/Nohemi-Regular-BF6438cc579d934.woff",  weight: "400", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-Medium-BF6438cc57ddecd.woff",   weight: "500", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-SemiBold-BF6438cc57db2ff.woff", weight: "600", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-Bold-BF6438cc577b524.woff",     weight: "700", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-ExtraBold-BF6438cc5761ae2.woff",weight: "800", style: "normal" },
  ],
  variable: "--font-nohemi",
  display: "swap",
});


const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Meta (Facebook/Instagram) ads pixel — Dr. Pick's ad account, for the
// campaigns launching off wenfoods.com.
const META_PIXEL_ID = "519848398532937"

const SITE_URL = "https://wenfoods.com"
const TITLE = "WEN — Fresh Farm Produce, Direct From Trusted Farmers"
const DESCRIPTION =
  "WEN connects farmers directly to buyers to ensure fresh produce, fair pricing, and faster delivery across communities."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "WEN",
    type: "website",
    locale: "en_NG",
    // opengraph-image.png in this folder is picked up automatically.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    // twitter-image.png in this folder is picked up automatically.
  },
};

// True once an Adobe Fonts project ID is set in src/lib/typekit.ts
const museo = TYPEKIT_KIT_ID !== "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-font={museo ? "museo" : undefined}
      className={`${nohemi.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {museo && (
          <>
            <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
            <link rel="stylesheet" href={`https://use.typekit.net/${TYPEKIT_KIT_ID}.css`} />
          </>
        )}
        {/* beforeInteractive is required here (not afterInteractive) so this
         * renders as a literal <script> tag in the server-rendered <head> —
         * matching Meta's own install instructions exactly, which matters
         * for their automated "is the pixel installed" checker. */}
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-grain text-soil">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <LocationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LocationProvider>
        <Analytics />
      </body>
    </html>
  );
}
