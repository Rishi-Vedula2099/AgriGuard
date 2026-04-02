"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ScanLine, Clock, BarChart3, User, BookOpen, Calendar, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const farmerNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/history", label: "History", icon: Clock },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const studentNavItems = [
  { href: "/student", label: "Home", icon: Home },
  { href: "/learn/sessions", label: "Sessions", icon: BookOpen },
  { href: "/learn/bookings", label: "Bookings", icon: Calendar },
  { href: "/learn/notes", label: "Notes", icon: GraduationCap },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  // Hide on auth, welcome, chat pages, and on desktop (handled by Sidebar)
  if (!isAuthenticated) return null;
  if (
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/welcome") ||
    pathname?.startsWith("/chat")
  ) return null;

  const role = user?.role || "FARMER";
  const navItems = role === "STUDENT" ? studentNavItems : farmerNavItems;

  return (
    // Only visible on mobile (< 1024px), hidden on desktop via CSS
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-xl border-t border-agri-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && item.href !== "/student" && pathname?.startsWith(item.href));
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
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-agri-green" : "text-gray-400"
                  }`}
                >
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
