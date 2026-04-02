"use client";

import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Leaf, Shield, Bug, Pill, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useScanStore } from "@/lib/store";

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function LeafResultPage() {
  const { scanResult, previewUrl } = useScanStore();
  const [activeTab, setActiveTab] = useState<"symptoms" | "treatment" | "prevention">("symptoms");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const result = scanResult || {
    disease_name: "Tomato Late Blight",
    confidence: 0.87,
    crop_type: "Tomato",
    result_data: {
      symptoms: ["Dark brown spots on leaves", "White fuzzy growth on leaf underside", "Leaves turning yellow and wilting"],
      causes: ["Caused by Phytophthora infestans", "Spreads in cool, wet conditions"],
    },
    recommendations: {
      organic_solutions: ["Neem oil spray (5ml per liter water)", "Bordeaux mixture", "Remove infected parts"],
      chemical_treatments: ["Mancozeb 75% WP (2g/liter)", "⚠️ Wear protective gear"],
      preventive_measures: ["Use resistant varieties", "Drip irrigation", "Proper spacing"],
      urgency: "⚠️ MEDIUM SEVERITY — Act within 2-3 days",
    },
  };

  const confidence = result.confidence || 0.87;
  const isHealthy = result.disease_name === "Healthy";

  const tabs = [
    { key: "symptoms", label: "Symptoms", icon: Bug },
    { key: "treatment", label: "Treatment", icon: Pill },
    { key: "prevention", label: "Prevention", icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen bg-agri-bg">
      {/* Hero Image Section */}
      <div className="relative h-56">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        {previewUrl && (
          <img src={previewUrl} alt="Scanned leaf" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
        )}
        <div className="relative z-10 px-4 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/scan">
              <motion.div whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft size={18} className="text-white" />
              </motion.div>
            </Link>
            <span className="text-xs text-white/70 font-medium">Leaf Analysis</span>
            <div className="w-9" />
          </div>
        </div>
        {/* Disease name card overlapping */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-4 right-4 glass-card p-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isHealthy ? "bg-emerald-50" : "bg-red-50"}`}>
              {isHealthy ? <Leaf size={24} className="text-emerald-600" /> : <AlertTriangle size={24} className="text-red-500" />}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg font-display text-agri-text">{result.disease_name}</h2>
              <p className="text-xs text-agri-text-secondary">{result.crop_type || "Unknown Crop"}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 pt-14 space-y-4">
        {/* Confidence Meter */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-agri-text-secondary">AI Confidence</span>
            <span className={`text-sm font-bold ${confidence > 0.8 ? "text-emerald-600" : confidence > 0.5 ? "text-orange-500" : "text-red-500"}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${confidence > 0.8 ? "bg-emerald-500" : confidence > 0.5 ? "bg-orange-500" : "bg-red-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
          {confidence < 0.6 && (
            <p className="text-[10px] text-orange-500 mt-2">⚠️ Low confidence — consider uploading a clearer image</p>
          )}
        </motion.div>

        {/* Urgency Alert */}
        {result.recommendations?.urgency && (
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <p className="text-xs font-semibold text-amber-700">{result.recommendations.urgency}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-3">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === key ? "bg-white text-agri-green shadow-sm" : "text-gray-500"
                }`}
                id={`tab-${key}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-2">
            {activeTab === "symptoms" && (
              <>
                <div className="space-y-1.5">
                  {(result.result_data?.symptoms || []).map((s: string, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-agri-border">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span className="text-xs text-agri-text">{s}</span>
                    </motion.div>
                  ))}
                </div>
                {result.result_data?.causes && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-agri-text-secondary mb-1.5">Causes:</p>
                    {result.result_data.causes.map((c: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 py-1">
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "treatment" && (
              <>
                {/* Organic */}
                <CollapsibleSection title="🌿 Organic Solutions (Recommended)" items={result.recommendations?.organic_solutions} defaultOpen expanded={expandedSection} setExpanded={setExpandedSection} id="organic" />
                {/* Chemical */}
                <CollapsibleSection title="🧪 Chemical Treatments" items={result.recommendations?.chemical_treatments} expanded={expandedSection} setExpanded={setExpandedSection} id="chemical" />
              </>
            )}

            {activeTab === "prevention" && (
              <div className="space-y-1.5">
                {(result.recommendations?.preventive_measures || []).map((p: string, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-agri-border">
                    <Shield size={14} className="text-agri-green mt-0.5 shrink-0" />
                    <span className="text-xs text-agri-text">{p}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, items, defaultOpen, expanded, setExpanded, id }: any) {
  const isOpen = defaultOpen || expanded === id;
  return (
    <div className="bg-white rounded-xl border border-agri-border overflow-hidden">
      <button onClick={() => setExpanded(isOpen ? null : id)} className="w-full flex items-center justify-between p-3">
        <span className="text-xs font-semibold text-agri-text">{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isOpen && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-3 pb-3 space-y-1.5">
          {(items || []).map((item: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-agri-green mt-1.5 shrink-0" />
              <span className="text-xs text-gray-600">{item}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
