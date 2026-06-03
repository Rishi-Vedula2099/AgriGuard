"use client";

import { motion } from "framer-motion";
import { Droplets, Activity, PieChart, AlertCircle, ArrowRight } from "lucide-react";

export default function IrrigationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-4">Irrigation Intelligence</h1>
        <p className="text-gray-400 text-lg mb-10 max-w-3xl">
          AI-powered water requirement prediction and efficiency analytics to prevent wastage and ensure crop health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Soil Moisture Index
            </h2>
            <div className="h-48 flex items-end gap-2 px-4 mb-6">
              {[40, 55, 42, 60, 48, 52, 45].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg opacity-60 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="glass-card p-8 flex flex-col justify-center">
            <div className="mb-8">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Predicted Water Need</p>
              <p className="text-4xl font-bold text-white">2.5L <span className="text-lg text-blue-400">/ sqm</span></p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-4">
                <AlertCircle size={20} className="text-blue-500" />
                <p className="text-sm text-gray-300 font-medium">Optimal watering window: **05:00 AM - 07:00 AM**</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                <PieChart size={20} className="text-emerald-500" />
                <p className="text-sm text-gray-300 font-medium">Potential water savings: **15%** vs last cycle.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-10 border-blue-500/20 text-center">
          <Droplets size={48} className="text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Automation Hub Integration</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            We are building direct integrations for smart drip irrigation systems to automate scheduling based on AI predictions.
          </p>
          <button className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-500/20">
            Learn About IoT Sync
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
