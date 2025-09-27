import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), tsconfigPaths()],
  appType: "spa",
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
    historyApiFallback: true,
  },
});
