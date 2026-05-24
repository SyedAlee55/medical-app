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
    <section className="bg-[#f8faff] py-24 border-b border-zinc-100 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="type-label text-brand-600 tracking-wider">
            HOW IT WORKS
          </span>
          <h2 className="type-h2 mt-2 mb-4 text-zinc-900">
            Up and running in three steps
          </h2>
          <p className="type-body text-zinc-500 max-w-2xl mx-auto text-center text-sm md:text-base">
            We removed every unnecessary step from the healthcare booking experience. Because your time matters.
          </p>
        </div>

        {/* 3-Column Step Layout */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 z-10">
          {/* Dashed connector line */}
          <div className="hidden md:block absolute top-6 left-[16%] right-[16%] border-t-2 border-dashed border-brand-200 -z-10" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-start bg-transparent">
              <span className="text-5xl font-extrabold text-brand-200 mb-4 block leading-none select-none">
                {step.num}
              </span>
              <h3 className="type-h3 text-zinc-900 mb-2">
                {step.title}
              </h3>
              <p className="type-body text-zinc-500 text-sm leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
