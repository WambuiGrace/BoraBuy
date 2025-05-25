"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  const router = useRouter()

  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        router.push('/')
      }
    }

    window.addEventListener('online', checkConnection)
    return () => window.removeEventListener('online', checkConnection)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <WifiOff className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">You're offline</h2>
        <p className="mt-2 text-gray-600">
          Some features are limited while you're offline. Your data will sync when you're back online.
        </p>
        <ul className="mt-4 text-left text-gray-600 space-y-2">
          <li>✓ View cached products and suppliers</li>
          <li>✓ Add new price entries (will sync later)</li>
          <li>✓ View recent price history</li>
          <li>✗ Real-time updates</li>
          <li>✗ Profile changes</li>
          <li>✗ New product/supplier creation</li>
        </ul>
      </div>
    </div>
  )
}
