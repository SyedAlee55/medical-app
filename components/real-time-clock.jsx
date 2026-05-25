'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { formatGlobalDate, formatGlobalTime } from '@/utils/time'

export default function RealTimeClock() {
    const [mounted, setMounted] = useState(false)
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!mounted) return <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-full" />

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm">
            <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
                {formatGlobalDate(time)}
            </span>
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {formatGlobalTime(time)}
            </span>
        </div>
    )
}
