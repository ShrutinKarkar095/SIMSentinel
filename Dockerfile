# Base image
FROM python:3.11-slim

# Create working directory
WORKDIR /app

# Copy requirements first (caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the backend
COPY backend ./backend

# Expose port used by the backend
EXPOSE 8080

# Start server
CMD ["python", "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8080"]
