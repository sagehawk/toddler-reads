import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, ".."), "");

  const processEnv = {};
  for (const key in env) {
    if (key.startsWith("VITE_")) {
      processEnv[`import.meta.env.${key}`] = JSON.stringify(env[key]);
    }
  }

  return {
    plugins: [react(), runtimeErrorOverlay()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    envDir: '../',
    envPrefix: 'VITE_',
    server: {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true,
      hmr: {
        clientPort: 443,
      },
    },
    define: processEnv,
  };
});
