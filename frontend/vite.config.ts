/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_PORTS } from "@time-tracker/shared";

// TODO: Add port inside env file and use here

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: DEFAULT_PORTS.DEFAULT_PORT_FRONTEND,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
