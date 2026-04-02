"use client";

import { motion } from "framer-motion";
import { ScanLine, MessageCircle, Leaf, TreePine, TrendingUp, Droplets, Sun, CloudRain, Calendar, DollarSign, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import HealthRing from "@/components/HealthRing";
import ThreatBadge from "@/components/ThreatBadge";
import CropHealthCard from "@/components/CropHealthCard";
import { useAuthStore } from "@/lib/store";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// Demo data — replace with live API data
const recentScans = [
  { title: "Tomato Leaf Scan", disease: "Late Blight", confidence: 0.87, severity: "medium" as const, scanType: "leaf" as const, date: "2 hours ago" },
  { title: "Rice Field Analysis", disease: "Brown Spot", confidence: 0.72, severity: "low" as const, scanType: "field" as const, date: "Yesterday" },
  { title: "Wheat Leaf Check", disease: "Healthy ✅", confidence: 0.95, severity: undefined, scanType: "leaf" as const, date: "2 days ago" },
];

const weatherTips = [
  { icon: CloudRain, text: "Rain expected tomorrow — delay fertilizer application", color: "text-blue-500" },
  { icon: Droplets, text: "High humidity — watch for fungal diseases", color: "text-cyan-500" },
  { icon: Sun, text: "Good weather for harvesting this week", color: "text-amber-500" },
];

const quickActions = [
  { href: "/scan", icon: Leaf, label: "Leaf Scan", desc: "Detect disease", bg: "bg-emerald-50", color: "text-emerald-600", id: "quick-scan-leaf" },
  { href: "/scan?type=field", icon: TreePine, label: "Field Scan", desc: "Analyze field", bg: "bg-amber-50", color: "text-amber-600", id: "quick-scan-field" },
  { href: "/farmer/my-sessions", icon: Calendar, label: "My Sessions", desc: "Manage sessions", bg: "bg-purple-50", color: "text-purple-600", id: "quick-sessions" },
  { href: "/farmer/earnings", icon: DollarSign, label: "Earnings", desc: "View income", bg: "bg-blue-50", color: "text-blue-600", id: "quick-earnings" },
];

export default function FarmerDashboard() {
  const { user } = useAuthStore();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div>
          <p className="text-agri-text-secondary text-sm font-medium mb-0.5">{greeting}!</p>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-agri-text" id="dashboard-title">
            {user?.name?.split(" ")[0] || "Farmer"}&apos;s Dashboard 🌱
          </h1>
          <p className="text-gray-400 text-sm mt-1">Keep your crops safe with AI-powered monitoring.</p>
        </div>
        <Link href="/chat" id="chat-fab">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center shadow-lg shadow-green-200"
          >
            <MessageCircle size={20} className="text-white" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Top row: Health + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Crop Health Score */}
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-agri-text-secondary mb-3">Crop Health Score</h2>
          <div className="flex items-center justify-between">
            <div>
              <ThreatBadge level="medium" />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-600">8 healthy scans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs text-gray-600">3 at risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-600">1 critical</span>
                </div>
              </div>
            </div>
            <HealthRing score={72} />
          </div>
        </motion.div>

        {/* Quick Actions (spans 2 cols on large screens) */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-agri-text-secondary mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={action.href} id={action.id}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="glass-card p-4 flex flex-col items-center gap-2.5 group h-full justify-center text-center"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                      <Icon size={22} className={action.color} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-agri-text">{action.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Middle row: Weather + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weather Advisory */}
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-agri-text mb-4 flex items-center gap-2">
            <CloudRain size={16} className="text-blue-500" />
            Weather Advisory
          </h2>
          <div className="space-y-2.5">
            {weatherTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/80 rounded-xl px-3 py-2.5 border border-agri-border"
              >
                <tip.icon size={16} className={tip.color} />
                <span className="text-xs text-agri-text">{tip.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Farm Stats */}
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h2 className="text-sm font-semibold text-agri-text mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-agri-green" />
            This Month
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Scans", value: "12", delta: "+4 vs last month", positive: true },
              { label: "Diseases Found", value: "4", delta: "-2 vs last month", positive: true },
              { label: "Sessions Hosted", value: "3", delta: "+1 vs last month", positive: true },
              { label: "Earnings", value: "₹1,200", delta: "+₹300", positive: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-agri-bg rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-agri-text">{stat.value}</p>
                <p className={`text-[10px] font-medium mt-0.5 ${stat.positive ? "text-emerald-600" : "text-red-500"}`}>
                  {stat.delta}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div variants={fadeInUp} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-agri-text flex items-center gap-2">
            <TrendingUp size={16} className="text-agri-green" />
            Recent Scans
          </h2>
          <Link href="/history" className="text-xs text-agri-green font-medium flex items-center gap-1 hover:underline">
            See All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentScans.map((scan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <CropHealthCard {...scan} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Scan Button (mobile only) */}
      <Link href="/scan" id="fab-scan">
        <motion.div
          className="fixed bottom-24 right-6 lg:hidden z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <div className="w-14 h-14 rounded-full gradient-green flex items-center justify-center shadow-xl shadow-green-300 pulse-green">
            <ScanLine size={24} className="text-white" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
