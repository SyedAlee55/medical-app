const institutions = [
  'Emergency checkups',
  'Routine OPD',
  'Emergency Retention',
  'Ultrasound & ECG',
  'Cardiac Monitoring',
  'Advanced Blood Diagnostics'
]

export default function TrustStrip() {
  return (
    <div className="w-full bg-black py-8">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[12px] font-semibold tracking-widest uppercase text-zinc-400 mb-6 text-center">
          Services Trusted By Healthcare Institutions
        </p>
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <div className="animate-marquee flex gap-10 whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 shrink-0">
                {institutions.map((name, idx) => (
                  <div key={name + '-' + idx} className="flex items-center gap-10">
                    <span className="text-zinc-400 font-semibold text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors cursor-default">
                      {name}
                    </span>
                    <span className="text-white/6 select-none">·</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
