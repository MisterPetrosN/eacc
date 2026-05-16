import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Isoko Prices",
  description: "Ibiciro by'ibicuruzwa mu karere - Live commodity prices across East Africa",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Isoko Prices",
    description: "Ibiciro by'ibicuruzwa mu karere - Live commodity prices across East Africa",
    siteName: "Isoko Prices",
    images: [
      {
        url: "/og-image.png",
        width: 1254,
        height: 1254,
        alt: "Isoko Prices - East African Commodity Prices",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Isoko Prices",
    description: "Ibiciro by'ibicuruzwa mu karere - Live commodity prices across East Africa",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body className="font-space-grotesk">
        <Providers>
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="md:ml-[68px] mb-16 md:mb-0 min-h-screen bg-[#EDE4D3] p-4 md:p-5">
            {children}
          </main>

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
