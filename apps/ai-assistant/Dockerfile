FROM python:3.10-slim

WORKDIR /app

# For compiling FAISS or specific dependencies
RUN apt-get update && apt-get install -y gcc g++ && rm -rf /var/lib/apt/lists/*

COPY apps/ai-assistant/requirements.txt ./requirements.txt

# LangChain, FAISS, Sentence Transformers
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared monorepo packages
COPY packages/ ./packages/
RUN pip install -e ./packages/schemas
RUN pip install -e ./packages/prompts

COPY apps/ai-assistant/ ./apps/ai-assistant/

WORKDIR /app/apps/ai-assistant

EXPOSE 8002
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
