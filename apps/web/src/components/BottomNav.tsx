"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ScanLine, Clock, BarChart3, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/history", label: "History", icon: Clock },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth and chat pages
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/chat")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="bg-white/90 backdrop-blur-xl border-t border-agri-border shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-2 px-3 relative"
                id={`nav-${item.label.toLowerCase()}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 w-8 h-1 rounded-full gradient-green"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? "text-agri-green" : "text-gray-400"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-agri-green" : "text-gray-400"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for iPhones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}
