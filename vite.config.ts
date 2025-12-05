import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // Use VITE_APP_BASE_PATH environment variable, default to '/'
  const basePath = process.env.VITE_APP_BASE_PATH || '/';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: basePath, // Use the configurable base path
    test: {
      globals: true, // Permite usar 'describe', 'it', 'expect' globalmente
      environment: 'jsdom', // Ambiente de DOM para testes de React
      setupFiles: './vitest.setup.ts', // Arquivo de setup para configurações adicionais
      css: true, // Habilita o processamento de CSS para testes de componentes
    },
  };
});