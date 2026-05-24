'use client'

import { PlayCircle } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f8faff] py-20 lg:py-32">
      {/* Blurred teal background accent */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl -z-10" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-100/40 blur-3xl -z-10" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start animate-fade-up">
            <span className="type-label text-brand-600 mb-4 tracking-wider">
              TRUSTED BY 50,000+ PATIENTS
            </span>
            
            <h1 className="type-hero mb-6 text-zinc-900 leading-tight">
              Modern healthcare, <br />
              <span className="text-brand-600">finally built around you</span>
            </h1>
            
            <p className="type-body text-zinc-500 max-w-lg mb-8 text-base md:text-lg">
              We connect patients with top-rated, verified doctors — for in-person visits, telemedicine, and everything in between. Your health journey, managed in one place.
            </p>
            
            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="/schedule"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-6 py-3.5 text-center text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(6,148,162,0.3)] active:scale-[0.98]"
              >
                Book an Appointment &rarr;
              </a>
              <a
                href="#services"
                className="flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-semibold rounded-lg px-6 py-3.5 text-sm transition-all duration-200 bg-white"
              >
                <PlayCircle className="w-5 h-5 text-zinc-400" />
                See how it works
              </a>
            </div>

            {/* Social Proof Strip */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {[
                  'bg-brand-100 text-brand-700',
                  'bg-brand-200 text-brand-800',
                  'bg-brand-300 text-brand-900',
                  'bg-brand-400 text-white',
                  'bg-brand-500 text-white',
                ].map((bg, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs ${bg}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500">
                Join <strong className="font-semibold text-zinc-800">50,000+</strong> patients already using Tj&apos;s Medical Hub
              </p>
            </div>
          </div>

          {/* Right Column: CSS Illustration */}
          <div className="flex justify-center lg:justify-end animate-float">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 flex flex-col gap-5">
              {/* Card Title */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Your next appointment
                </p>
              </div>

              {/* Doctor Details */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                  DR
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-950 text-sm">Dr. Aisha Rehman</h4>
                  <p className="text-xs text-zinc-500">Primary Care Physician</p>
                </div>
              </div>

              {/* Date/Time Chip */}
              <div className="bg-brand-50 rounded-xl p-3 flex items-center justify-between text-xs text-brand-800 font-medium">
                <span>Tomorrow, May 26</span>
                <span>10:30 AM (EST)</span>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                  <span>Onboarding Progress</span>
                  <span>66% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full w-2/3" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-100" />

              {/* Stat Chips */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-zinc-400 font-medium">Satisfaction</p>
                  <p className="text-sm font-bold text-zinc-800 mt-0.5">98% Rated</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-zinc-400 font-medium">Booking Time</p>
                  <p className="text-sm font-bold text-zinc-800 mt-0.5">&lt; 2 min</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
