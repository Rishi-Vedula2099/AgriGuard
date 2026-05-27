"use client";

import { motion } from "framer-motion";
import { Sprout, TrendingUp, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";

export default function CropIntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-4">AI Crop Recommendation Engine</h1>
        <p className="text-gray-400 text-lg mb-10 max-w-3xl">
          Advanced machine learning models analyzing soil, climate, and historical data to optimize your harvest.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { title: "Optimal Suitability", value: "Tomato", confidence: "95%", icon: Sprout, color: "text-emerald-500" },
            { title: "Market Trend", value: "+12% Value", confidence: "Rising", icon: TrendingUp, color: "text-sky-500" },
            { title: "Risk Level", value: "Minimal", confidence: "No Pests", icon: ShieldCheck, color: "text-lime-500" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-8">
              <stat.icon size={32} className={`${stat.color} mb-4`} />
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-emerald-500 font-medium mt-1">{stat.confidence}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-10 text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Detailed Analysis Coming Soon</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            We are indexing regional soil data and historical yield records to provide precision recommendations.
          </p>
          <button className="px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 mx-auto">
            Enable Beta Access
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>

      <style jsx global>{`
        body { background-color: #050a08; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
        }
      `}</style>
    </div>
  );
}
