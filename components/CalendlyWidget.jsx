'use client'

import { useState, useEffect } from 'react'

export default function CalendlyWidget() {
  const [loading, setLoading] = useState(true)
  const [booked, setBooked] = useState(false)
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL

  // Load Calendly Script lazily — hooks must always be called before any early returns
  useEffect(() => {
    if (!calendlyUrl) return
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      // Guard against double-removal if script was never appended
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [calendlyUrl])

  // Listen to Calendly postMessage events
  useEffect(() => {
    if (!calendlyUrl) return
    const handleMessage = (e) => {
      if (!e.data || !e.data.event) return
      if (e.data.event === 'calendly.event_scheduled') {
        setBooked(true)
      }
      // Any calendly.* message means the widget has fully initialized
      if (e.data.event.startsWith('calendly.')) {
        setLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)

    // Fallback: hide skeleton after 4 s if no postMessage fires (e.g. adblocker)
    const timer = setTimeout(() => setLoading(false), 4000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(timer)
    }
  }, [calendlyUrl])

  // ── Error state — shown AFTER hooks have run ──────────────────────────────
  if (!calendlyUrl) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        Booking is temporarily unavailable. Please contact us directly.
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {booked && (
        <div className="mx-4 sm:mx-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
          ✓ Your appointment request has been received. Our team will confirm shortly.
        </div>
      )}

      <div className="relative w-full">
        {loading && (
          <div
            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center z-10"
            style={{ height: '800px' }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Loading scheduler...</span>
            </div>
          </div>
        )}

        <div
          className="calendly-inline-widget"
          data-url={calendlyUrl}
          style={{
            width: '100%',
            height: '800px',
            visibility: loading ? 'hidden' : 'visible',
          }}
        />
      </div>
    </div>
  )
}
