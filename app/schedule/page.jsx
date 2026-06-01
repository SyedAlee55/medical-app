"use client"

import Link from 'next/link'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import CalendlyWidget from '@/components/CalendlyWidget'
import { Sparkles, Info, ArrowRight } from 'lucide-react'

export default function GuestBookingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden">
      <div>
        {/* Navbar */}
        <Navbar />

        {/* Booking Container with Landing Page Margins and Styling */}
        <div className="px-4 lg:px-6 py-6">
          <div className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/20 backdrop-blur-2xl p-8 sm:p-12 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

              {/* Header */}
              <div className="text-center space-y-4">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  APPOINTMENT SCHEDULER
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Book an Appointment
                </h1>
                <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Fill in the details below to request a clinical consultation. Our team will review your request and assign the right specialist for you.
                </p>
              </div>

              {/* Info Banner */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 max-w-2xl mx-auto shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold text-white text-sm">Guest & New Patient Booking</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      This form is for guest patients. If you are already registered,{' '}
                      <Link
                        href="/login"
                        className="text-emerald-400 hover:text-emerald-350 underline underline-offset-2 transition-colors font-medium inline-flex items-center gap-0.5"
                      >
                        Sign in here
                        <ArrowRight className="w-3 h-3 inline" />
                      </Link>{' '}
                      to book directly with your preferred doctor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendly Widget — scaled down to fit viewport without scrolling */}
              <div style={{ height: 'calc(800px * 0.82)', overflow: 'hidden' }}>
                <div style={{ transform: 'scale(0.82)', transformOrigin: 'top center', width: `${(1/0.82)*100}%`, marginLeft: `${((1/0.82)-1)/2*-100}%` }}>
                  <CalendlyWidget />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
