"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Leaf, Shield, Zap, Users, TrendingUp, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "AI Crop Disease Detection",
    desc: "Upload a photo of any leaf or field — our AI identifies diseases within seconds with expert-level accuracy.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Smart Treatment Plans",
    desc: "Get personalized organic and chemical treatment recommendations tailored to your crop and local conditions.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Users,
    title: "Farmer–Student Network",
    desc: "Students book live learning sessions with experienced farmers. Farmers earn by sharing their expertise.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: MessageCircle,
    title: "24/7 AI Farm Assistant",
    desc: "Chat with our AI assistant trained on agricultural data — ask anything about crops, pests, or soil.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: TrendingUp,
    title: "Field Analytics & Insights",
    desc: "Track your crop health over time, view scan history, and get trend reports for your entire farm.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Zap,
    title: "Weather-Aware Advisories",
    desc: "Get real-time weather alerts and farming advisories so you always act at the right time.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
];

const stats = [
  { value: "98%", label: "Disease Detection Accuracy" },
  { value: "50+", label: "Crop Types Supported" },
  { value: "10K+", label: "Farmers Using AgriGuard" },
  { value: "24/7", label: "AI Assistant Available" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── Hero Section ── */}
      <section className="welcome-hero min-h-screen flex flex-col relative overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold font-display text-white">AgriGuard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-white/80 text-sm font-medium hover:text-white transition-colors px-4 py-2"
              id="welcome-signin-link"
            >
              Sign In
            </Link>
            <Link
              href="/auth?tab=register"
              className="bg-white text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors"
              id="welcome-getstarted-btn"
            >
              Get Started Free
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Powered by Google Gemini AI</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold font-display text-white leading-tight mb-6"
            >
              Protect Your<br />
              <span className="text-emerald-300">Crops With AI</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              AgriGuard uses real-time AI to detect crop diseases from photos, generate treatment plans,
              and connect farmers with agriculture students — all in one platform.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/auth?tab=register"
                id="hero-register-btn"
                className="group flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-emerald-50 transition-all shadow-2xl shadow-black/20"
              >
                Start Free — It&apos;s Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth"
                id="hero-signin-btn"
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/60 text-sm"
            >
              {["No credit card required", "Free disease scans", "Works offline"].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-emerald-700 py-16 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-4xl font-bold font-display text-white">{stat.value}</p>
              <p className="text-emerald-200 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Everything You Need</span>
            <h2 className="text-4xl font-bold font-display text-gray-900 mt-2">
              Smart Farming, Simplified
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              From AI disease detection to farmer-student networking — AgriGuard covers the full agricultural lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <Icon size={24} className={feature.color} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="welcome-hero rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold font-display mb-4">Ready to protect your crops?</h2>
            <p className="text-white/75 mb-8 text-lg">
              Join thousands of farmers using AI to detect diseases earlier and save their harvests.
            </p>
            <Link
              href="/auth?tab=register"
              id="cta-register-btn"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-emerald-50 transition-all shadow-xl"
            >
              Create Free Account
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-8 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={16} className="text-emerald-600" />
          <span className="font-semibold text-gray-700">AgriGuard</span>
        </div>
        <p>AI-powered crop health platform built for Indian farmers. © 2026 AgriGuard.</p>
      </footer>
    </div>
  );
}
