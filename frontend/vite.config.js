import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // A phone opens http://<laptop-ip>:5173. Those requests stay
            // same-origin through this proxy. Present them as the local app
            // so CORS still matches FRONTEND_URL.
            if (!proxyReq.getHeader("origin")) return;
            proxyReq.setHeader("origin", "http://localhost:5173");
          });
        },
      },
    },
  },
})
