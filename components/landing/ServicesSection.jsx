import { Calendar, UserCheck, Video, FileText, FolderOpen, MessageCircle } from 'lucide-react'

const services = [
  {
    icon: Calendar,
    title: 'Instant Appointment Booking',
    description: 'Search by specialty, location, and availability. Book a confirmed slot in under 2 minutes.',
  },
  {
    icon: UserCheck,
    title: 'Verified Doctor Profiles',
    description: 'Every doctor on our platform is license-verified, peer-reviewed, and rated by real patients.',
  },
  {
    icon: Video,
    title: 'Secure Telemedicine',
    description: 'Consult with your doctor from anywhere — encrypted, HIPAA-compliant video sessions, no app download required.',
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    description: 'Receive, manage, and refill prescriptions directly through your patient portal. No more pharmacy phone tag.',
  },
  {
    icon: FolderOpen,
    title: 'Shared Medical Records',
    description: 'Your complete health history, accessible to you and your care team — always current, always secure.',
  },
  {
    icon: MessageCircle,
    title: 'HIPAA-Compliant Messaging',
    description: 'Direct, secure messaging between patients and providers. No sensitive data in your email inbox.',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-3">
            WHAT WE OFFER
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Everything your health journey needs
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            From instant appointment booking to secure telemedicine and digital prescriptions &mdash; we&apos;ve built the tools that make modern healthcare actually work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, idx) => {
            const Icon = svc.icon
            return (
              <div
                key={idx}
                className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-6 hover:bg-black hover:border-brand-500/20 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 group-hover:bg-brand-500/10 group-hover:border-brand-400/20 transition-colors">
                  <Icon className="text-zinc-350 w-5 h-5 group-hover:text-brand-300 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-base mb-2">
                  {svc.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {svc.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
