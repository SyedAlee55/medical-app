const stats = [
  { value: '500+', label: 'Verified Doctors' },
  { value: '50,000+', label: 'Patients Served' },
  { value: '98%', label: 'Patient Satisfaction' },
  { value: '< 2 min', label: 'Average Booking Time' },
]

export default function StatsSection() {
  return (
    <section className="bg-brand-600 py-16 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:px-8 py-4 ${
                idx < stats.length - 1 ? 'lg:border-r lg:border-brand-500/50' : ''
              }`}
            >
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="type-label text-brand-200 mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
