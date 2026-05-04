import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Prefixo automático para todas as chamadas /api — funciona independente do BASE_PATH
const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
if (BASE) {
  const _nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api")) {
      input = BASE + input;
    } else if (input instanceof Request && input.url.startsWith("/api")) {
      input = new Request(BASE + input.url, input);
    }
    return _nativeFetch(input, init);
  };
}

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/sw.js";
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}
