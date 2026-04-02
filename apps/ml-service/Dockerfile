FROM python:3.10-slim

WORKDIR /app

# Core system dependencies for image processing (OpenCV)
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Main requirements (includes PyTorch and torchvision)
COPY apps/ml-service/requirements.txt ./requirements.txt

# Install PyTorch CPU version to keep image size manageable
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared packages
COPY packages/ ./packages/
RUN pip install -e ./packages/schemas
RUN pip install -e ./packages/utils

# Copy ml-service files
COPY apps/ml-service/ ./apps/ml-service/

WORKDIR /app/apps/ml-service

EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
