import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./hooks/useTheme";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

// Offline support: cache the app shell, phonics MP3s, and story pages so the
// app keeps working on flaky connections (car rides, flights).
//
// Update pipeline for a tablet app that stays open for DAYS:
// 1. Check for a new service worker every time the app returns to the
//    foreground (tablets rarely re-navigate, so the default on-load check
//    alone leaves them stale for days).
// 2. When a new version takes control, reload to pick it up — but ONLY while
//    the app is backgrounded, never mid-play (a reload would eat a drawing).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Only treat a controller change as "an update arrived" if a service
    // worker was already controlling this page (i.e. not the first install).
    const wasControlled = !!navigator.serviceWorker.controller;

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        });
      })
      .catch(() => {
        // Non-fatal: the app works fine without offline caching
      });

    if (wasControlled) {
      let scheduled = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (scheduled) return;
        scheduled = true;
        if (document.visibilityState === "hidden") {
          window.location.reload();
          return;
        }
        const reloadWhenHidden = () => {
          if (document.visibilityState === "hidden") {
            document.removeEventListener("visibilitychange", reloadWhenHidden);
            window.location.reload();
          }
        };
        document.addEventListener("visibilitychange", reloadWhenHidden);
      });
    }
  });
}
