"""
AgroBuddy Chat Chain — conversational AI with optional RAG
Falls back to a rule-based response system when LLM is unavailable.
"""
import os
from rag.prompts import AGROBUDDY_SYSTEM_PROMPT, AGROBUDDY_FALLBACK_PROMPT

# Try to import LangChain
try:
    from langchain_openai import ChatOpenAI
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
    from langchain.schema import HumanMessage, AIMessage, SystemMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


# ─── Rule-based Fallback Knowledge Base ───

FALLBACK_RESPONSES = {
    "disease": """🌿 **Crop Disease Management**

• First, identify the disease by checking leaf spots, discoloration, wilting patterns
• **Organic solutions** (try first):
  - Neem oil spray (5ml per liter water) — effective against many fungal diseases
  - Bordeaux mixture for leaf blight and downy mildew
  - Trichoderma bio-fungicide for soil-borne diseases
• **Chemical treatment** (if organic fails):
  - Mancozeb 75% WP (2g/liter) for fungal diseases
  - ⚠️ Always wear gloves and mask while spraying
• **Prevention**: Crop rotation, proper spacing, resistant varieties
• Upload a leaf photo to our **Smart Scan** for AI-powered diagnosis! 📸""",

    "fertilizer": """🌾 **Fertilizer & Soil Health Guide**

• **Organic options** (recommended):
  - Vermicompost — excellent for all crops
  - FYM (Farm Yard Manure) — 5-10 tonnes per acre
  - Green manure — grow and plow dhaincha or sun hemp
• **Chemical fertilizers**:
  - DAP for phosphorus at sowing time
  - Urea for nitrogen (split application)
  - MOP for potassium
• **Soil testing**: Get soil tested every 2 years at nearest KVK
• **Tip**: Excessive nitrogen makes crops prone to disease! Use balanced NPK.""",

    "irrigation": """💧 **Irrigation Best Practices**

• **Drip irrigation** saves 30-50% water vs flood irrigation
• **When to water**:
  - Early morning (6-8 AM) is best
  - Avoid evening watering — promotes fungal diseases
• **Frequency**: Depends on crop and soil type
  - Sandy soil → water more frequently, less volume
  - Clay soil → water less frequently, more volume
• **Monsoon tips**:
  - Ensure proper drainage to prevent waterlogging
  - Raised beds for vegetables
• **Signs of overwatering**: Yellowing leaves, root rot, wilting despite wet soil""",

    "weather": """🌦️ **Weather & Seasonal Advisory**

• **Monsoon preparation**:
  - Clean drainage channels before monsoon
  - Prepare raised nursery beds
  - Stock fungicides for expected humid conditions
• **Summer care**:
  - Mulching to retain soil moisture
  - Shade nets for sensitive crops
• **Winter**:
  - Protect crops from frost using straw cover
  - Ideal time for wheat, mustard, peas
• **Rain alerts**:
  - Do not spray chemicals during rain
  - Harvest mature crops before heavy rain forecast""",

    "yield": """📈 **Yield Improvement Tips**

• **Soil health**: Use organic matter, maintain pH 6-7
• **Seed quality**: Use certified seeds from reliable sources
• **Spacing**: Follow recommended crop spacing — overcrowding reduces yield
• **Nutrients**: Balanced NPK based on soil test
• **Water management**: Right amount at right time
• **Pest control**: Regular monitoring, early intervention
• **Crop rotation**: Don't repeat same crop in same field
• **Tip**: Keep records of each season to learn what works best for your farm!""",

    "default": """🌱 **Hello! I'm AgroBuddy, your farming assistant!**

I can help you with:
• 🦠 **Crop diseases** — identification and treatment
• 🧪 **Fertilizers** — organic and chemical recommendations
• 💧 **Irrigation** — water management tips
• 🌦️ **Weather** — seasonal advisories
• 📈 **Yield** — improvement strategies
• 📸 **Smart Scan** — upload a photo for AI diagnosis

What would you like to know about? Just ask in simple language!""",
}


def _get_fallback_response(message: str) -> str:
    """Get a rule-based response when LLM is unavailable."""
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["disease", "blight", "rot", "fungus", "infection", "spot", "wilt", "rust"]):
        return FALLBACK_RESPONSES["disease"]
    elif any(w in msg_lower for w in ["fertilizer", "manure", "compost", "npk", "urea", "dap", "soil"]):
        return FALLBACK_RESPONSES["fertilizer"]
    elif any(w in msg_lower for w in ["water", "irrigation", "drip", "rain", "flood", "moisture"]):
        return FALLBACK_RESPONSES["irrigation"]
    elif any(w in msg_lower for w in ["weather", "monsoon", "summer", "winter", "season", "rain", "frost"]):
        return FALLBACK_RESPONSES["weather"]
    elif any(w in msg_lower for w in ["yield", "harvest", "production", "improve", "increase", "grow"]):
        return FALLBACK_RESPONSES["yield"]
    elif any(w in msg_lower for w in ["hello", "hi", "hey", "help", "what can you do", "start"]):
        return FALLBACK_RESPONSES["default"]
    else:
        return FALLBACK_RESPONSES["default"]


class ChatChain:
    """Conversational AI chain with LLM + RAG support and rule-based fallback."""

    def __init__(self):
        self.llm = None
        self.use_llm = False

        if not LANGCHAIN_AVAILABLE:
            print("ℹ️ LangChain libraries not installed — using rule-based fallback responses")
            return

        # 1. Prefer Google Gemini (Free Tier)
        if GOOGLE_API_KEY and GOOGLE_API_KEY != "your-gemini-api-key":
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model=GEMINI_MODEL,
                    temperature=0.7,
                    google_api_key=GOOGLE_API_KEY,
                )
                self.use_llm = True
                print("✅ Google Gemini (Free) connected successfully")
                return
            except Exception as e:
                print(f"⚠️ Gemini setup failed: {e}")

        # 2. Fallback to OpenAI (Paid/Trial)
        if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key":
            try:
                self.llm = ChatOpenAI(
                    model=OPENAI_MODEL,
                    temperature=0.7,
                    api_key=OPENAI_API_KEY,
                )
                self.use_llm = True
                print("✅ OpenAI connected successfully")
                return
            except Exception as e:
                print(f"⚠️ OpenAI setup failed: {e}")

        print("ℹ️ No AI keys found — using rule-based fallback responses")

    async def chat(self, message: str, history: list[dict] | None = None, context: str = "") -> str:
        """Process a chat message and return a response."""
        if not self.use_llm:
            return _get_fallback_response(message)

        try:
            # Build message history
            messages = [
                SystemMessage(content=AGROBUDDY_SYSTEM_PROMPT.format(context=context or "No specific context available.")),
            ]

            # Add conversation history
            if history:
                for msg in history[-10:]:  # Last 10 messages for context
                    if msg.get("role") == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg.get("role") == "assistant":
                        messages.append(AIMessage(content=msg["content"]))

            messages.append(HumanMessage(content=message))

            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            print(f"❌ LLM error: {e}")
            return _get_fallback_response(message)


# Singleton
chat_chain = ChatChain()
