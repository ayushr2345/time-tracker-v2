/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_PORTS } from "@time-tracker/shared";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  const backendPort = env.BACKEND_PORT || DEFAULT_PORTS.DEFAULT_PORT_BACKEND;
  const apiBaseUrl = env.VITE_API_BASE_URL || `http://localhost:${backendPort}/api`;
  return {
    plugins: [react(), tailwindcss()],
    envDir: "../",
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseUrl),
    },
    server: {
      port: parseInt(env.FRONTEND_PORT) || DEFAULT_PORTS.DEFAULT_PORT_FRONTEND,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: false,
    },
  };
});
