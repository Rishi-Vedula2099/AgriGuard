"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, ScanLine, Clock, BarChart3, User, Sprout,
  Droplets, Map as MapIcon, Leaf, LogOut,
  ShieldCheck, ThermometerSun
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/scan", label: "AI Scan", icon: ScanLine },
  { href: "/crops", label: "Crop Intel", icon: Sprout },
  { href: "/climate", label: "Climate Radar", icon: MapIcon },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
  { href: "/history", label: "Intelligence Logs", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  // Hide on auth pages, welcome, and scan result pages
  if (
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/welcome") ||
    pathname?.startsWith("/scan/result") ||
    pathname?.startsWith("/scan/field-result")
  ) return null;

  const handleLogout = () => {
    logout();
    router.push("/welcome");
  };

  return (
    <aside className="app-sidebar bg-[#050a08] border-r border-white/5 w-72 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-8 py-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <Leaf size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white tracking-tight">AgriGuard</h1>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">AI Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          Intelligence System
        </p>
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-white"} transition-colors`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-sm font-bold">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-emerald-400">
              {(user?.name || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-gray-500 truncate font-medium">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm"
          id="sidebar-logout"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
