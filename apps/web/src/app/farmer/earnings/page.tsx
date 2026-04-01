"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Activity, Users, FileText } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";

const data = [
  { name: 'Jan', earnings: 4000 },
  { name: 'Feb', earnings: 3000 },
  { name: 'Mar', earnings: 5000 },
  { name: 'Apr', earnings: 8000 },
  { name: 'May', earnings: 9000 },
  { name: 'Jun', earnings: 14000 },
  { name: 'Jul', earnings: 13000 },
];

export default function EarningsDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In MVP this is mostly static frontend representation.
    // Replace with realistic analytics endpoint
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16 pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 font-serif text-green-400 drop-shadow-sm">Earnings Overview</h1>
        <p className="text-gray-400">Track your generated platform revenue over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex items-center justify-between hover:border-green-500/30 transition">
           <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Earned (All Time)</p>
              <h3 className="text-3xl font-bold flex items-center text-white"><DollarSign className="text-green-500" /> 56,000</h3>
           </div>
           <div className="h-14 w-14 bg-green-500/10 rounded-full flex justify-center items-center text-green-500">
              <TrendingUp size={28} />
           </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Sessions Taught</p>
              <h3 className="text-3xl font-bold flex items-center text-white">42</h3>
           </div>
           <div className="h-14 w-14 bg-blue-500/10 rounded-full flex justify-center items-center text-blue-500">
              <Activity size={28} />
           </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Students Enrolled</p>
              <h3 className="text-3xl font-bold flex items-center text-white">105</h3>
           </div>
           <div className="h-14 w-14 bg-purple-500/10 rounded-full flex justify-center items-center text-purple-500">
              <Users size={28} />
           </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6 font-serif">Revenue Growth</h3>
        <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                 itemStyle={{ color: '#22c55e' }}
              />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#22c55e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEarnings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
