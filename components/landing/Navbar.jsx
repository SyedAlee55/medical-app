'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar({ theme = "light" }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Always dark — scrolled just adds a slightly denser blur + border glow
  const navBgClass = scrolled
    ? 'bg-zinc-950/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
    : 'bg-zinc-950/40 backdrop-blur-md border-b border-white/5'

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ${navBgClass}`}>
      <style>{`
        @keyframes coin-flip-y {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        .animate-coin-flip {
          animation: coin-flip-y 4.5s linear infinite;
          transform-style: preserve-3d;
          backface-visibility: visible;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-400/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_12px_rgba(6,148,162,0.1)] animate-coin-flip">
            <img src="/logo3.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white transition-colors">
            Tj&apos;s Medical Hub
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">

          {/* For Patients Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
              For Patients
              <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 p-2 min-w-[220px] z-50 animate-fade-in">
              {[
                { label: 'Find a Doctor', href: '/login' },
                { label: 'Book Appointment', href: '/schedule' },
                { label: 'Patient Portal', href: '/login' },
                { label: 'Telemedicine', href: '/login' },
              ].map((item) => (
                <a key={item.label} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-zinc-300 hover:text-white transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* For Doctors Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
              For Doctors
              <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 p-2 min-w-[220px] z-50 animate-fade-in">
              {[
                { label: 'Doctor Portal', href: '/login' },
                { label: 'Manage Schedule', href: '/login' },
                { label: 'Patient Records', href: '/login' },
                { label: 'Prescriptions', href: '/login' },
              ].map((item) => (
                <a key={item.label} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-zinc-300 hover:text-white transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <a href="/schedule" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Book in app
          </a>
          <a href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            About
          </a>
          <a href="/team" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            
          </a>
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Log In
          </a>
          <a
            href="/schedule"
            className="bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-brand-500/15 hover:border-brand-400/25 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-300 active:scale-[0.98] shadow-[0_2px_12px_rgba(6,148,162,0.05)]"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer — dark */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-5 shadow-2xl animate-fade-in absolute left-0 right-0 top-16 z-50">
          <div className="flex flex-col gap-3">
            <p className="type-label text-zinc-500">For Patients</p>
            <a href="/login"    className="text-zinc-300 hover:text-white font-medium pl-2 transition-colors">Find a Doctor</a>
            <a href="/schedule" className="text-zinc-300 hover:text-white font-medium pl-2 transition-colors">Book Appointment</a>
            <a href="/login"    className="text-zinc-300 hover:text-white font-medium pl-2 transition-colors">Patient Portal</a>
          </div>
          <div className="flex flex-col gap-3">
            <p className="type-label text-zinc-500">For Doctors</p>
            <a href="/login" className="text-zinc-300 hover:text-white font-medium pl-2 transition-colors">Doctor Portal</a>
            <a href="/login" className="text-zinc-300 hover:text-white font-medium pl-2 transition-colors">Manage Schedule</a>
          </div>
          <hr className="border-white/10" />
          <div className="flex flex-col gap-2">
            <a href="/login" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">Pricing</a>
            <a href="/about" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">About</a>
            <a href="#" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">Blog</a>
            <a href="/schedule" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">Book in app</a>
            <a href="#" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">About</a>
            <a href="/team" className="text-zinc-700 hover:text-zinc-950 font-medium py-1">Team</a>
            <a href="/schedule" className="text-zinc-300 hover:text-white font-medium py-1 transition-colors">Book in app</a>
            <a href="#"         className="text-zinc-300 hover:text-white font-medium py-1 transition-colors">About</a>
            <a href="/team"     className="text-zinc-300 hover:text-white font-medium py-1 transition-colors">Team</a>
          </div>
          <hr className="border-white/10" />
          <div className="flex flex-col gap-3">
            <a href="/login"    className="text-center text-sm font-medium text-zinc-300 hover:text-white py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-all">Log In</a>
            <a href="/schedule" className="text-center bg-brand-500/10 border border-brand-400/20 text-white font-semibold rounded-xl py-3 text-sm hover:bg-brand-500/20 transition-all active:scale-[0.98]">Get Started</a>
          </div>
        </div>
      )}
    </nav>
  )
}
