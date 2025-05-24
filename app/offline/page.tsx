"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          It looks like you're not connected to the internet. Some features may not be available.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
