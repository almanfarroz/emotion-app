# Gunakan image resmi Python sebagai basis
FROM python:3.9-slim

# Set lingkungan kerja di dalam container
WORKDIR /app

# Salin file requirements.txt ke dalam container
COPY requirements.txt .

# Instal dependensi yang diperlukan
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh file dan folder yang diperlukan ke dalam container
COPY . .

# Ekspos port yang digunakan oleh FastAPI
EXPOSE 8000

# Jalankan aplikasi FastAPI menggunakan Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
