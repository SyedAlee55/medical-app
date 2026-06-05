import { Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'SI',
    name: 'Sabina Imran',
    role: 'Satisfied Patient',
    quote: "Dr Tj is serving the community with honesty, dedication, and compassion, where quality healthcare meets genuine care i repeat GENUINE care. He puts his heart and soul for overall wellbeing of a patient both physically and mentally. God bless you keep up the hard work.",
  },
  {
    initials: 'MM',
    name: 'Meli Mughal',
    role: 'Satisfied Patient',
    quote: "Today I visited Tj's Medical Hub for a checkup, and I had a really good experience there. The environment was clean and comfortable, and all the doctors were very kind and professional. Especially, the staff guided me very well and were extremely helpful and respectful. Overall, I am very satisfied with their service and highly appreciate the staff and doctors.",
  },
  {
    initials: 'NS',
    name: 'Neha Salman',
    role: 'Satisfied Patient',
    quote: 'Doctor Tajjammal is the best Doctor highly recommend. Excellent care and quick response from the medical team. The staff treated patients with kindness and respect. One of the best healthcare experiences I’ve had',
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
            Don&apos;t take our word for it, here&apos;s what patients and doctors say about Tj&apos;s Medical Hub.
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
                    <Star key={i} className="w-4 h-4 text-zinc-400 fill-zinc-400" />
                  ))}
                </div>
                <p className="text-zinc-400 italic text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300">{t.name}</h4>
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
