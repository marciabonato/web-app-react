/// <reference types="vitest" />
import { defineConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Configuração base do Vite (Plugins, Build, etc.)
const viteConfig = defineConfig({
  base: "/web-app-react/",
  plugins: [react()],
});

// Configuração otimizada do Vitest (Ambiente de testes rápido)
const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,

    // ✅ Ajuste para Vitest v4
    pool: "vmThreads", // cria jsdom uma vez por worker, mantendo isolamento por arquivo
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});

// Fusão das duas configurações com tipagem estrita
export default mergeConfig(viteConfig, vitestConfig);