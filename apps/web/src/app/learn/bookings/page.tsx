"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, DollarSign, CheckCircle, Search, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { learnApi } from "@/lib/api";

type Booking = {
  id: string;
  student_id: string;
  session_id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  session?: {
    id: string;
    title: string;
    duration: number;
    price: number;
    level: string;
  }
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await learnApi.getMyBookings();
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 mt-16 pb-24">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Learning Journey</h1>
          <p className="text-gray-400">Manage your past and upcoming sessions with expert farmers.</p>
        </div>
        <Link href="/learn/sessions" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 border border-gray-700 rounded-lg transition hidden md:block">
          Explore New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
          <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No active bookings</h3>
          <p className="text-gray-400 mb-6">Invest in your knowledge and connect with farming experts today.</p>
          <Link href="/learn/sessions" className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold text-white transition inline-block">
            Browse Sessions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking, index) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden relative"
            >
               {booking.status === 'CONFIRMED' && (
                 <div className="absolute top-0 right-0 p-4">
                   <CheckCircle size={24} className="text-green-500 drop-shadow-md" />
                 </div>
               )}
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xl font-bold flex-1 pr-6">{booking.session?.title || "Session Details Pending..."}</h3>
                 </div>
                 
                 <div className="space-y-3 text-sm text-gray-300">
                   <div className="flex items-center gap-3">
                     <Clock size={16} className="text-green-500" />
                     <span>{booking.session?.duration || 60} mins duration</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <DollarSign size={16} className="text-green-500" />
                     <span>₹{booking.session?.price || "N/A"} Paid</span>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gray-900 border-t border-gray-700 p-4 flex justify-between items-center gap-4">
                 <div className="flex gap-2 font-medium text-xs sm:text-sm">
                   <span className={`px-2 py-1 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                     {booking.status}
                   </span>
                 </div>
                 
                 {booking.status === 'CONFIRMED' && (
                   <Link 
                     href={`/learn/notes?session=${booking.session_id}`}
                     className="flex items-center gap-2 text-green-500 hover:text-green-400 font-medium transition"
                   >
                     <Edit3 size={16} /> Take Notes
                   </Link>
                 )}
                 {booking.status === 'PENDING' && (
                   <Link 
                    href={`/learn/sessions/${booking.session_id}`}
                    className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-medium transition"
                  >
                    Complete Payment Pay
                  </Link>
                 )}
               </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
