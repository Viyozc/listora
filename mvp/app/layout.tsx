import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Listora — Etsy Listing SEO & AI Generator for Digital Products",
  description:
    "Free Etsy listing SEO audit plus AI-generated titles, tags, and descriptions tuned for digital download sellers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
