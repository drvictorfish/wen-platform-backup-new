import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
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

// Meta (Facebook/Instagram) ads pixels — Dr. Pick's ad account, for the
// campaigns launching off wenfoods.com. Keeping both IDs registered (rather
// than swapping) since it's unclear whether the second one replaces the
// first or is a second pixel — fbq tracks PageView on every registered id,
// so having both costs nothing and is easy to trim later.
const META_PIXEL_IDS = ["519848398532937", "2405943683566758"]

// Deliberately a raw <script> below, NOT next/script. In this Next.js
// version, even strategy="beforeInteractive" doesn't emit the script as
// literal text in the server-rendered HTML — it's serialized into a
// self.__next_s queue and only turned into a real <script> element via
// document.head.appendChild() once client JS runs (see
// node_modules/next/dist/esm/client/app-bootstrap.js). That's invisible to
// anything that fetches the page without executing JS — which is exactly
// how Meta's pixel-installation checker was failing to find it. A raw
// <script dangerouslySetInnerHTML> renders as literal, parseable script
// text straight from the server, matching Meta's own "paste this between
// <head> and </head>" instructions exactly.
const META_PIXEL_SCRIPT = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
${META_PIXEL_IDS.map(id => `fbq('init', '${id}');`).join('\n')}
fbq('track', 'PageView');`

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
        <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: META_PIXEL_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-grain text-soil">
        <noscript>
          {META_PIXEL_IDS.map(id => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={id}
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
              alt=""
            />
          ))}
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
