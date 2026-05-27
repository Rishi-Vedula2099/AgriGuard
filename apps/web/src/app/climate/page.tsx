"use client";

import { motion } from "framer-motion";
import { Map as MapIcon, CloudRain, Sun, Wind, ArrowRight } from "lucide-react";

export default function ClimateRadarPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-4">Climate & Temperature Scanner</h1>
        <p className="text-gray-400 text-lg mb-10 max-w-3xl">
          Hyper-local weather intelligence and thermal analysis for precision planting and irrigation timing.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 glass-card p-8 h-[400px] flex items-center justify-center border-emerald-500/20">
            <div className="text-center">
              <MapIcon size={64} className="text-emerald-500/20 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest">Interactive Radar Initializing...</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {[
              { label: "Humidity", value: "65%", icon: CloudRain, color: "text-blue-500" },
              { label: "UV Index", value: "High (8)", icon: Sun, color: "text-amber-500" },
              { label: "Wind Speed", value: "12 km/h", icon: Wind, color: "text-sky-400" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Satellite Intelligence</h2>
          <p className="text-gray-400 mb-8 max-w-2xl leading-relaxed">
            We are integrating SentinelHub APIs to provide real-time thermal overlays and NDVI analysis directly on your farm map.
          </p>
          <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
            View Sample Layers
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
