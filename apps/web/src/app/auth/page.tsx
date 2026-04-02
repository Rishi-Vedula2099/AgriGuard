"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuthStore();

  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.role_selected) {
        router.push("/auth/role-select");
      } else {
        router.push(user.role === "STUDENT" ? "/student" : "/");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (tab === "register") {
        const res = await authApi.register(name, email, password);
        const { access_token, refresh_token, user: userData } = res.data;
        login(access_token, refresh_token, userData);
        router.push("/auth/role-select");
      } else {
        const res = await authApi.loginEmail(email, password);
        const { access_token, refresh_token, user: userData } = res.data;
        login(access_token, refresh_token, userData);
        // If role not selected yet, go to role select; otherwise go to dashboard
        if (!userData.role_selected) {
          router.push("/auth/role-select");
        } else {
          router.push(userData.role === "STUDENT" ? "/student" : "/");
        }
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 welcome-hero flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative z-10">
          <Link href="/welcome" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Leaf size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white">AgriGuard</span>
          </Link>

          <h2 className="text-4xl font-bold font-display text-white leading-tight mb-4">
            {tab === "register"
              ? "Join thousands of farmers protecting their crops"
              : "Welcome back to AgriGuard"}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            AI-powered crop disease detection, smart treatment plans, and a thriving farmer-student community.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { value: "98%", label: "Accuracy" },
            { value: "50+", label: "Crops" },
            { value: "10K+", label: "Farmers" },
            { value: "Free", label: "To Start" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile back */}
          <Link href="/welcome" className="lg:hidden flex items-center gap-2 text-sm text-gray-500 mb-8 hover:text-gray-700">
            <ArrowLeft size={16} />
            Back to home
          </Link>

          {/* Tab Select */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t
                    ? "bg-white text-agri-green shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                id={`auth-tab-${t}`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "register" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold font-display text-gray-900 mb-1">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                {tab === "login"
                  ? "Enter your credentials to access AgriGuard"
                  : "Sign up for free — no credit card required"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name — register only */}
                {tab === "register" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ravi Kumar"
                        required
                        minLength={2}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                        id="auth-name-input"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ravi@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                      id="auth-email-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === "register" ? "Min. 6 characters" : "Your password"}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                      id="auth-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl gradient-green text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  id="auth-submit-btn"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> {tab === "login" ? "Signing in..." : "Creating account..."}</>
                  ) : (
                    tab === "login" ? "Sign In" : "Create Account"
                  )}
                </motion.button>
              </form>

              <p className="text-center text-gray-400 text-xs mt-6">
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  {tab === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthContent />
    </Suspense>
  );
}
