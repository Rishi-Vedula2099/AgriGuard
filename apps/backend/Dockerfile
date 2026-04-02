FROM python:3.10-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y gcc cur && rm -rf /var/lib/apt/lists/*

# App dependencies
COPY apps/backend/requirements.txt ./requirements.txt
# Copy local packages for shared schemas
COPY packages/ ./packages/

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -e ./packages/schemas
RUN pip install -e ./packages/utils

# Copy application code
COPY apps/backend/ ./apps/backend/

WORKDIR /app/apps/backend

# Run FastAPI using uvicorn
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
