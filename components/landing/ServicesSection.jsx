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
    <section id="services" className="bg-white py-24 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="type-label text-brand-600 tracking-wider">
            WHAT WE OFFER
          </span>
          <h2 className="type-h2 mt-2 mb-4 text-zinc-900">
            Everything your health journey needs
          </h2>
          <p className="type-body text-zinc-500 max-w-2xl mx-auto text-center text-sm md:text-base">
            From instant appointment booking to secure telemedicine and digital prescriptions &mdash; we&apos;ve built the tools that make modern healthcare actually work.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, idx) => {
            const Icon = svc.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-zinc-100 p-6 hover:shadow-lg hover:border-zinc-200 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4 transition-colors group-hover:bg-brand-100">
                  <Icon className="text-brand-600 w-5 h-5" />
                </div>
                <h3 className="type-h3 mb-2 text-zinc-900 group-hover:text-brand-600 transition-colors">
                  {svc.title}
                </h3>
                <p className="type-body text-zinc-500 text-sm leading-relaxed">
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
