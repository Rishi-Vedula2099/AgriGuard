"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Save, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { learnApi } from "@/lib/api";

function NotesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    
    const fetchSessionAndNotes = async () => {
      setLoading(true);
      try {
        const sessionRes = await learnApi.getSession(sessionId);
        setSession(sessionRes.data);
        
        try {
          const notesRes = await learnApi.getNotes(sessionId);
          setContent(notesRes.data.content);
        } catch (noteErr: any) {
          // If 404, it just means no notes exist yet
          if (noteErr.response?.status !== 404) {
             console.error("Failed to load notes", noteErr);
          }
        }
      } catch (err) {
        console.error("Failed to load session details", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionAndNotes();
  }, [sessionId]);

  const handleSaveNotes = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      await learnApi.saveNotes({ session_id: sessionId, content });
      alert("Notes saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Session Selected</h1>
        <Link href="/learn/bookings" className="text-green-500 hover:underline">Return to My Bookings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 mt-16 pb-24 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Link href="/learn/bookings" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back to Bookings
        </Link>
        <button 
          onClick={handleSaveNotes}
          disabled={saving}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Notes"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 border-r border-gray-700 pr-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">My Notes</h2>
            <p className="text-sm text-gray-400">Jot down important techniques and takeaways from the farmer.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Session Context</h4>
            {loading ? (
              <div className="animate-pulse bg-gray-700 h-6 w-3/4 rounded mt-2"></div>
            ) : session ? (
              <>
                <p className="font-bold text-green-400 mb-2">{session.title}</p>
                <div className="text-xs text-gray-400 flex flex-col gap-1">
                  <span>Level: {session.level}</span>
                  <span>Duration: {session.duration}m</span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Session Data Unavailable</p>
            )}
          </div>
        </div>
        
        <div className="md:col-span-3 h-full flex flex-col bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl relative group">
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <textarea
            className="flex-1 w-full bg-transparent border-none outline-none p-6 text-gray-300 resize-none font-mono"
            placeholder={`Start typing your notes here...\n\nExample:\n- Best season for wheat sowing\n- Optimal humidity for seed germination\n- Irrigation techniques`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-6 mt-16 text-center">Loading search params...</div>}>
      <NotesContent />
    </Suspense>
  );
}
