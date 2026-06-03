'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar({ theme = "light" }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleContactClick = (e) => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      e.preventDefault()
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  // Transparent at top (blends with hero). Frosted-glass blur when scrolled.
  const navBgClass = scrolled
    ? 'bg-white/8 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.25)]'
    : 'bg-transparent border-b border-transparent'

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${navBgClass}`}>
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
          <a href="/schedule" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Book Appointment
          </a>
          <a href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            About
          </a>
          <a 
            href="/#contact" 
            onClick={handleContactClick} 
            className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Contact Us
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
            Book
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
            <a href="/schedule" className="text-zinc-300 hover:text-white font-medium transition-colors">Book Appointment</a>
            <a href="/about" className="text-zinc-300 hover:text-white font-medium transition-colors">About Us</a>
            <a 
              href="/#contact" 
              onClick={handleContactClick} 
              className="text-zinc-300 hover:text-white font-medium transition-colors cursor-pointer"
            >
              Contact Us
            </a>
          </div>
          <hr className="border-white/10" />
          <div className="flex flex-col gap-3">
            <a href="/login" className="text-zinc-300 hover:text-white font-medium transition-colors">Patient Dashboard</a>
            <a href="/login" className="text-zinc-300 hover:text-white font-medium transition-colors">Doctor Dashboard</a>
          </div>
          <hr className="border-white/10" />
          <div className="flex flex-col gap-3">
            <a href="/login" className="text-center text-sm font-medium text-zinc-350 hover:text-white py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-all">Log In</a>
            <a href="/schedule" className="text-center bg-white/5 border border-white/10 text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-white/10 transition-all active:scale-[0.98]">Book Online</a>
          </div>
        </div>
      )}
    </nav>
  )
}
