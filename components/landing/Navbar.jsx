'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-zinc-900 text-lg tracking-tight">
            Tj&apos;s Medical Hub
          </span>
        </a>

        {/* Center: Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {/* For Patients Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">
              For Patients
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-xl shadow-xl border border-zinc-100 p-2 min-w-[220px] z-50 animate-fade-in">
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Find a Doctor
              </a>
              <a
                href="/schedule"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Book Appointment
              </a>
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Patient Portal
              </a>
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Telemedicine
              </a>
            </div>
          </div>

          {/* For Doctors Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">
              For Doctors
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-xl shadow-xl border border-zinc-100 p-2 min-w-[220px] z-50 animate-fade-in">
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Doctor Portal
              </a>
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Manage Schedule
              </a>
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Patient Records
              </a>
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Prescriptions
              </a>
            </div>
          </div>

          <a href="/schedule" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Book in app
          </a>
          <a href="#" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            About
          </a>
          <a href="/team" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Team
          </a>
        </div>

        {/* Right: CTA buttons (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Log In
          </a>
          <a
            href="/schedule"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(6,148,162,0.3)] active:scale-[0.98]"
          >
            Get Started
          </a>
        </div>

        {/* Mobile: Hamburger Button */}
        <button
          className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-6 flex flex-col gap-5 shadow-lg animate-fade-in absolute left-0 right-0 top-16 z-50">
          <div className="flex flex-col gap-3">
            <p className="type-label text-zinc-400">For Patients</p>
            <a href="/login" className="text-zinc-700 hover:text-zinc-950 font-medium pl-2">Find a Doctor</a>
            <a href="/schedule" className="text-zinc-700 hover:text-zinc-950 font-medium pl-2">Book Appointment</a>
            <a href="/login" className="text-zinc-700 hover:text-zinc-950 font-medium pl-2">Patient Portal</a>
          </div>
          <div className="flex flex-col gap-3">
            <p className="type-label text-zinc-400">For Doctors</p>
            <a href="/login" className="text-zinc-700 hover:text-zinc-950 font-medium pl-2">Doctor Portal</a>
            <a href="/login" className="text-zinc-700 hover:text-zinc-950 font-medium pl-2">Manage Schedule</a>
          </div>
          <hr className="border-zinc-100" />
          <div className="flex flex-col gap-2">
            <a href="/schedule" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">Book in app</a>
            <a href="#" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">About</a>
            <a href="/team" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">Team</a>
          </div>
          <hr className="border-zinc-100" />
          <div className="flex flex-col gap-3">
            <a
              href="/login"
              className="text-center text-sm font-medium text-zinc-600 hover:text-zinc-900 py-2 border border-zinc-200 rounded-lg"
            >
              Log In
            </a>
            <a
              href="/schedule"
              className="text-center bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-3 text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98]"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
