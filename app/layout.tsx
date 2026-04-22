import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

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
  title: "EACC - East African Commodities Company",
  description: "Live commodity price intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body className="font-space-grotesk">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="md:ml-[68px] mb-16 md:mb-0 min-h-screen bg-[var(--surface)] p-4 md:p-5">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </body>
    </html>
  );
}
