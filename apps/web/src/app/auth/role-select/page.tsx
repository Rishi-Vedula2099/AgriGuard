"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Leaf, GraduationCap, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";

const roles = [
  {
    id: "FARMER",
    icon: Leaf,
    label: "I'm a Farmer",
    tagline: "Protect & grow my crops",
    description: "Scan leaves and fields for diseases, get treatment plans, track crop health, manage earnings from student sessions, and access weather advisories.",
    features: [
      "AI-powered crop disease detection",
      "Smart treatment recommendations",
      "Field health analytics & history",
      "Earn by hosting student sessions",
      "Weather-aware farming advisories",
    ],
    gradient: "from-emerald-500 to-green-600",
    lightBg: "bg-emerald-50",
    border: "border-emerald-400",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-100",
  },
  {
    id: "STUDENT",
    icon: GraduationCap,
    label: "I'm a Student",
    tagline: "Learn from real farmers",
    description: "Browse and book live learning sessions with experienced farmers, take notes, get hands-on agricultural education, and build your farming knowledge.",
    features: [
      "Book sessions with expert farmers",
      "Real-time Q&A and interaction",
      "Take and access session notes",
      "Track your learning journey",
      "Discover agriculture best practices",
    ],
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50",
    border: "border-blue-400",
    textColor: "text-blue-700",
    iconBg: "bg-blue-100",
  },
];

export default function RoleSelectPage() {
  const router = useRouter();
  const { user, updateUser, token } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await authApi.setRole(selectedRole);
      const updatedUser = res.data.user;
      updateUser(updatedUser);
      router.push(selectedRole === "STUDENT" ? "/student" : "/");
    } catch (err: any) {
      setError("Failed to set role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl gradient-green flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
          <Leaf size={28} className="text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-2">
          Welcome to AgriGuard{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 🌱
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Tell us who you are so we can personalize your experience. You can always change this later in settings.
        </p>
      </motion.div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-10">
        {roles.map((role, i) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedRole(role.id)}
              className={`role-card cursor-pointer relative ${isSelected ? "selected" : ""}`}
              style={{
                borderColor: isSelected ? (role.id === "FARMER" ? "#16A34A" : "#3B82F6") : "transparent",
              }}
              id={`role-card-${role.id.toLowerCase()}`}
            >
              {/* Selected badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <CheckCircle size={24} className={role.textColor} />
                </motion.div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${role.iconBg} flex items-center justify-center mb-5`}>
                <Icon size={28} className={role.textColor} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">{role.label}</h2>
              <p className={`text-sm font-semibold ${role.textColor} mb-3`}>{role.tagline}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{role.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {role.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className={`${role.textColor} mt-0.5 flex-shrink-0`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-6 py-2.5 rounded-xl text-center text-sm font-semibold ${role.lightBg} ${role.textColor}`}
                >
                  ✓ Selected
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedRole ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={handleConfirm}
          disabled={!selectedRole || isLoading}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 gradient-green text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-shadow"
          id="role-confirm-btn"
        >
          {isLoading ? (
            <><Loader2 size={20} className="animate-spin" /> Setting up your account...</>
          ) : (
            <>{selectedRole ? `Continue as ${selectedRole === "FARMER" ? "Farmer" : "Student"}` : "Select a role to continue"} <ArrowRight size={20} /></>
          )}
        </motion.button>
      </motion.div>

      <p className="text-gray-400 text-xs mt-4 text-center">
        You can switch roles or update your profile anytime from settings.
      </p>
    </div>
  );
}
