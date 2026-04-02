import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so localhost, 127.0.0.1, and LAN URLs work reliably on Windows.
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    // Projects under OneDrive/Desktop often break file watching; polling avoids a stuck or empty dev server.
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
