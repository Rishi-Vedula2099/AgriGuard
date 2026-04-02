"use client";

import { motion } from "framer-motion";

interface HealthRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function HealthRing({ score, size = 120, strokeWidth = 10 }: HealthRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return "#16A34A";
    if (score >= 40) return "#F97316";
    return "#EF4444";
  };

  const getLabel = () => {
    if (score >= 70) return "Healthy";
    if (score >= 40) return "At Risk";
    return "Critical";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2EFD9"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-2xl font-bold font-display"
          style={{ color: getColor() }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-agri-text-secondary font-medium">
          {getLabel()}
        </span>
      </div>
    </div>
  );
}
