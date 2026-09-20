"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "sw-cleanup-reloaded";

/**
 * This domain previously hosted the Unity WebGL build, which registered a service worker
 * (ServiceWorker.js) for offline caching. That file is gone now, but a service worker
 * already installed in a visitor's browser keeps running independently of what's actually
 * deployed -- it only goes away if something unregisters it. Its old fetch handler tries
 * to Cache.put() every request it intercepts, including POST (sign-in, admin saves), which
 * throws ("Request method 'POST' is unsupported") and breaks those requests entirely. This
 * app has no service worker of its own, so unregister anything found and reload once to
 * make sure the current page isn't still under its control.
 */
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return;
      Promise.all(registrations.map((r) => r.unregister())).then(() => {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
        }
      });
    });

    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
