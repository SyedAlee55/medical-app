export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Create your health profile',
      body: 'Add your medical history, insurance, allergies, and preferences once. Your profile travels with you across every visit.',
    },
    {
      num: '02',
      title: 'Find and book your doctor',
      body: 'Filter by specialty, location, language, and real-time availability. Read verified reviews before you commit.',
    },
    {
      num: '03',
      title: 'Get care, stay connected',
      body: 'Attend your visit in-person or via telemedicine. Receive follow-up notes, prescriptions, and lab results directly in your portal.',
    },
  ]

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-3 mb-4">
            Up and running in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-400">
              three steps
            </span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            We removed every unnecessary step from the healthcare booking experience. Because your time matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-zinc-950/40 backdrop-blur-2xl rounded-3xl border border-white/6 p-8 flex flex-col items-center text-center hover:border-brand-500/20 hover:bg-black transition-all duration-300"
            >
              <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-white/5 mb-5 leading-none select-none">
                {step.num}
              </span>
              <h3 className="text-base font-semibold text-white mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
