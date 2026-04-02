"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface ThreatBadgeProps {
  level: "low" | "medium" | "high";
  compact?: boolean;
}

export default function ThreatBadge({ level, compact = false }: ThreatBadgeProps) {
  const config = {
    low: {
      icon: ShieldCheck,
      label: "Low Threat",
      shortLabel: "Low",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    medium: {
      icon: AlertTriangle,
      label: "Medium Threat",
      shortLabel: "Medium",
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      dot: "bg-orange-500",
    },
    high: {
      icon: ShieldAlert,
      label: "High Threat",
      shortLabel: "High",
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      dot: "bg-red-500",
    },
  };

  const c = config[level];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${c.bg} ${c.border}`}
    >
      <motion.div
        className={`w-2 h-2 rounded-full ${c.dot}`}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <Icon size={compact ? 14 : 16} className={c.text} />
      <span className={`text-xs font-semibold ${c.text}`}>
        {compact ? c.shortLabel : c.label}
      </span>
    </motion.div>
  );
}
