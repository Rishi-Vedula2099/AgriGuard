"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Leaf, TreePine, X, Zap, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useScanStore } from "@/lib/store";
import { scanApi } from "@/lib/api";

function ScanPageContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    scanType, setScanType,
    previewUrl, setPreviewUrl,
    selectedImage, setSelectedImage,
    isScanning, setIsScanning,
    setScanResult,
  } = useScanStore();

  const [dragActive, setDragActive] = useState(false);
  const [scanResult, setLocalResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Set initial scan type from URL
  const urlType = searchParams.get("type");
  if (urlType === "field" && scanType !== "field") setScanType("field");

  const handleFileSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setLocalResult(null);
    setError(null);
  }, [setSelectedImage, setPreviewUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleScan = async () => {
    if (!selectedImage) return;
    setIsScanning(true);
    setError(null);
    setLocalResult(null);

    try {
      let result: any;

      if (scanType === "leaf") {
        // Call secure backend proxying leaf scan
        const response = await scanApi.scanLeaf(selectedImage);
        const data = response.data;
        // Map backend scan response to the keys expected by frontend UI
        result = {
          scan_id: data.scan_id,
          scan_type: data.scan_type,
          disease_name: data.disease_name || "Healthy ✅",
          crop: data.crop_type || data.result_data?.crop || "Unknown",
          confidence: data.confidence !== null ? data.confidence : (data.result_data?.confidence || 0.95),
          is_healthy: data.result_data?.is_healthy ?? (data.disease_name === "Healthy" || !data.disease_name),
          severity: data.severity || data.result_data?.severity || "medium",
          symptoms: data.result_data?.symptoms || [],
          causes: data.result_data?.causes || [],
          treatment: data.recommendations?.organic_solutions || data.result_data?.treatment || [],
          analysis_mode: data.result_data?.analysis_mode || "database",
          model_version: data.result_data?.model_version || "v1.0.0",
        };
      } else {
        // Call secure backend proxying field scan
        const response = await scanApi.scanField(selectedImage);
        const data = response.data;
        result = {
          scan_id: data.scan_id,
          scan_type: data.scan_type,
          disease_name: data.disease_name || "Leaf Blight",
          crop: data.crop_type || data.result_data?.crop || "Unknown",
          confidence: data.confidence || 0.85,
          is_healthy: data.disease_name === "Healthy",
          severity: data.severity || "medium",
          infected_area_pct: data.infected_area_pct !== null ? data.infected_area_pct : (data.result_data?.infected_area_pct || 0.0),
          symptoms: data.result_data?.insights || [],
          causes: data.result_data?.insights ? ["Potential disease spread pattern: " + (data.result_data.spread_pattern || "unknown")] : [],
          treatment: data.recommendations?.organic_solutions || [],
          analysis_mode: data.result_data?.analysis_mode || "database",
          model_version: data.result_data?.model_version || "v1.0.0",
        };
      }

      await setScanResult(result);
      setLocalResult(result);
    } catch (err: any) {
      console.error("Scan error:", err);
      // Fallback: still show a proper error message instead of fake data
      setError(
        err?.response?.data?.detail ||
        "Failed to analyze image. Please check your connection and try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setSelectedImage(null);
    setLocalResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "text-red-600 bg-red-50 border-red-200";
    if (severity === "medium") return "text-orange-600 bg-orange-50 border-orange-200";
    if (severity === "low" || severity === "none") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </motion.div>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-agri-text">AI Crop Scanner</h1>
          <p className="text-xs text-gray-400">Powered by Gemini Vision AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload + Controls */}
        <div>
          {/* Scan Type Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-2xl p-1">
            {[
              { type: "leaf" as const, icon: Leaf, label: "Leaf Scan" },
              { type: "field" as const, icon: TreePine, label: "Field Scan" },
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => { setScanType(type); handleReset(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  scanType === type
                    ? "bg-white text-agri-green shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                id={`scan-type-${type}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-3xl overflow-hidden bg-black/5 border border-agri-border"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={previewUrl}
                  alt="Scan preview"
                  className="w-full h-full object-contain"
                />

                {/* Scanning overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4">
                    <div className="absolute inset-6 border-2 border-agri-green rounded-2xl" />
                    <div className="absolute inset-6 overflow-hidden rounded-2xl">
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-agri-green to-transparent scan-line" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-14 h-14 border-4 border-transparent border-t-agri-green rounded-full"
                    />
                    <div className="text-center text-white">
                      <p className="text-sm font-semibold">🧠 Gemini AI Analyzing...</p>
                      <p className="text-xs text-white/60 mt-1">Identifying crop & disease in real-time</p>
                    </div>
                  </div>
                )}

                {/* Close */}
                {!isScanning && (
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X size={16} className="text-white" />
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
                className={`rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                  dragActive
                    ? "border-agri-green bg-emerald-50"
                    : "border-gray-200 bg-gray-50 hover:border-agri-green hover:bg-emerald-50/30"
                }`}
                style={{ aspectRatio: "4/3" }}
                onClick={handleUploadClick}
              >
                <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="w-20 h-20 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center"
                  >
                    <Camera size={36} className="text-agri-green" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-agri-text">
                      {scanType === "leaf" ? "Upload a leaf photo" : "Upload a field photo"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Drop image here or click to browse
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-agri-green hover:text-agri-green transition-colors shadow-sm"
                      id="upload-btn"
                    >
                      <Upload size={16} />
                      Upload Photo
                    </button>
                  </div>
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
          {previewUrl && !isScanning && !scanResult && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleScan}
              className="w-full mt-4 py-4 rounded-2xl gradient-green text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/35 transition-shadow"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              id="start-scan-btn"
            >
              <Zap size={20} />
              Analyze with Gemini AI
            </motion.button>
          )}

          {/* Try Again button */}
          {(error || scanResult) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleReset}
              className="w-full mt-3 py-3 rounded-2xl bg-gray-100 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} />
              Scan Another Image
            </motion.button>
          )}

          {/* Tips */}
          <div className="mt-6 glass-card p-4">
            <p className="text-xs font-semibold text-agri-text mb-2.5">📸 Tips for better accuracy:</p>
            {scanType === "leaf" ? (
              <ul className="space-y-1.5">
                {["Fill the frame with the leaf", "Use natural lighting", "Focus on affected areas", "Avoid blurry images"].map(t => (
                  <li key={t} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="text-agri-green mt-0.5">•</span> {t}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1.5">
                {["Capture a wide view of the crop", "Include healthy & affected areas", "Take from slight elevation", "Good lighting for accurate results"].map(t => (
                  <li key={t} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="text-agri-green mt-0.5">•</span> {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Results Panel */}
        <div>
          {!scanResult && !error && !isScanning && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-300">
              <Leaf size={64} strokeWidth={1} className="mb-4" />
              <p className="text-base font-medium">Upload an image to begin</p>
              <p className="text-sm mt-1">Gemini AI will identify the crop and any diseases in real-time</p>
            </div>
          )}

          {isScanning && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-16 h-16 border-4 border-agri-border border-t-agri-green rounded-full mb-6"
              />
              <p className="text-base font-semibold text-agri-text">Gemini AI is analyzing your image...</p>
              <p className="text-sm text-gray-400 mt-2">This usually takes 2-5 seconds</p>
            </div>
          )}

          {/* Error */}
          {error && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border border-red-100"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-600">Analysis Failed</p>
                  <p className="text-sm text-gray-500 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {scanResult && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Main Result Card */}
              <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {scanResult.is_healthy ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <AlertTriangle size={20} className="text-orange-500" />
                      )}
                      <h2 className="text-lg font-bold text-agri-text">
                        {scanResult.disease_name || "Unknown"}
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500">
                      Crop: <strong className="text-agri-text">{scanResult.crop || "Unknown"}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-agri-green">
                      {Math.round((scanResult.confidence || 0) * 100)}%
                    </p>
                    <p className="text-xs text-gray-400">confidence</p>
                  </div>
                </div>

                {scanResult.severity && scanResult.severity !== "unknown" && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(scanResult.severity)}`}>
                    Severity: {scanResult.severity?.toUpperCase()}
                  </span>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                  <Info size={12} />
                  Analyzed by: {scanResult.analysis_mode === "gemini_vision" ? "Gemini Vision AI (Real-time)" : scanResult.model_version}
                </div>
              </div>

              {/* Symptoms */}
              {scanResult.symptoms?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-agri-text mb-3 flex items-center gap-2">
                    🔍 Observed Symptoms
                  </h3>
                  <ul className="space-y-2">
                    {scanResult.symptoms.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-orange-400 mt-0.5">▸</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Causes */}
              {scanResult.causes?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-agri-text mb-3">🦠 Likely Causes</h3>
                  <ul className="space-y-2">
                    {scanResult.causes.map((c: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-red-400 mt-0.5">▸</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment */}
              {scanResult.treatment?.length > 0 && (
                <div className="glass-card p-5 border border-emerald-100">
                  <h3 className="text-sm font-semibold text-agri-text mb-3">💊 Recommended Treatment</h3>
                  <ul className="space-y-2">
                    {scanResult.treatment.map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-emerald-500 mt-0.5">✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chat CTA */}
              <Link href="/chat">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="glass-card p-4 flex items-center justify-between cursor-pointer border border-agri-border hover:border-agri-green transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-agri-text">Need more help?</p>
                    <p className="text-xs text-gray-400 mt-0.5">Chat with the AI farming assistant</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center flex-shrink-0">
                    <Zap size={18} className="text-white" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading scanner...</div>}>
      <ScanPageContent />
    </Suspense>
  );
}
