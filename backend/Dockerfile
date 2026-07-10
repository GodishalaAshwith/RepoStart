FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --default-timeout=100 --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --default-timeout=100 --no-cache-dir -r requirements.txt

# Copy the app code
COPY . .

# Expose the port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
