"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChevronUp, X } from 'lucide-react'

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {/* WhatsApp Option */}
            <a
              href="https://wa.me/923331682726"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-850 px-4 py-3 rounded-2xl text-white transition-all duration-200 shadow-xl group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.25.003 9.522-4.264 9.525-9.518.002-2.546-.988-4.941-2.79-6.742a9.49 9.49 0 0 0-6.744-2.738c-5.259 0-9.527 4.263-9.53 9.519-.001 1.578.43 3.111 1.247 4.478L1.517 21.4l5.13-1.346zm11.905-6.19c-.3-.149-1.774-.875-2.049-.976-.275-.1-.475-.149-.675.15-.2.299-.775.976-.95 1.174-.175.199-.35.224-.65.075-2.435-1.217-4.013-3.037-4.745-4.297-.199-.34-.02-.524.15-.694.154-.153.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.675-1.626-.925-2.225-.244-.589-.493-.51-.675-.519-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.299-1.05 1.024-1.05 2.5 0 1.472 1.075 2.893 1.225 3.092.15.199 2.115 3.23 5.124 4.532.715.31 1.273.495 1.708.634.718.228 1.37.196 1.887.119.577-.087 1.774-.724 2.024-1.422.25-.699.25-1.299.175-1.422-.075-.125-.275-.2-.575-.35z" />
                </svg>
              </div>
              <div className="text-left pr-1.5">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">WhatsApp Chat</p>
                <p className="text-xs font-semibold text-zinc-200 mt-0.5">Connect Instantly</p>
              </div>
            </a>

            {/* Landline Option */}
            <a
              href="tel:0516108351"
              className="flex items-center gap-3.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-850 px-4 py-3 rounded-2xl text-white transition-all duration-200 shadow-xl group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left pr-1.5">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Landline Phone</p>
                <p className="text-xs font-semibold text-zinc-200 mt-0.5">051 6108351</p>
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white rounded-full px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-250 active:scale-95 group relative z-10 cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-zinc-100 transition-colors">
          Contact Now
        </span>
        {isOpen ? (
          <X className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
        ) : (
          <ChevronUp className="w-4 h-4 text-zinc-400 group-hover:translate-y-[-1px] group-hover:text-zinc-200 transition-all" />
        )}
      </button>
    </div>
  )
}
