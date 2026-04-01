"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, Shield, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate OTP send
    await new Promise(r => setTimeout(r, 1000));
    setStep("otp");
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setError("Enter complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");

    // Demo login — accept any OTP
    await new Promise(r => setTimeout(r, 1000));
    
    login(
      "demo-access-token",
      "demo-refresh-token",
      { id: "demo-user", phone: `+91${phone}`, name: `Farmer-${phone.slice(-4)}`, region: "India" }
    );
    router.push("/");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-5"
        >
          <Leaf size={40} className="text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold font-display text-white mb-2"
        >
          AgriGuard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-white/60 text-center"
        >
          AI-powered crop health platform for Indian farmers
        </motion.p>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="bg-white rounded-t-3xl px-6 pt-8 pb-12"
      >
        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}>
              <h2 className="text-lg font-bold font-display text-agri-text mb-1">Welcome! 🌾</h2>
              <p className="text-xs text-gray-400 mb-6">Enter your phone number to get started</p>

              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="text-sm">🇮🇳</span>
                  <span className="text-sm text-gray-500 font-medium">+91</span>
                  <div className="w-px h-5 bg-gray-200" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                  placeholder="Enter phone number"
                  className="w-full pl-24 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-base text-agri-text placeholder:text-gray-300 focus:outline-none focus:border-agri-green/50 focus:ring-2 focus:ring-agri-green/10"
                  id="phone-input"
                  autoFocus
                />
              </div>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="w-full py-4 rounded-2xl gradient-green text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-200 disabled:opacity-50"
                id="send-otp-btn"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>

              <p className="text-[10px] text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                <Shield size={10} />
                Your data is secure and encrypted
              </p>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-bold font-display text-agri-text mb-1">Verify OTP</h2>
              <p className="text-xs text-gray-400 mb-6">Enter the 6-digit code sent to +91 {phone}</p>

              <div className="flex gap-2 mb-4 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 rounded-xl bg-gray-50 border border-gray-200 text-center text-xl font-bold text-agri-text focus:outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

              <p className="text-xs text-gray-400 text-center mb-4">
                💡 Demo mode: Enter any 6 digits
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleVerifyOTP}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 rounded-2xl gradient-green text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-200 disabled:opacity-50"
                id="verify-otp-btn"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>

              <button
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
                className="w-full text-center text-sm text-agri-green font-medium mt-4"
              >
                ← Change number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
