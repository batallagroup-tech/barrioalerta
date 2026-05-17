import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { registerServiceWorker } from "./utils/notifications";
import { oneSignalService } from "./services/oneSignalService";
import { admobService } from "./services/admobService";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "./lib/supabase";

registerServiceWorker();

// Manejar OAuth callback en PWA
const _w = window as any;
if (!_w.Capacitor?.isNativePlatform?.()) {
  const pwaParams = new URLSearchParams(window.location.search);
  const pwaCode = pwaParams.get("code");
  if (pwaCode) {
    supabase.auth.exchangeCodeForSession(pwaCode).then(() => {
      window.history.replaceState({}, "", window.location.pathname);
    });
  }
}

oneSignalService.init().catch(() => {});
admobService.initialize().catch(() => {});

async function handleDeepLink(url: string) {
  console.log("[main] handleDeepLink:", url);
  const normalized = url
    .replace("com.barrioalerta.app://", "https://placeholder.com/")
    .replace("com.barrioalerta.app:", "https://placeholder.com");
  let params: URLSearchParams;
  try {
    const parsed = new URL(normalized);
    const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
    params = new URLSearchParams(hash || parsed.search);
  } catch {
    console.warn("[main] URL invalida:", url);
    return;
  }
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  await Browser.close().catch(() => {});
  if (tokenHash && type) {
    console.log("[main] Magic Link - verifyOtp...");
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
    if (error) console.error("[main] verifyOtp error:", error.message);
    else console.log("[main] verifyOtp OK");
    return;
  }
  if (code) {
    console.log("[main] OAuth PKCE - exchangeCodeForSession...");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("[main] exchangeCode error:", error.message);
    else console.log("[main] exchangeCode OK");
    return;
  }
  console.warn("[main] Deep link sin token:", url);
}

CapApp.addListener("appUrlOpen", (event) => {
  console.log("[main] appUrlOpen:", event.url);
  handleDeepLink(event.url);
});

CapApp.getLaunchUrl()
  .then((result) => {
    if (result?.url) {
      console.log("[main] getLaunchUrl:", result.url);
      handleDeepLink(result.url);
    }
  })
  .catch(() => {});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
