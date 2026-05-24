const institutions = [
  'General Hospital',
  'City Medical Center',
  'HealthFirst Clinic',
  'MedCore Institute',
  'National Health Network',
  'Sunrise Hospital',
  'CarePoint Medical',
  'Mercy Health Group',
]

export default function TrustStrip() {
  return (
    <div className="w-full bg-white py-8 border-y border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="type-label text-zinc-400 mb-6 text-center tracking-wider">
          TRUSTED BY HEALTHCARE INSTITUTIONS NATIONWIDE
        </p>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex gap-12 whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 shrink-0">
                {institutions.map((name, idx) => (
                  <div key={name + '-' + idx} className="flex items-center gap-12">
                    <span className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">
                      {name}
                    </span>
                    <span className="text-zinc-200">|</span>
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
