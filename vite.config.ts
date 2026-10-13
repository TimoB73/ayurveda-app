/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // Installierbare Web-App: Manifest + Service Worker (offline nutzbar, keine Datenübertragung)
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "./",
        name: "Ayurveda-Konstitutionstest",
        short_name: "Ayurveda-Test",
        description: "Selbsteinschätzung von Prakriti und Vikriti – alles bleibt lokal auf Ihrem Gerät.",
        lang: "de",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#fafaf9",
        theme_color: "#92400e",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ttf}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  base: "./",
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: { recharts: ["recharts"] },
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
