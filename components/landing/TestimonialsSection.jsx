import { Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'SM',
    name: 'Sarah M.',
    role: 'Patient since 2022',
    quote: 'I booked a specialist appointment in under 3 minutes. No hold music, no forms to fax. I genuinely didn\'t know healthcare could feel this easy.',
  },
  {
    initials: 'KA',
    name: 'Dr. Khalid A.',
    role: 'Cardiologist',
    quote: 'The doctor-side portal is the first system I\'ve used that actually fits into my workflow rather than fighting it. My admin burden dropped by 40%.',
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
    <section className="bg-white py-24 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="type-label text-brand-600 tracking-wider">
            PATIENT STORIES
          </span>
          <h2 className="type-h2 mt-2 mb-4 text-zinc-900">
            Real people. Real results.
          </h2>
          <p className="type-body text-zinc-500 max-w-2xl mx-auto text-center text-sm md:text-base">
            Don&apos;t take our word for it &mdash; here&apos;s what patients and doctors say about Tj&apos;s Medical Hub.
          </p>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Stars Row */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent-500 fill-accent-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="type-body text-zinc-600 italic mt-4 mb-6 text-sm md:text-base leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">
                    {t.name}
                  </h4>
                  <p className="type-meta text-zinc-500 text-xs">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
