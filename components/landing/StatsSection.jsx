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
    <section className="w-full rounded-md bg-zinc-950 border-y border-white/5 px-8">
      {/* Full-bleed grid — no max-width, no padding, no rounded corners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-zinc-900 flex flex-col items-center text-center px-8 py-12 transition-colors duration-300 group"
            >

              {/* Value */}
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-100 tracking-tight leading-none">
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
