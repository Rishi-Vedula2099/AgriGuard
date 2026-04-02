"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen, Star, Calendar, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

type Session = {
  id: string;
  farmer_id: string;
  crop_id: string;
  title: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price: number;
  duration: number;
  meeting_link?: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sessions
    const fetchSessions = async () => {
      try {
        const response = await api.get("/sessions");
        setSessions(response.data);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learn & Connect</h1>
          <p className="text-gray-400">Book live interactive sessions with expert farmers to master crops.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-gray-800 rounded-lg p-2 flex items-center gap-2 border border-gray-700">
            <Search size={20} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search by crop, topic..." 
              className="bg-transparent border-none outline-none text-sm w-48 text-white"
            />
          </div>
          <button className="bg-gray-800 p-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition">
            <Filter size={20} className="text-gray-300" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
          <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No sessions available</h3>
          <p className="text-gray-400">Check back later for new live sessions from our expert farmers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, index) => (
            <motion.div 
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-green-500/50 transition-colors group"
            >
              <div className="h-40 bg-gray-700 relative overflow-hidden">
                {/* Placeholder cover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-green-900/40 to-emerald-800/20 mix-blend-overlay"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    session.level === 'BEGINNER' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    session.level === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {session.level}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">{session.title}</h3>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {session.duration} mins</span>
                  <span className="flex items-center gap-1"><DollarSign size={14} /> ₹{session.price}</span>
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2 mb-6">
                  {session.description}
                </p>
                
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
                      F
                    </div>
                    <span className="text-sm text-gray-400">Farmer Info</span>
                  </div>
                  <Link href={`/learn/sessions/${session.id}`} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
