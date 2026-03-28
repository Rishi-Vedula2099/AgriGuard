import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "AgriGuard — AI Crop Health Platform",
  description: "Detect crop diseases, analyze field health, and get AI-powered farming advice. Built for Indian farmers.",
  keywords: ["agriculture", "crop disease", "AI", "farming", "India", "AgriGuard"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16A34A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="app-container">
            <main className="pb-nav">
              {children}
            </main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
