import { Globe, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 text-white pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
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
            <a href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-400/30 flex items-center justify-center text-white font-bold shadow-[0_0_12px_rgba(6,148,162,0.1)] animate-coin-flip">
                <img src="/logo3.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Tj&apos;s Medical Hub</span>
            </a>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Modern healthcare, designed around people.
            </p>
            <div className="flex items-center gap-4 mt-1">
              <a href="#" aria-label="Website" className="text-zinc-600 hover:text-brand-400 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="mailto:support@tjsmedicalhub.com" aria-label="Email" className="text-zinc-600 hover:text-brand-400 transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" aria-label="Github" className="text-zinc-600 hover:text-brand-400 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">Product</p>
            <ul className="space-y-3">
              {[
                { label: 'Find a Doctor', href: '/login' },
                { label: 'Book Appointment', href: '/schedule' },
                { label: 'Patient Portal', href: '/login' },
                { label: 'Telemedicine', href: '/login' },
                { label: 'Pricing', href: '/schedule' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-zinc-500 hover:text-white text-sm transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <p className="type-label text-zinc-500 mb-4">Company</p>
            <ul className="space-y-2.5">
              <li>
                <a href="/about" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/team" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">Legal</p>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'HIPAA Compliance', href: '#' },
                { label: 'Cookie Policy', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-zinc-500 hover:text-white text-sm transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
          <span>&copy; {new Date().getFullYear()} Tj&apos;s Medical Hub. All rights reserved.</span>
          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>
    </footer>
  )
}
