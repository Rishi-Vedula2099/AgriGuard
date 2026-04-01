"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Trash2, Bot } from "lucide-react";
import Link from "next/link";
import { useChatStore } from "@/lib/store";

const quickPrompts = [
  { text: "How to treat leaf blight?", icon: "🦠" },
  { text: "Best fertilizer for wheat?", icon: "🧪" },
  { text: "When to plant rice?", icon: "🌾" },
  { text: "Organic pest control", icon: "🐛" },
  { text: "Drip irrigation tips", icon: "💧" },
  { text: "Monsoon crop planning", icon: "🌧️" },
];

// Rule-based responses for demo mode
const demoResponses: Record<string, string> = {
  disease: `🌿 **Crop Disease Management**

• **Identify first**: Check leaf spots, discoloration, and wilting patterns
• **Organic treatment** (try first):
  - Neem oil spray (5ml per liter water)
  - Bordeaux mixture for blight & mildew
  - Trichoderma bio-fungicide for soil diseases
• **Chemical** (if organic fails):
  - Mancozeb 75% WP (2g/liter)
  - ⚠️ Wear gloves and mask while spraying
• **Prevention**: Crop rotation, proper spacing, resistant varieties

📸 Upload a photo to **Smart Scan** for AI diagnosis!`,

  fertilizer: `🌾 **Fertilizer Guide**

• **Organic (recommended)**:
  - Vermicompost — great for all crops
  - FYM — 5-10 tonnes per acre
  - Green manure (dhaincha/sun hemp)
• **Chemical**:
  - DAP for phosphorus at sowing
  - Urea for nitrogen (split it!)
  - MOP for potassium
• 💡 Get soil tested at your nearest KVK every 2 years
• ⚠️ Too much nitrogen = more diseases!`,

  irrigation: `💧 **Irrigation Tips**

• Drip irrigation saves 30-50% water
• Best watering time: 6-8 AM
• Avoid evening watering (promotes fungi)
• Sandy soil → water more often, less volume
• Clay soil → less often, more volume
• Mulching helps retain moisture
• 🌧️ Ensure drainage before monsoon`,

  default: `🌱 **Hello! I'm AgroBuddy!**

I can help you with:
• 🦠 Crop diseases — identification & treatment
• 🧪 Fertilizers — organic & chemical
• 💧 Irrigation — water management
• 🌦️ Weather — seasonal advisory
• 📈 Yield — improvement tips

Just ask me anything about farming! 😊`,
};

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/disease|blight|rot|fungus|infection|spot|wilt|rust/)) return demoResponses.disease;
  if (lower.match(/fertilizer|manure|compost|npk|urea|dap|soil/)) return demoResponses.fertilizer;
  if (lower.match(/water|irrigation|drip|rain|flood|moisture/)) return demoResponses.irrigation;
  return demoResponses.default;
}

export default function ChatPage() {
  const { messages, addMessage, clearMessages, isLoading, setIsLoading } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message) return;
    setInput("");

    addMessage({ role: "user", content: message, timestamp: new Date().toISOString() });
    setIsLoading(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 1200));
    
    const response = getDemoResponse(message);
    addMessage({ role: "assistant", content: response, timestamp: new Date().toISOString() });
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-agri-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-agri-border">
        <Link href="/">
          <motion.div whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={18} className="text-gray-600" />
          </motion.div>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-full gradient-green flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-display text-agri-text">AgroBuddy</h1>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-600">Online</span>
            </div>
          </div>
        </div>
        <button onClick={clearMessages} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Trash2 size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <div className="w-16 h-16 rounded-full gradient-green mx-auto flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-base font-bold font-display text-agri-text mb-1">Hello, Farmer! 🌱</h2>
            <p className="text-xs text-gray-400 mb-6">I&apos;m AgroBuddy, your AI farming assistant.</p>

            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-agri-border text-left hover:border-agri-green/30 transition-colors"
                  id={`prompt-${i}`}
                >
                  <span className="text-base">{prompt.icon}</span>
                  <span className="text-xs text-agri-text">{prompt.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] px-4 py-3 ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                <div className="text-xs leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="chat-bubble-bot px-4 py-3 flex items-center gap-1">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-agri-green" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-agri-green" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-agri-green" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white/90 backdrop-blur-xl border-t border-agri-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AgroBuddy anything..."
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-agri-text placeholder:text-gray-400 focus:outline-none focus:border-agri-green/50 focus:ring-2 focus:ring-agri-green/10"
            id="chat-input"
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() ? "gradient-green shadow-lg shadow-green-200" : "bg-gray-100"
            }`}
            id="chat-send-btn"
          >
            <Send size={18} className={input.trim() ? "text-white" : "text-gray-300"} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
