import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth-service": {
        target: "http://localhost:10101",
        changeOrigin: true
      },
      "/user-service": {
        target: "http://localhost:10101",
        changeOrigin: true
      }
    }
  }
});
