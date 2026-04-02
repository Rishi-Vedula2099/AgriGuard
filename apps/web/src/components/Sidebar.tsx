"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, ScanLine, Clock, BarChart3, User, BookOpen,
  Calendar, GraduationCap, Leaf, DollarSign, LogOut,
  Settings, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const farmerNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/scan", label: "Crop Scan", icon: ScanLine },
  { href: "/history", label: "Scan History", icon: Clock },
  { href: "/insights", label: "Analytics", icon: BarChart3 },
  { href: "/farmer/my-sessions", label: "My Sessions", icon: Calendar },
  { href: "/farmer/earnings", label: "Earnings", icon: DollarSign },
  { href: "/profile", label: "Profile", icon: User },
];

const studentNavItems = [
  { href: "/student", label: "Dashboard", icon: Home },
  { href: "/learn/sessions", label: "Browse Sessions", icon: BookOpen },
  { href: "/learn/bookings", label: "My Bookings", icon: Calendar },
  { href: "/learn/notes", label: "My Notes", icon: GraduationCap },
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

  const role = user?.role || "FARMER";
  const navItems = role === "STUDENT" ? studentNavItems : farmerNavItems;

  const handleLogout = () => {
    logout();
    router.push("/welcome");
  };

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center shadow-lg shadow-green-200">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-agri-text">AgriGuard</h1>
            <p className="text-[10px] text-agri-text-secondary">AI Farming Platform</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 mb-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          role === "STUDENT"
            ? "bg-blue-50 text-blue-700 border border-blue-100"
            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        }`}>
          {role === "STUDENT" ? <GraduationCap size={12} /> : <Leaf size={12} />}
          {role === "STUDENT" ? "Student" : "Farmer"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0">
        <p className="px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && item.href !== "/student" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-agri-green"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="px-4 pt-4 border-t border-agri-border mt-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-emerald-700">
              {(user?.name || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-agri-text truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          id="sidebar-logout"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
