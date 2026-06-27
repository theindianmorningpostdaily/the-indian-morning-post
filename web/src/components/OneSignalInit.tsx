"use client";
import { useEffect } from "react";

// Web push via OneSignal. No-op unless NEXT_PUBLIC_ONESIGNAL_APP_ID is set.
// The worker is scoped to /onesignal/ so it doesn't clash with our PWA sw.js.
const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export default function OneSignalInit() {
  useEffect(() => {
    if (!APP_ID) return;
    // Avoid double-init on client navigations.
    if ((window as unknown as { __oneSignalInit?: boolean }).__oneSignalInit) return;
    (window as unknown as { __oneSignalInit?: boolean }).__oneSignalInit = true;

    const w = window as unknown as { OneSignalDeferred?: unknown[] };
    w.OneSignalDeferred = w.OneSignalDeferred || [];

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    document.head.appendChild(script);

    w.OneSignalDeferred.push(async (OneSignal: {
      init: (cfg: Record<string, unknown>) => Promise<void>;
    }) => {
      await OneSignal.init({
        appId: APP_ID,
        serviceWorkerParam: { scope: "/onesignal/" },
        serviceWorkerPath: "onesignal/OneSignalSDKWorker.js",
      });
    });
  }, []);

  return null;
}
