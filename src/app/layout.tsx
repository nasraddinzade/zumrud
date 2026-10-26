import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { DemoBanner } from "@/components/DemoBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Оба шрифта покрывают ə ş ç ğ ı ö ü (latin-ext) и кириллицу.
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerifDisplay = Noto_Serif_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-serif-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zümrüd Parfum",
    template: "%s | Zümrüd Parfum",
  },
  description:
    "Zümrüd Parfum. Şərq ətirləri, Bakı, Nəsimi rayonu. Rasasi, Lattafa, Afnan, French Avenue.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B2A21",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${inter.variable} ${notoSerifDisplay.variable}`}>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>
          <CartProvider>
            {/* Плашка демо и шапка едут вместе при прокрутке и не перекрывают контент */}
            <div className="sticky top-0 z-40 shadow-[0_1px_0_rgba(201,162,39,0.35)]">
              <DemoBanner />
              <Header />
            </div>
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
