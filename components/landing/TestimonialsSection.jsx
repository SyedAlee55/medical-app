import { Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'SM',
    name: 'Sarah M.',
    role: 'Patient since 2022',
    quote: "I booked a specialist appointment in under 3 minutes. No hold music, no forms to fax. I genuinely didn't know healthcare could feel this easy.",
  },
  {
    initials: 'KA',
    name: 'Dr. Khalid A.',
    role: 'Cardiologist',
    quote: "The doctor-side portal is the first system I've used that actually fits into my workflow rather than fighting it. My admin burden dropped by 40%.",
  },
  {
    initials: 'JT',
    name: 'James T.',
    role: 'Patient',
    quote: 'After moving cities, I was dreading finding a new GP. I had a verified doctor booked within the hour and my records transferred automatically. Remarkable.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-white bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-3">
            PATIENT STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Real people. Real results.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Don&apos;t take our word for it &mdash; here&apos;s what patients and doctors say about Tj&apos;s Medical Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-zinc-950/40 backdrop-blur-2xl rounded-3xl border border-white/6 p-6 hover:bg-black hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-white fill-white" />
                  ))}
                </div>
                <p className="text-zinc-350 italic text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-zinc-350 font-bold text-sm shrink-0 group-hover:bg-brand-500/10 group-hover:text-brand-300 transition-colors">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <p className="text-zinc-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
