# Use Python 3.11-slim base image
FROM python:3.11-slim

# Install system dependencies for espeak-ng, portaudio, curl, and node.js
RUN apt-get update && apt-get install -y \
    espeak-ng \
    portaudio19-dev \
    gcc \
    curl \
    alsa-utils \
    alsa-oss \
    libasound2 \
    libasound2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash && apt-get install -y nodejs

# Set working directory
WORKDIR /opt/render/project/src

# Copy the entire repository to the Docker image
COPY . .

# Install Python dependencies for the backend
WORKDIR /opt/render/project/src/Jarvis
RUN pip install speechrecognition \
    && pip install pyttsx3 \
    && pip install requests \
    && pip install PyAudio

# Install Node.js dependencies for the frontend
WORKDIR /opt/render/project/src
RUN npm install

WORKDIR /opt/render/project/src/Frontend
RUN npm install

# Build the frontend
RUN npm run build

# Expose the frontend port (Vite typically runs on 5173)
EXPOSE 5173

# Set the environment variable for Vite to bind to 0.0.0.0 on the correct port
ENV VITE_PORT=5173
ENV HOST=0.0.0.0

# Set the default command to start the application
WORKDIR /opt/render/project/src
CMD ["npm", "run", "dev"]
