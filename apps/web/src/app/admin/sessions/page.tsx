"use client";

import { useState } from "react";
import { Settings, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminSessionsDashboard() {
  const [platformCommission, setPlatformCommission] = useState(75);
  const [farmerCommission, setFarmerCommission] = useState(25);
  const [saving, setSaving] = useState(false);

  // Example Admin page for controlling the commission splits
  const handleSaveCommission = async () => {
    setSaving(true);
    // Mimic API save config logic
    setTimeout(() => {
       alert("Commission splits updated globally.");
       setSaving(false);
    }, 1000);
  };

  const handleSliderChange = (e: any) => {
     const pValue = parseInt(e.target.value);
     setPlatformCommission(pValue);
     setFarmerCommission(100 - pValue);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-16 pb-24">
       <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
             <Settings className="text-blue-500" /> Platform Administration
          </h1>
          <p className="text-gray-400">Control learning platform commission rates and global settings.</p>
       </div>

       <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl w-full max-w-3xl">
          <h2 className="text-xl font-bold mb-6 font-serif border-b border-gray-700 pb-4">Revenue Model (Dynamic Split)</h2>
          
          <div className="space-y-8">
             <div>
                <div className="flex justify-between items-center mb-2">
                   <p className="font-semibold text-gray-300 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Platform Share</p>
                   <p className="font-bold text-xl">{platformCommission}%</p>
                </div>
                <input 
                   type="range"
                   min="0"
                   max="100"
                   value={platformCommission}
                   onChange={handleSliderChange}
                   className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
             </div>

             <div>
                <div className="flex justify-between items-center mb-2">
                   <p className="font-semibold text-gray-300 flex items-center gap-2"><CheckCircle2 size={16} className="text-yellow-500" /> Farmer Share</p>
                   <p className="font-bold text-xl">{farmerCommission}%</p>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-lg overflow-hidden flex">
                   <div className="bg-yellow-500 h-full" style={{ width: `${farmerCommission}%` }}></div>
                </div>
             </div>

             <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex gap-4">
               <AlertCircle className="text-blue-400 shrink-0 mt-0.5" />
               <p className="text-sm text-blue-200">
                  Changing these values will dynamically affect the payout splits calculation in `/payments/verify` for all future bookings. Existing confirmed payments remain unaffected.
               </p>
             </div>

             <div className="pt-6 text-right">
                <button 
                  onClick={handleSaveCommission}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg text-white font-bold transition disabled:opacity-50"
                >
                   {saving ? "Saving Configuration..." : "Apply Global Config"}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
