"use client";

import { motion } from "framer-motion";
import { Leaf, TreePine, ArrowRight } from "lucide-react";

interface CropHealthCardProps {
  title: string;
  disease?: string;
  confidence?: number;
  severity?: string;
  scanType: "leaf" | "field";
  date?: string;
  onClick?: () => void;
}

export default function CropHealthCard({
  title,
  disease,
  confidence,
  severity,
  scanType,
  date,
  onClick,
}: CropHealthCardProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case "low": return "text-emerald-600 bg-emerald-50";
      case "medium": return "text-orange-600 bg-orange-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2.5 rounded-xl ${scanType === "leaf" ? "bg-emerald-50" : "bg-amber-50"}`}>
          {scanType === "leaf" ? (
            <Leaf size={22} className="text-emerald-600" />
          ) : (
            <TreePine size={22} className="text-amber-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-agri-text truncate">{title}</h3>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-agri-green transition-colors" />
          </div>

          {disease && (
            <p className="text-xs text-agri-text-secondary mt-0.5">{disease}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {confidence !== undefined && (
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <span className="text-[10px] text-agri-text-secondary font-medium">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
            {severity && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getSeverityColor()}`}>
                {severity.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {date && (
        <p className="text-[10px] text-gray-400 mt-2 text-right">{date}</p>
      )}
    </motion.div>
  );
}
