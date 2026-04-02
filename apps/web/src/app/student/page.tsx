"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Calendar, GraduationCap, MessageCircle,
  ArrowRight, Clock, Star, TrendingUp, Users
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { learnApi } from "@/lib/api";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const quickActions = [
  {
    href: "/learn/sessions",
    icon: BookOpen,
    label: "Browse Sessions",
    desc: "Find farmer-led sessions",
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    href: "/learn/bookings",
    icon: Calendar,
    label: "My Bookings",
    desc: "Upcoming & past sessions",
    bg: "bg-purple-50",
    color: "text-purple-600",
  },
  {
    href: "/learn/notes",
    icon: GraduationCap,
    label: "My Notes",
    desc: "Review lesson materials",
    bg: "bg-amber-50",
    color: "text-amber-600",
  },
  {
    href: "/chat",
    icon: MessageCircle,
    label: "AI Advisor",
    desc: "Ask farming questions",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
];

const featuredTopics = [
  { topic: "Organic Farming", sessions: 24, icon: "🌿" },
  { topic: "Pest Management", sessions: 18, icon: "🐛" },
  { topic: "Soil Health", sessions: 31, icon: "🪱" },
  { topic: "Water Management", sessions: 15, icon: "💧" },
  { topic: "Crop Rotation", sessions: 12, icon: "🔄" },
  { topic: "Market Strategies", sessions: 9, icon: "📊" },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, bookRes] = await Promise.allSettled([
          learnApi.getSessions({ limit: 3 }),
          learnApi.getMyBookings(),
        ]);
        if (sessRes.status === "fulfilled") setSessions(sessRes.value.data?.sessions || []);
        if (bookRes.status === "fulfilled") setBookings(bookRes.value.data?.bookings || []);
      } catch (e) {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <p className="text-agri-text-secondary text-sm font-medium mb-1">{greeting}!</p>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-agri-text">
          {user?.name?.split(" ")[0] || "Student"}&apos;s Learning Hub 🎓
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Discover farmer-led sessions and advance your agricultural knowledge.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: "Sessions Available", value: "150+", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Calendar, label: "Your Bookings", value: bookings.length || 0, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Users, label: "Expert Farmers", value: "80+", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Star, label: "Avg. Rating", value: "4.8★", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-agri-text">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h2 className="text-lg font-semibold text-agri-text mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-agri-green" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} id={`student-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card p-5 flex flex-col gap-3 group h-full"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                    <Icon size={22} className={action.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-agri-text">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Browse by Topic + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topics */}
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <h2 className="text-base font-semibold text-agri-text mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-500" /> Browse by Topic
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {featuredTopics.map((t) => (
              <Link key={t.topic} href={`/learn/sessions?topic=${encodeURIComponent(t.topic)}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-50 hover:bg-blue-50 rounded-xl p-3 cursor-pointer transition-colors border border-gray-100 hover:border-blue-200"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1.5">{t.topic}</p>
                  <p className="text-xs text-gray-400">{t.sessions} sessions</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Featured/Recent Sessions */}
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-agri-text flex items-center gap-2">
              <Clock size={16} className="text-purple-500" /> Available Sessions
            </h2>
            <Link href="/learn/sessions" className="text-xs text-agri-green font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session: any) => (
                <Link key={session.id} href={`/learn/sessions/${session.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer border border-transparent hover:border-purple-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={18} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{session.title}</p>
                      <p className="text-xs text-gray-400">{session.farmer_name} · ₹{session.price}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No sessions available yet</p>
              <Link
                href="/learn/sessions"
                className="inline-flex items-center gap-1 text-agri-green text-sm font-medium mt-2 hover:underline"
              >
                Browse all sessions <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Bookings */}
      {bookings.length > 0 && (
        <motion.div variants={fadeInUp} className="glass-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-agri-text flex items-center gap-2">
              <Calendar size={16} className="text-agri-green" /> Your Upcoming Sessions
            </h2>
            <Link href="/learn/bookings" className="text-xs text-agri-green font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {bookings.slice(0, 3).map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{b.session?.title || "Session"}</p>
                  <p className="text-xs text-gray-500">{b.scheduled_at || "Scheduled"}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
