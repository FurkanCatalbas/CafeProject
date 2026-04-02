import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.js"]
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/auth-service": {
        target: "http://localhost:10101",
        changeOrigin: true,
        secure: false
      },
      "/user-service": {
        target: "http://localhost:10101",
        changeOrigin: true,
        secure: false
      }
    }
  },
  // `npm run preview` serves static build without dev server; same proxy so /auth-service → gateway
  preview: {
    port: 4173,
    proxy: {
      "/auth-service": {
        target: "http://localhost:10101",
        changeOrigin: true,
        secure: false
      },
      "/user-service": {
        target: "http://localhost:10101",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
