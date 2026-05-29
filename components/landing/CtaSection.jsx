export default function CtaSection() {
  return (
    <div className="w-full bg-black">

      {/* Part A — Provider callout strip */}
      <div className="bg-zinc-950/40 backdrop-blur-2xl border border-white/5 py-10 mx-6 lg:mx-12 rounded-3xl my-6">
        <div className="max-w-5xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-white mb-1">
              Are you a healthcare provider?
            </h3>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Join 50+ doctors already using Tj&apos;s Medical Hub to manage their practice, from scheduling to prescriptions.
            </p>
          </div>
          <div>
            <a
              href="/login"
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-brand-500/15 hover:border-brand-400/25 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-300 active:scale-[0.98] inline-block whitespace-nowrap"
            >
              Join as a Doctor &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Part B — Final CTA */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-500/6 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider text-zinc-350 uppercase mb-6">
            Start for free today
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4">
            <span className="text-white">Your health journey </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-400">
              starts today.
            </span>
          </h2>
          <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10 text-sm md:text-base leading-relaxed">
            Join thousands of patients who manage their entire healthcare experience in one place, bookings, records, prescriptions, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/login"
              className="w-full sm:w-auto bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl px-8 py-3.5 text-center text-sm transition-all duration-300 shadow-[0_8px_30px_rgba(6,148,162,0.06)] active:scale-[0.98]"
            >
              Get Started Free
            </a>
            <a
              href="#services"
              className="w-full sm:w-auto bg-white/4 border border-white/8 text-zinc-300 hover:text-white hover:bg-white/8 font-semibold rounded-xl px-8 py-3.5 text-center text-sm transition-all duration-300 active:scale-[0.98]"
            >
              Talk to our team
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
