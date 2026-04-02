"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Globe, LogOut, ChevronRight, Moon, Bell, Shield, HelpCircle, LucideIcon } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface MenuItem {
  icon: LucideIcon;
  label: string;
  value?: string | boolean;
  toggle?: boolean;
  action: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ProfilePage() {
  const { user, logout, checkAuth } = useAuthStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const currentUser = user || {
    name: "Farmer Rishi",
    phone: "+91 98765 43210",
    region: "Andhra Pradesh",
    language: "English",
  };

  const menuSections: MenuSection[] = [
    {
      title: "Preferences",
      items: [
        { icon: MapPin, label: "Region", value: currentUser.region || "India", action: () => {} },
        { icon: Globe, label: "Language", value: currentUser.language || "English", action: () => {} },
        { icon: Moon, label: "Dark Mode", toggle: true, value: isDark, action: () => setIsDark(!isDark) },
        { icon: Bell, label: "Notifications", value: "Enabled", action: () => {} },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", action: () => {} },
        { icon: Shield, label: "Privacy Policy", action: () => {} },
      ],
    },
  ];

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <motion.div {...fadeInUp} className="mb-6">
        <h1 className="text-xl font-bold font-display text-agri-text">Profile</h1>
      </motion.div>

      {/* User Card */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="glass-card p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-green flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold font-display text-agri-text">{currentUser.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{currentUser.phone}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-agri-green" />
              <span className="text-xs text-agri-green font-medium">{currentUser.region || "India"}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-2 mb-5">
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold font-display text-agri-green">19</p>
          <p className="text-[10px] text-gray-500">Total Scans</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold font-display text-agri-text">72</p>
          <p className="text-[10px] text-gray-500">Health Score</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold font-display text-amber-600">3</p>
          <p className="text-[10px] text-gray-500">Active Alerts</p>
        </div>
      </motion.div>

      {/* Menu Sections */}
      {menuSections.map((section, si) => (
        <motion.div key={section.title} {...fadeInUp} transition={{ delay: 0.3 + si * 0.1 }} className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{section.title}</h3>
          <div className="glass-card overflow-hidden divide-y divide-agri-border">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <Icon size={18} className="text-agri-green" />
                  <span className="flex-1 text-sm text-agri-text text-left">{item.label}</span>
                  {item.toggle ? (
                    <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${item.value ? "bg-agri-green" : "bg-gray-200"}`}>
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ x: item.value ? 16 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {typeof item.value === "string" && <span className="text-xs text-gray-400">{item.value}</span>}
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.button
        {...fadeInUp}
        transition={{ delay: 0.5 }}
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 border border-red-200 mb-8"
        id="logout-btn"
      >
        <LogOut size={18} className="text-red-500" />
        <span className="text-sm font-semibold text-red-500">Log Out</span>
      </motion.button>

      {/* Version */}
      <p className="text-center text-[10px] text-gray-300 mb-4">AgriGuard v1.0.0 — Made for Indian Farmers 🇮🇳</p>
    </div>
  );
}
