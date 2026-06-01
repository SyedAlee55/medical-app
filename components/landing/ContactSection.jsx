"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Sparkles, ChevronDown } from 'lucide-react'

export default function ContactSection() {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I book a consultation?",
      answer: "You can book an appointment online by clicking the 'Book an Appointment' button in the Hero section, or by calling our Landline number (051 6108351) directly during clinical hours."
    },
    {
      question: "What are the timing details for OPD and Emergency?",
      answer: "Our routine OPD/Specialist hours are Monday to Sunday from 10:00 AM to 12:00 AM. However, our Emergency Retention Wards are open 24/7."
    },
    {
      question: "How do I receive my diagnostic reports?",
      answer: "Once our clinical lab or ultrasound specialists upload your reports, they will be instantly available in your digital patient dashboard under 'Medical Records'."
    },
    {
      question: "Is there parking or accessibility available?",
      answer: "Yes. Plaza 180 has dedicated front parking spots and is fully wheelchair-accessible with ramps leading straight to the lobby entrance."
    }
  ]

  return (
    <section id="contact" className="relative py-24 bg-black overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider text-zinc-400 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-450" />
            SUPPORT & CONTACT
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mt-2">
            Get in touch with Tj&apos;s Medical Hub
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed mt-3">
            Reach out via WhatsApp or phone call directly, or browse through our frequently asked questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Contact details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Contact Information</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We are committed to delivering seamless primary, specialty, and urgent healthcare services. Reach out to our front desk anytime.
              </p>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp direct */}
              <a
                href="https://wa.me/923331682726"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-850 rounded-2xl p-4 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.25.003 9.522-4.264 9.525-9.518.002-2.546-.988-4.941-2.79-6.742a9.49 9.49 0 0 0-6.744-2.738c-5.259 0-9.527 4.263-9.53 9.519-.001 1.578.43 3.111 1.247 4.478L1.517 21.4l5.13-1.346zm11.905-6.19c-.3-.149-1.774-.875-2.049-.976-.275-.1-.475-.149-.675.15-.2.299-.775.976-.95 1.174-.175.199-.35.224-.65.075-2.435-1.217-4.013-3.037-4.745-4.297-.199-.34-.02-.524.15-.694.154-.153.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.675-1.626-.925-2.225-.244-.589-.493-.51-.675-.519-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.299-1.05 1.024-1.05 2.5 0 1.472 1.075 2.893 1.225 3.092.15.199 2.115 3.23 5.124 4.532.715.31 1.273.495 1.708.634.718.228 1.37.196 1.887.119.577-.087 1.774-.724 2.024-1.422.25-.699.25-1.299.175-1.422-.075-.125-.275-.2-.575-.35z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">WhatsApp Link</p>
                  <h4 className="text-sm font-semibold text-zinc-200 mt-0.5">Chat Directly</h4>
                </div>
              </a>

              {/* Landline direct */}
              <a
                href="tel:0516108351"
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-850 rounded-2xl p-4 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Landline Number</p>
                  <h4 className="text-sm font-semibold text-zinc-200 mt-0.5">051 6108351</h4>
                </div>
              </a>
            </div>

            <div className="space-y-6 pt-4">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-white text-sm">Location Address</h5>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    Plaza 180, Block D Civic Centre, Bahria Town Phase 4,<br />
                    Next to Bank Of Punjab, Rawalpindi, Pakistan
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-white text-sm">Email Address</h5>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
                    tjmedicalhub1@gmail.com
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-white text-sm">Clinical Hours</h5>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    Monday — Sunday: 10:00 AM – 12:00 AM <br />
                    Emergency Retention Wards: 24/7 Open
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: FAQ Accordion Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
              <p className="text-zinc-400 text-sm mt-1">Quick answers to clear your doubts about consultations and facilities.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    onClick={() => toggleFaq(index)}
                    className={`bg-zinc-900/90 border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                      isOpen ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)] bg-zinc-850' : 'border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* FAQ Header */}
                    <div className="flex items-center justify-between p-5 select-none">
                      <h4 className={`text-sm font-semibold transition-colors duration-200 ${isOpen ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {faq.question}
                      </h4>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-450 transition-transform duration-300 shrink-0 ml-4 ${
                          isOpen ? 'rotate-180 text-emerald-400' : ''
                        }`}
                      />
                    </div>

                    {/* FAQ Answer with AnimatePresence */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
