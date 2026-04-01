"use client";

import { motion } from "framer-motion";
import { Clock, Leaf, TreePine, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import CropHealthCard from "@/components/CropHealthCard";

const demoHistory = [
  { id: "1", title: "Tomato Leaf Scan", disease: "Late Blight", confidence: 0.87, severity: "medium" as const, scanType: "leaf" as const, date: "Today, 10:30 AM" },
  { id: "2", title: "Rice Field Analysis", disease: "Brown Spot", confidence: 0.72, severity: "low" as const, scanType: "field" as const, date: "Yesterday, 4:15 PM" },
  { id: "3", title: "Wheat Leaf Check", disease: "Healthy ✅", confidence: 0.95, scanType: "leaf" as const, date: "Mar 25, 9:00 AM" },
  { id: "4", title: "Potato Field Scan", disease: "Early Blight", confidence: 0.81, severity: "high" as const, scanType: "field" as const, date: "Mar 24, 2:30 PM" },
  { id: "5", title: "Cotton Leaf Scan", disease: "Bacterial Spot", confidence: 0.68, severity: "medium" as const, scanType: "leaf" as const, date: "Mar 23, 11:20 AM" },
  { id: "6", title: "Corn Field Analysis", disease: "Gray Leaf Spot", confidence: 0.79, severity: "low" as const, scanType: "field" as const, date: "Mar 22, 8:45 AM" },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<"all" | "leaf" | "field">("all");
  const [history, setHistory] = useState(demoHistory);

  const filtered = filter === "all" ? history : history.filter(s => s.scanType === filter);

  const handleDelete = (id: string) => {
    setHistory(h => h.filter(s => s.id !== id));
  };

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold font-display text-agri-text flex items-center gap-2">
            <Clock size={22} className="text-agri-green" />
            Scan History
          </h1>
          <p className="text-xs text-agri-text-secondary mt-0.5">{history.length} scans recorded</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-4">
        {[
          { key: "all", label: "All Scans", icon: Filter },
          { key: "leaf", label: "Leaf", icon: Leaf },
          { key: "field", label: "Field", icon: TreePine },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === key ? "bg-agri-green text-white shadow-md" : "bg-white border border-agri-border text-gray-500"
            }`}
            id={`filter-${key}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <div className="space-y-3 relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-agri-border" />

        {filtered.map((scan, i) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative pl-10"
          >
            {/* Timeline dot */}
            <div className={`absolute left-3.5 top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
              scan.severity === "high" ? "bg-red-500" : scan.severity === "medium" ? "bg-orange-500" : "bg-emerald-500"
            }`} />

            <div className="group relative">
              <CropHealthCard {...scan} />
              <button
                onClick={() => handleDelete(scan.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-50"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Clock size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No scans found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
