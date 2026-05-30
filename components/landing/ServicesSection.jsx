import { Stethoscope, CalendarCheck, BedDouble, Activity, HeartPulse, Microscope } from 'lucide-react'

const services = [
  {
    icon: Stethoscope,
    title: 'Emergency checkups',
    description: 'Our team quickly evaluates and manage urgent health issues with care. Your safety is our top priority when every second counts.',
  },
  {
    icon: CalendarCheck,
    title: 'Routine OPD',
    description: 'Regular doctor consultations, checkups, and preventative care tailored to you. Our team is here to keep you healthy and answer any questions you have.',
  },
  {
    icon: BedDouble,
    title: 'Emergency Retention',
    description: "Our retention service keeps you safe. We monitor your vitals and recovery in a comfortable setting until you are ready to head home.",
  },
  {
    icon: Activity,
    title: 'Ultrasound & ECG',
    description: "Modern equipment to check your internal organs and heart activity accurately. These quick tests help our doctors find the right treatment plan for you.",
  },
  {
    icon: HeartPulse,
    title: 'Cardiac Monitoring',
    description: "We track your heart's rhythm to spot any irregularities early and prevent serious issues. Our specialized team watches over your heart health to give you complete peace of mind.",
  },
  {
    icon: Microscope,
    title: 'Advanced Blood Diagnostics',
    description: " From routine blood work to complex tests with fast, reliable results. We give your doctor the exact data they need to guide your recovery.",
  }

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
            Everything your {' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-teal-300 to-emerald-400">
              health journey needs
            </span>

          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            From instant online appointment booking to secure profile creation, we&apos;ve built the tools that make modern healthcare actually work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, idx) => {
            const Icon = svc.icon
            return (
              <div
                key={idx}
                className="bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-6 hover:bg-black hover:border-zinc-700 hover:shadow-[0_10px_40px_rgba(6,148,162,0.04)] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 group-hover:bg-zinc-950 group-hover:border-zinc-400/20 transition-colors">
                  <Icon className="text-zinc-350 w-5 h-5 group-hover:text-white  transition-colors" />
                </div>
                <h3 className="font-semibold text-zinc-300 text-base mb-2">
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
