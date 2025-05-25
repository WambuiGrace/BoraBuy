"use client"

import { useEffect } from "react"
import { setupOfflineSync } from "@/lib/offline-storage"

export function ServiceWorkerProvider() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }

    // Initialize offline sync
    setupOfflineSync()
  }, [])

  return null
} 