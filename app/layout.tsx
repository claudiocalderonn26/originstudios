import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Origin Studios | Limited drops",
  description: "Tienda premium de ropa en San José, Costa Rica.",
  icons: {
    icon: "/logo-origin.jpeg",
    apple: "/logo-origin.jpeg"
  },
  openGraph: {
    title: "Origin Studios",
    description: "Piezas exclusivas. Limited drops.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
