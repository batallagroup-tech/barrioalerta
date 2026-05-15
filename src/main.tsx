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
    console.warn("[main] URL invÃ¡lida:", url);
    return;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token") ?? "";
  const tokenHash = params.get("token_hash");
  const type = params.get("type");

  // Cerrar el InAppBrowser inmediatamente
  await Browser.close().catch(() => {});

  if (tokenHash && type) {
    console.log("[main] Magic Link â€” verifyOtp...");
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
    if (error) console.error("[main] verifyOtp error:", error.message);
    else console.log("[main] verifyOtp OK âœ“");
    return;
  }

  if (accessToken) {
    console.log("[main] OAuth â€” setSession...");
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) console.error("[main] setSession error:", error.message);
    else console.log("[main] setSession OK âœ“");
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
