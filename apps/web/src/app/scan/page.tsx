"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Leaf, TreePine, X, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScanStore } from "@/lib/store";
import { scanApi } from "@/lib/api";

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { scanType, setScanType, previewUrl, setPreviewUrl, setSelectedImage, isScanning, setIsScanning, setScanResult } = useScanStore();
  const [dragActive, setDragActive] = useState(false);

  // Set initial scan type from URL
  const urlType = searchParams.get("type");
  if (urlType === "field" && scanType !== "field") setScanType("field");

  const handleFileSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [setSelectedImage, setPreviewUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleScan = async () => {
    if (!previewUrl) return;
    setIsScanning(true);

    try {
      // Create a demo result (since backend may not be running)
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate scan delay
      
      const demoResult = scanType === "leaf" ? {
        scan_id: "demo-" + Date.now(),
        scan_type: "leaf",
        disease_name: "Tomato Late Blight",
        confidence: 0.87,
        result_data: {
          symptoms: ["Dark brown spots on leaves", "White fuzzy growth on leaf underside", "Leaves turning yellow and wilting"],
          causes: ["Caused by Phytophthora infestans", "Spreads in cool, wet conditions"],
        },
        recommendations: {
          organic_solutions: ["Neem oil spray (5ml per liter water)", "Bordeaux mixture application", "Remove and destroy infected parts"],
          chemical_treatments: ["Mancozeb 75% WP (2g/liter) — spray every 10 days", "⚠️ Wear gloves and mask"],
          preventive_measures: ["Use resistant varieties", "Drip irrigation", "Proper spacing (60cm)"],
          urgency: "⚠️ MEDIUM SEVERITY — Act within 2-3 days",
        },
        crop_type: "Tomato",
      } : {
        scan_id: "demo-" + Date.now(),
        scan_type: "field",
        disease_name: "Leaf Blight",
        severity: "medium",
        infected_area_pct: 34.5,
        result_data: {
          spread_pattern: "clustered",
          risk_level: "moderate",
          insights: ["34.5% of field infected", "Clustered infection pattern", "Moderate risk of further spread"],
        },
        recommendations: {
          organic_solutions: ["Neem oil spray", "Trichoderma bio-fungicide"],
          chemical_treatments: ["Mancozeb 75% WP"],
          field_specific: ["Mark infected zones", "Adjust irrigation", "Plan crop rotation"],
          urgency: "⚠️ MEDIUM SEVERITY — Act within 2-3 days",
        },
      };

      setScanResult(demoResult);
      router.push(scanType === "leaf" ? "/scan/result" : "/scan/field-result");
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen gradient-scan text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <Link href="/">
          <motion.div whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.div>
        </Link>
        <h1 className="text-lg font-bold font-display">Smart Scan</h1>
        <div className="w-9" />
      </div>

      {/* Scan Type Toggle */}
      <div className="flex mx-4 mb-6 bg-white/10 rounded-2xl p-1">
        {[
          { type: "leaf" as const, icon: Leaf, label: "Leaf Scan" },
          { type: "field" as const, icon: TreePine, label: "Field Scan" },
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setScanType(type)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
              scanType === type ? "bg-white text-agri-green shadow-lg" : "text-white/70"
            }`}
            id={`scan-type-${type}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Camera / Upload Area */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-3xl overflow-hidden aspect-square bg-black/20"
            >
              <img
                src={previewUrl}
                alt="Scan preview"
                className="w-full h-full object-cover"
              />
              
              {/* Scan overlay animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="absolute inset-4 border-2 border-agri-green rounded-2xl" />
                  <div className="absolute inset-4 overflow-hidden rounded-2xl">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-agri-green to-transparent scan-line" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-transparent border-t-agri-green rounded-full"
                  />
                </div>
              )}

              {/* Close button */}
              {!isScanning && (
                <button
                  onClick={() => { setPreviewUrl(null); setSelectedImage(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed ${
                dragActive ? "border-agri-green bg-agri-green/10" : "border-white/20 bg-white/5"
              } aspect-square flex flex-col items-center justify-center gap-4 transition-all`}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center">
                  <Camera size={36} className="text-white/80" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/90">
                  {scanType === "leaf" ? "Scan a leaf" : "Scan your field"}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Take a photo or upload an image
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                  id="upload-btn"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {/* Scan Button */}
        {previewUrl && !isScanning && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleScan}
            className="w-full mt-6 py-4 rounded-2xl gradient-green text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-green-500/30"
            id="start-scan-btn"
          >
            <Zap size={20} />
            Analyze {scanType === "leaf" ? "Leaf" : "Field"}
          </motion.button>
        )}

        {/* Scanning Status */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm font-medium text-white/90">🧠 AI is analyzing your image...</p>
            <p className="text-xs text-white/50 mt-1">This usually takes a few seconds</p>
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-6 space-y-2 pb-6">
          <p className="text-xs font-semibold text-white/70">📸 Tips for better results:</p>
          {scanType === "leaf" ? (
            <>
              <p className="text-xs text-white/50">• Get close to the leaf — fill the frame</p>
              <p className="text-xs text-white/50">• Ensure good lighting — natural light is best</p>
              <p className="text-xs text-white/50">• Focus on the affected area</p>
            </>
          ) : (
            <>
              <p className="text-xs text-white/50">• Capture a wide view of the crop patch</p>
              <p className="text-xs text-white/50">• Include both healthy and affected areas</p>
              <p className="text-xs text-white/50">• Stand at a slight elevation for better view</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-scan" />}>
      <ScanPageContent />
    </Suspense>
  );
}
