import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
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
    plugins: [dyadComponentTagger(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: basePath, // Use the configurable base path
  };
});