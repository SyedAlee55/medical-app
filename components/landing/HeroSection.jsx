"use client"

import { motion } from 'framer-motion'
import { PlayCircle, ArrowRight, ShieldCheck, Calendar, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

const cardFloatVariants = {
  animate: {
    y: [0, -15, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
}

const badgeFloatVariants = {
  animate: {
    y: [0, 10, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
}

export default function HeroSection() {
  const handleCtaClick = () => { window.location.href = "/schedule" }
  const handleSecondaryCtaClick = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    /* No rounded-3xl here — the page.jsx wrapper provides it */
    <section className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden bg-zinc-950">

      {/* Background medical image + gradient overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/92 via-zinc-950/78 to-zinc-900/65" />
      </div>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ─── LEFT: Copy ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start lg:col-span-7"
          >
            {/* Live-dot badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/12 px-3 py-1.5 rounded-full mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-brand-300 uppercase">
                TRUSTED BY 500+ PATIENTS
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-6"
            >
              Modern healthcare,{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-teal-300 to-emerald-400">
                finally built around you
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-zinc-300/85 text-base sm:text-lg max-w-xl leading-relaxed mb-8"
            >
              At TJ's Medical Hub, we deliver safe, reliable and compassionate care, focused on accurate diagnosis, modern treatment and making every patient feel respected and valued. Book an appointment with verified top-rated doctors now!
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
              <Button
                onClick={handleCtaClick}
                className="bg-brand-500/20 backdrop-blur-md border border-brand-400/35 text-white hover:bg-brand-500/40 hover:border-brand-400/55 transition-all duration-300 font-semibold rounded-2xl px-7 py-6 text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(6,148,162,0.2)] active:scale-[0.98] group cursor-pointer"
              >
                Book an Appointment
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                onClick={handleSecondaryCtaClick}
                className="bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/15 transition-all duration-300 font-semibold rounded-2xl px-7 py-6 text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-zinc-300" />
                See how it works
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 border-t border-white/5 pt-6 w-full max-w-lg"
            >
              <div className="flex -space-x-2">
                {[
                  'bg-brand-500/40 text-brand-300',
                  'bg-emerald-500/40 text-emerald-300',
                  'bg-indigo-500/40 text-indigo-300',
                  'bg-teal-500/40 text-teal-300',
                  'bg-blue-500/40 text-blue-300',
                ].map((cls, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-9 rounded-full border border-white/15 flex items-center justify-center font-bold text-xs backdrop-blur-sm ${cls}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Join{' '}
                <strong className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-400">
                  500+ patients
                </strong>
                {' already managing their care here'}
              </p>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT: Floating glassmorphic card stack ─── */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[450px]">
            {/* Ambient aura */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-brand-500/20 to-emerald-500/20 blur-3xl" />

            {/* Main appointment card */}
            <motion.div
              variants={cardFloatVariants}
              animate="animate"
              className="w-full max-w-sm bg-white/8 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/15 p-6 flex flex-col gap-5 text-white z-10"
            >
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Your next appointment
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500/30 to-brand-400/40 border border-brand-400/30 flex items-center justify-center text-brand-200 font-bold text-sm shadow-[0_0_15px_rgba(6,148,162,0.25)]">
                  DR
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm tracking-wide">Dr. Tajammal Gauhar</h4>
                  <p className="text-xs text-zinc-300">Medical Director</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-200">Tomorrow, May 27</span>
                <span className="bg-brand-500/20 border border-brand-400/30 px-2 py-0.5 rounded-lg text-brand-300">
                  10:30 AM (EST)
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-zinc-300 font-medium">
                  <span>Onboarding Progress</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-400 font-bold">66% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full w-2/3 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
              </div>

              <div className="border-t border-white/8" />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Satisfaction</p>
                  <p className="text-xs font-bold text-brand-300 mt-1 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-brand-300 text-brand-300" />
                    98% Rated
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Booking Time</p>
                  <p className="text-xs font-bold text-emerald-300 mt-1">&lt; 2 min</p>
                </div>
              </div>
            </motion.div>

            {/* HIPAA badge — bottom left */}
            <motion.div
              variants={badgeFloatVariants}
              animate="animate"
              className="absolute -bottom-4 -left-4 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xl z-20 max-w-[200px]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Security</p>
                <p className="text-xs text-white font-semibold">Fully Encrypted</p>
              </div>
            </motion.div>

            {/* Instant booking badge — top right */}
            <motion.div
              variants={cardFloatVariants}
              animate="animate"
              className="absolute -top-4 -right-4 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xl z-20 max-w-[200px]"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-500/15 flex items-center justify-center border border-brand-500/25">
                <Calendar className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Convenience</p>
                <p className="text-xs text-white font-semibold">Instant Booking</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
