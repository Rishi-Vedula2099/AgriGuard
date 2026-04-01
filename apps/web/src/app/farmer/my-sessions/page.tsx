"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Video, Users } from "lucide-react";
import api from "@/lib/api";

export default function FarmerSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ideally this endpoint would filter to the logged-in farmer's sessions
    // For MVP, we query all or you would have a specific /api/v1/sessions/me endpoint
    const fetchMySessions = async () => {
      try {
        const response = await api.get("/api/v1/sessions");
        // Pseudo-filtering to mimic 'my sessions' for now if no auth context filter exists
        setSessions(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMySessions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16 pb-24">
      <div className="flex justify-between items-center border-b border-gray-700 pb-6 mb-8 mt-4">
         <div>
            <h1 className="text-3xl font-bold font-serif mb-2">My Teaching Hub</h1>
            <p className="text-gray-400">Manage your created sessions and track student enrollments.</p>
         </div>
         <Link href="/farmer/create-session" className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-green-900/20">
            <PlusCircle size={20} /> Host Session
         </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center bg-gray-900 border border-gray-700 rounded-2xl p-16">
          <Video size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">No Active Sessions</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-6">You haven't published any learning sessions yet. Start sharing your knowledge with eager students.</p>
          <Link href="/farmer/create-session" className="text-green-500 hover:text-green-400 border border-green-500 hover:border-green-400 px-6 py-2 rounded-full transition inline-block">
             Publish First Session
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-400">
                <th className="p-4 font-semibold text-sm">Session Title</th>
                <th className="p-4 font-semibold text-sm">Level</th>
                <th className="p-4 font-semibold text-sm">Price</th>
                <th className="p-4 font-semibold text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session: any) => (
                <tr key={session.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                  <td className="p-4">
                     <p className="font-medium text-white line-clamp-1">{session.title}</p>
                     <p className="text-sm text-gray-400">{session.duration} mins • ID: {session.id.substring(0,8)}</p>
                  </td>
                  <td className="p-4">
                     <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{session.level}</span>
                  </td>
                  <td className="p-4 font-medium">₹{session.price}</td>
                  <td className="p-4 text-center">
                     <div className="flex items-center justify-center gap-3">
                        <button className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition" title="Edit Session">
                           <Edit size={18} />
                        </button>
                        <button className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition" title="Delete Session">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
