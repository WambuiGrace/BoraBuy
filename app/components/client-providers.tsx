"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ServiceWorkerProvider } from "./service-worker-provider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ServiceWorkerProvider />
      {children}
      <Toaster />
    </AuthProvider>
  )
}
