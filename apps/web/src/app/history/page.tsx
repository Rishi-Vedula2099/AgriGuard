"use client";

import { motion } from "framer-motion";
import { Clock, Leaf, TreePine, Trash2, Filter, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import CropHealthCard from "@/components/CropHealthCard";
import { historyApi } from "@/lib/api";

export default function HistoryPage() {
  const [filter, setFilter] = useState<"all" | "leaf" | "field">("all");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scan history from backend
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await historyApi.getHistory(1, 100);
      const data = response.data;
      
      // Map API scans into format expected by CropHealthCard
      const mappedScans = (data.scans || []).map((scan: any) => ({
        id: scan.id,
        title: scan.scan_type === "leaf" ? `${scan.crop_type || "Unknown"} Leaf Scan` : `${scan.crop_type || "Unknown"} Field Analysis`,
        disease: scan.disease_name || "Healthy ✅",
        confidence: scan.confidence,
        severity: scan.severity,
        scanType: scan.scan_type,
        date: formatRelativeDate(scan.created_at),
      }));
      setHistory(mappedScans);
    } catch (err: any) {
      console.error("Failed to load scan history:", err);
      setError("Unable to load history. Please ensure you are logged in and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await historyApi.deleteScan(id);
      setHistory(h => h.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete scan:", err);
      alert("Failed to delete scan record. Please try again.");
    }
  };

  // Format timestamp nicely
  const formatRelativeDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const filtered = filter === "all" ? history : history.filter(s => s.scanType === filter);

  return (
    <div className="px-4 pt-6 max-w-5xl mx-auto min-h-screen pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2 tracking-tight">
            <Clock size={24} className="text-emerald-500" />
            Scan Timeline & History
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {isLoading ? "Retrieving health logs..." : `${filtered.length} scan records found`}
          </p>
        </div>
      </motion.div>

      {/* Filter Options */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }} 
        className="flex gap-2.5 mb-6"
      >
        {[
          { key: "all", label: "All Scans", icon: Filter },
          { key: "leaf", label: "Leaf Health", icon: Leaf },
          { key: "field", label: "Field Radar", icon: TreePine },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              filter === key 
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            id={`filter-${key}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* History Items Container */}
      <div className="relative">
        {/* Visual timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

        {/* Loading state skeleton loader */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="relative pl-10 animate-pulse">
                <div className="absolute left-3.5 top-4 w-3.5 h-3.5 rounded-full bg-white/20 border-2 border-white/5" />
                <div className="glass-card p-5 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex gap-3 items-center w-full">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
                    <div className="space-y-2 w-1/2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-12 glass-card p-6 border-red-500/20 bg-red-500/5 max-w-md mx-auto"
          >
            <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
            <p className="text-sm font-semibold text-white">{error}</p>
            <button 
              onClick={fetchHistory}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </motion.div>
        )}

        {/* Data Timeline */}
        {!isLoading && !error && filtered.map((scan, i) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative pl-10 mb-4"
          >
            {/* Timeline dot mapped to severity */}
            <div className={`absolute left-3.5 top-4 w-3.5 h-3.5 rounded-full border-2 border-[#050a08] shadow-sm ${
              scan.severity === "high" 
                ? "bg-red-500" 
                : scan.severity === "medium" 
                ? "bg-orange-500" 
                : "bg-emerald-500"
            }`} />

            <div className="group relative">
              <CropHealthCard {...scan} />
              <button
                onClick={() => handleDelete(scan.id)}
                className="absolute top-4 right-10 md:right-12 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30"
                title="Delete scan from history"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20"
          >
            <Clock size={52} className="mx-auto text-gray-600 mb-4" />
            <p className="text-sm font-semibold text-gray-400">No scan history recorded yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Scans analyzed using backend pipeline automatically display here.
            </p>
          </motion.div>
        )}
      </div>

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
          border-radius: 1.5rem;
        }
      `}</style>
    </div>
  );
}
