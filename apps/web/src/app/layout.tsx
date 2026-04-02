import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
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
      <body className="antialiased bg-agri-bg min-h-screen flex flex-col lg:flex-row">
        <Providers>
          {/* Sidebar for desktop (hidden on mobile/auth via component logic) */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="app-main pb-nav lg:pb-0">
            <div className="app-content">
              {children}
            </div>
          </main>

          {/* Bottom Nav for mobile (hidden on desktop/auth via component logic) */}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
