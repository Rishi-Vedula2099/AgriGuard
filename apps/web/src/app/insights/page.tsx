"use client";

import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Activity, Leaf, TreePine } from "lucide-react";
import HealthRing from "@/components/HealthRing";

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const diseaseData = [
  { name: "Late Blight", count: 5, color: "bg-red-500" },
  { name: "Brown Spot", count: 3, color: "bg-orange-500" },
  { name: "Healthy", count: 8, color: "bg-emerald-500" },
  { name: "Leaf Rust", count: 2, color: "bg-amber-500" },
  { name: "Bacterial Spot", count: 1, color: "bg-rose-400" },
];

const weeklyData = [
  { day: "Mon", scans: 3, issues: 1 },
  { day: "Tue", scans: 5, issues: 2 },
  { day: "Wed", scans: 2, issues: 0 },
  { day: "Thu", scans: 4, issues: 1 },
  { day: "Fri", scans: 6, issues: 3 },
  { day: "Sat", scans: 3, issues: 1 },
  { day: "Sun", scans: 1, issues: 0 },
];

const maxScans = Math.max(...weeklyData.map(d => d.scans));

export default function InsightsPage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-xl font-bold font-display text-agri-text flex items-center gap-2">
          <BarChart3 size={22} className="text-agri-green" />
          Analytics
        </h1>
        <p className="text-xs text-agri-text-secondary mt-0.5">Your farming insights at a glance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Leaf size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-agri-text">12</p>
            <p className="text-[10px] text-gray-500">Leaf Scans</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <TreePine size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-agri-text">7</p>
            <p className="text-[10px] text-gray-500">Field Scans</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Activity size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-agri-text">84%</p>
            <p className="text-[10px] text-gray-500">Avg Confidence</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-agri-text">+15%</p>
            <p className="text-[10px] text-gray-500">Health Trend</p>
          </div>
        </div>
      </motion.div>

      {/* Health Score */}
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="glass-card p-5 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-agri-text mb-1">Overall Health</h2>
          <p className="text-xs text-gray-500 mb-3">Based on last 30 days</p>
          <div className="flex gap-4">
            <div>
              <p className="text-lg font-bold text-emerald-600">42%</p>
              <p className="text-[10px] text-gray-400">Healthy</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-500">37%</p>
              <p className="text-[10px] text-gray-400">At Risk</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">21%</p>
              <p className="text-[10px] text-gray-400">Infected</p>
            </div>
          </div>
        </div>
        <HealthRing score={72} size={100} strokeWidth={8} />
      </motion.div>

      {/* Weekly Scan Activity */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="glass-card p-4 mb-4">
        <h2 className="text-sm font-semibold text-agri-text mb-3">Weekly Scan Activity</h2>
        <div className="flex items-end justify-between gap-2 h-28">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5 relative" style={{ height: 80 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.scans / maxScans) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                  className="w-full max-w-[20px] rounded-t-md bg-agri-green/20 absolute bottom-0"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.issues / maxScans) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                  className="w-full max-w-[20px] rounded-t-md bg-red-400 absolute bottom-0"
                />
              </div>
              <span className="text-[9px] text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-agri-green/20" />
            <span className="text-[10px] text-gray-500">Total Scans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
            <span className="text-[10px] text-gray-500">Issues Found</span>
          </div>
        </div>
      </motion.div>

      {/* Disease Distribution */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="glass-card p-4 mb-4">
        <h2 className="text-sm font-semibold text-agri-text mb-3 flex items-center gap-1.5">
          <PieChart size={16} className="text-agri-green" />
          Disease Distribution
        </h2>
        <div className="space-y-2.5">
          {diseaseData.map((d, i) => {
            const total = diseaseData.reduce((a, b) => a + b.count, 0);
            const pct = Math.round((d.count / total) * 100);
            return (
              <motion.div key={d.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-agri-text">{d.name}</span>
                  <span className="text-xs text-gray-400">{d.count} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${d.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.08 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
