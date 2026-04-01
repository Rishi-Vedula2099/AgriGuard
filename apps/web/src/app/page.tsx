"use client";

import { motion } from "framer-motion";
import { ScanLine, MessageCircle, Leaf, TreePine, TrendingUp, Droplets, Sun, CloudRain } from "lucide-react";
import Link from "next/link";
import HealthRing from "@/components/HealthRing";
import ThreatBadge from "@/components/ThreatBadge";
import CropHealthCard from "@/components/CropHealthCard";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
};

// Demo data
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

export default function Dashboard() {
    return (
        <motion.div initial="initial" animate="animate" variants={stagger} className="px-4 pt-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold font-display text-agri-text" id="dashboard-title">
                        🌱 AgriGuard
                    </h1>
                    <p className="text-xs text-agri-text-secondary mt-0.5">
                        Good morning, Farmer! Your crops need attention.
                    </p>
                </div>
                <Link href="/chat" id="chat-fab">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full gradient-green flex items-center justify-center shadow-lg shadow-green-200"
                    >
                        <MessageCircle size={18} className="text-white" />
                    </motion.div>
                </Link>
            </motion.div>

            {/* Health Overview Card */}
            <motion.div variants={fadeInUp} className="glass-card p-5 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-agri-text-secondary mb-1">Crop Health Score</h2>
                        <ThreatBadge level="medium" />
                        <div className="mt-3 space-y-1">
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

            {/* Quick Actions */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 mb-4">
                <Link href="/scan" id="quick-scan-leaf">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="glass-card p-4 flex flex-col items-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <Leaf size={24} className="text-emerald-600" />
                        </div>
                        <span className="text-xs font-semibold text-agri-text">Leaf Scan</span>
                        <span className="text-[10px] text-gray-400">Detect disease</span>
                    </motion.div>
                </Link>
                <Link href="/scan?type=field" id="quick-scan-field">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="glass-card p-4 flex flex-col items-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <TreePine size={24} className="text-amber-600" />
                        </div>
                        <span className="text-xs font-semibold text-agri-text">Field Scan</span>
                        <span className="text-[10px] text-gray-400">Analyze field</span>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Weather Advisory */}
            <motion.div variants={fadeInUp} className="mb-4">
                <h2 className="text-sm font-semibold text-agri-text mb-2 flex items-center gap-1.5">
                    <CloudRain size={16} className="text-blue-500" />
                    Weather Advisory
                </h2>
                <div className="space-y-2">
                    {weatherTips.map((tip, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-center gap-2.5 bg-white/80 rounded-xl px-3 py-2.5 border border-agri-border"
                        >
                            <tip.icon size={16} className={tip.color} />
                            <span className="text-xs text-agri-text">{tip.text}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Scans */}
            <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-agri-text flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-agri-green" />
                        Recent Scans
                    </h2>
                    <Link href="/history" className="text-xs text-agri-green font-medium">
                        See All →
                    </Link>
                </div>
                <div className="space-y-2.5">
                    {recentScans.map((scan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        >
                            <CropHealthCard {...scan} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Floating Scan Button */}
            <Link href="/scan" id="fab-scan">
                <motion.div
                    className="fixed bottom-24 right-4 max-w-[430px] z-40"
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
