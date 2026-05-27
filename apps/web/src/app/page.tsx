"use client";

import { motion } from "framer-motion";
import { 
  ScanLine, MessageCircle, Leaf, TreePine, TrendingUp, 
  Droplets, Sun, CloudRain, BarChart3, ArrowRight, 
  Map as MapIcon, ShieldCheck, ThermometerSun, Sprout
} from "lucide-react";
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

const insights = [
  { icon: ThermometerSun, text: "Optimal planting window for Maize starts in 3 days.", color: "text-amber-500" },
  { icon: Droplets, text: "Soil moisture at 42% — Irrigation suggested within 12h.", color: "text-blue-500" },
  { icon: ShieldCheck, text: "Zero pest threats detected in your region this week.", color: "text-emerald-500" },
];

const quickActions = [
  { href: "/scan", icon: ScanLine, label: "AI Scan", desc: "Disease detection", bg: "bg-emerald-500/10", color: "text-emerald-500", id: "quick-scan" },
  { href: "/crops", icon: Sprout, label: "Crop Intel", desc: "Recommendations", bg: "bg-lime-500/10", color: "text-lime-500", id: "quick-crops" },
  { href: "/climate", icon: MapIcon, label: "Climate Radar", desc: "Weather insights", bg: "bg-sky-500/10", color: "text-sky-500", id: "quick-climate" },
  { href: "/irrigation", icon: Droplets, label: "Irrigation", desc: "Water analytics", bg: "bg-blue-500/10", color: "text-blue-500", id: "quick-irrigation" },
];

export default function AIDashboard() {
  const { user } = useAuthStore();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <p className="text-emerald-500/80 text-sm font-semibold tracking-wider uppercase mb-1">{greeting}, {user?.name?.split(" ")[0] || "User"}</p>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight" id="dashboard-title">
            Agricultural Intelligence Dashboard 🌱
          </h1>
          <p className="text-gray-400 text-lg mt-2 max-w-2xl">Precision monitoring and AI-driven insights for your farm.</p>
        </div>
        <Link href="/chat" id="chat-fab">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle size={20} />
            AI Assistant
          </motion.div>
        </Link>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Health Radar & Quick Actions */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* AI Farm Health Radar */}
          <motion.div variants={fadeInUp} className="glass-card overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ScanLine size={120} className="text-emerald-500" />
            </div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">AI Farm Health Radar</h2>
                  <p className="text-gray-400 text-sm">Real-time satellite & sensor analysis</p>
                </div>
                <ThreatBadge level="low" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex justify-center md:justify-start">
                  <HealthRing score={92} size={200} strokeWidth={15} />
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Overall Score</p>
                      <p className="text-2xl font-bold text-emerald-500">92%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Risk Level</p>
                      <p className="text-2xl font-bold text-sky-400">Low</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Nitrogen Levels</span>
                      <span className="text-white font-medium">Optimal</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Vegetation Index (NDVI)</span>
                      <span className="text-white font-medium">0.82</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-lime-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">System Operations</h2>
              <span className="text-xs font-bold text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full uppercase tracking-widest">Active</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link href={action.href} key={action.href} id={action.id}>
                    <motion.div
                      whileHover={{ scale: 1.04, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      className="glass-card p-6 flex flex-col items-center gap-4 group h-full justify-center text-center border-emerald-500/0 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={26} className={action.color} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{action.label}</p>
                        <p className="text-[11px] text-gray-500 mt-1 font-medium">{action.desc}</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Climate & Insights */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Climate Insights */}
          <motion.div variants={fadeInUp} className="glass-card p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sun size={20} className="text-amber-500" />
                Climate Radar
              </h2>
              <span className="text-xs text-gray-400">Live</span>
            </div>
            
            <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center">
              <p className="text-5xl font-bold text-white mb-2">28°C</p>
              <p className="text-gray-400 text-sm font-medium">Partly Cloudy • Humidity 65%</p>
            </div>

            <div className="space-y-4">
              {insights.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                >
                  <div className={`mt-1 p-2 rounded-xl bg-white/5 ${tip.color}`}>
                    <tip.icon size={18} />
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed font-medium">{tip.text}</span>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              Full Climate Report
              <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </div>

      {/* Bottom Row: Field Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Stats */}
        <motion.div variants={fadeInUp} className="lg:col-span-1 glass-card p-8">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-500" />
            Performance
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Water Saved", value: "4.2k Liters", delta: "+12% efficiency", positive: true },
              { label: "Yield Prediction", value: "18.5 Tons", delta: "On track for +5% peak", positive: true },
            ].map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className={`text-xs font-bold mt-1 ${stat.positive ? "text-emerald-400" : "text-rose-500"}`}>
                  {stat.delta}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Scans (spans 2) */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Latest Intelligence Scans
            </h2>
            <Link href="/history" className="text-sm text-emerald-500 font-bold flex items-center gap-1 hover:underline">
              Historical Data <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentScans.slice(0, 2).map((scan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="group"
              >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-all">
                  <CropHealthCard {...scan} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Chat Button (Mobile) */}
      <Link href="/chat" id="fab-chat">
        <motion.div
          className="fixed bottom-24 right-6 md:hidden z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <MessageCircle size={28} className="text-white" />
          </div>
        </motion.div>
      </Link>

      <style jsx global>{`
        body {
          background-color: #050a08;
          background-image: 
            radial-gradient(circle at 50% -20%, #064e3b 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, #022c22 0%, transparent 30%);
          background-attachment: fixed;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
        }
      `}</style>
    </motion.div>
  );
}
