import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Make Vite accessible externally
    port: process.env.PORT || 5173 // Use Render's provided port, or fall back to 5173
  }
});
