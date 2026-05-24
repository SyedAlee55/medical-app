export default function CtaSection() {
  return (
    <div className="w-full">
      {/* Part A — Provider callout strip */}
      <div className="bg-brand-50 border-y border-brand-100 py-10">
        <div className="max-w-5xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="type-h3 text-brand-900 mb-1">
              Are you a healthcare provider?
            </h3>
            <p className="type-body text-brand-700 text-sm max-w-xl leading-relaxed">
              Join 500+ doctors already using Tj&apos;s Medical Hub to manage their practice &mdash; from scheduling to prescriptions.
            </p>
          </div>
          <div>
            <a
              href="/login"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-6 py-3 text-center text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] inline-block whitespace-nowrap"
            >
              Join as a Doctor &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Part B — Final CTA */}
      <div className="bg-[#0a1628] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-900/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-900/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="type-h2 text-white text-center mb-3">
            Your health journey starts today.
          </h2>
          <p className="text-zinc-400 text-center max-w-xl mx-auto mt-3 mb-8 text-sm md:text-base leading-relaxed">
            Join thousands of patients who manage their entire healthcare experience in one place &mdash; bookings, records, prescriptions, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/login"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-6 py-3 text-center text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98]"
            >
              Get Started Free
            </a>
            <a
              href="#services"
              className="w-full sm:w-auto border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white font-semibold rounded-lg px-6 py-3 text-center text-sm transition-all duration-200"
            >
              Talk to our team
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
