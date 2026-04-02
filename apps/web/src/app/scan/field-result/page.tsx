"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, AlertCircle, TreePine, TrendingUp, Droplets } from "lucide-react";
import Link from "next/link";
import { useScanStore } from "@/lib/store";

export default function FieldResultPage() {
  const { scanResult, previewUrl } = useScanStore();

  const result = scanResult || {
    disease_name: "Leaf Blight",
    severity: "medium",
    infected_area_pct: 34.5,
    result_data: {
      spread_pattern: "clustered",
      risk_level: "moderate",
      insights: ["34.5% of field infected — action recommended", "Clustered infection pattern — targeted treatment needed", "Moderate risk of further spread"],
    },
    recommendations: {
      organic_solutions: ["Neem oil spray", "Trichoderma bio-fungicide"],
      field_specific: ["Mark infected zones with stakes", "Adjust irrigation in infected areas", "Plan crop rotation for next season"],
      urgency: "⚠️ MEDIUM SEVERITY — Act within 2-3 days",
    },
  };

  const pct = result.infected_area_pct || 34.5;
  const severity = result.severity || "medium";

  const severityConfig = {
    low: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", gradient: "from-emerald-500 to-green-400" },
    medium: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", gradient: "from-orange-500 to-amber-400" },
    high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", gradient: "from-red-500 to-rose-400" },
  };
  const sc = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;

  return (
    <div className="min-h-screen bg-agri-bg">
      {/* Hero with heatmap overlay */}
      <div className="relative h-64">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-green-950" />
        {previewUrl && (
          <img src={previewUrl} alt="Field scan" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        {/* Simulated heatmap overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-agri-bg to-transparent" />

        <div className="relative z-10 px-4 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/scan">
              <motion.div whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft size={18} className="text-white" />
              </motion.div>
            </Link>
            <span className="text-xs text-white/70 font-medium">Field Analysis</span>
            <div className="w-9" />
          </div>
        </div>

        {/* Severity Badge Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${sc.bg} border ${sc.border}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sc.gradient} flex items-center justify-center`}>
              <TreePine size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base font-display text-agri-text">{result.disease_name}</h2>
              <span className={`text-xs font-semibold ${sc.color}`}>{severity.toUpperCase()} SEVERITY</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-4">
        {/* Infection Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-2">
          <div className="glass-card p-3 text-center">
            <p className={`text-2xl font-bold font-display ${sc.color}`}>{pct}%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Infected Area</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-bold font-display text-agri-text capitalize">{result.result_data?.spread_pattern || "—"}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Spread Pattern</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-bold font-display text-agri-text capitalize">{result.result_data?.risk_level || "—"}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Risk Level</p>
          </div>
        </motion.div>

        {/* Infection Area Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-agri-text-secondary">Infection Coverage</span>
            <span className={`text-sm font-bold ${sc.color}`}>{pct}%</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${sc.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
            {/* Severity markers */}
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-300" />
            <div className="absolute top-0 bottom-0 left-[60%] w-px bg-gray-300" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-emerald-500">Low &lt;25%</span>
            <span className="text-[9px] text-orange-500">Medium 25-60%</span>
            <span className="text-[9px] text-red-500">High &gt;60%</span>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-sm font-semibold text-agri-text mb-2 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-agri-green" />
            AI Insights
          </h3>
          <div className="space-y-2">
            {(result.result_data?.insights || []).map((insight: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-agri-border">
                <AlertCircle size={14} className="text-agri-green mt-0.5 shrink-0" />
                <span className="text-xs text-agri-text">{insight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Field-Specific Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="text-sm font-semibold text-agri-text mb-2 flex items-center gap-1.5">
            <MapPin size={16} className="text-orange-500" />
            Field Recommendations
          </h3>
          <div className="space-y-2">
            {(result.recommendations?.field_specific || result.recommendations?.organic_solutions || []).map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-agri-border">
                <Droplets size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="text-xs text-agri-text">{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Urgency */}
        {result.recommendations?.urgency && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
            <p className="text-xs font-semibold text-amber-700">{result.recommendations.urgency}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
