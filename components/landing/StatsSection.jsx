import { Users, HeartPulse, Star, Zap } from 'lucide-react'

const stats = [
  {
    value: '500+',
    label: 'Verified Doctors',
    icon: Users,
  },
  {
    value: '50,000+',
    label: 'Patients Served',
    icon: HeartPulse,
  },
  {
    value: '98%',
    label: 'Patient Satisfaction',
    icon: Star,
  },
  {
    value: '< 2 min',
    label: 'Average Booking Time',
    icon: Zap,
  },
]

export default function StatsSection() {
  return (
    <section className="w-full bg-zinc-950 border-y border-white/5">
      {/* Full-bleed grid — no max-width, no padding, no rounded corners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-black flex flex-col items-center text-center px-8 py-12 hover:bg-zinc-950 transition-colors duration-300 group"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-5 group-hover:bg-brand-500/10 transition-colors">
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-brand-300 transition-colors" />
              </div>

              {/* Value */}
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-400 tracking-tight leading-none">
                {stat.value}
              </span>

              {/* Label */}
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-3">
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
