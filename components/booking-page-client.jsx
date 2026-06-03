'use client'

import { useState, useTransition } from 'react'
import { Stethoscope, Sparkles, Scan, Activity, Droplet, AlertCircle, X, ChevronRight, Users, Siren, Loader2, Shield } from 'lucide-react'
import BookingInterface from '@/app/patient/book/BookingInterface'
import { bookAppointment } from '@/app/appointments/actions'
import { getGlobalDateTimeLocalString } from '@/utils/time'

const DEPARTMENTS = [
  {
    key: 'general',
    name: 'General Practices',
    description: 'Routine health checkups, primary care, preventative medicine, and general family health consultations.',
    icon: Stethoscope,
    colorClasses: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 hover:border-blue-500/30',
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/5 border-blue-500/10',
  },
  {
    key: 'dermatology',
    name: 'Dermatology',
    description: 'Diagnosis and treatment of skin, hair, and nail disorders, including acne, rashes, and skin cancer screenings.',
    icon: Sparkles,
    colorClasses: 'bg-gradient-to-br from-pink-500/10 to-rose-500/10 hover:border-pink-500/30',
    iconColor: 'text-pink-400',
    badgeBg: 'bg-pink-500/5 border-pink-500/10',
  },
  {
    key: 'radiology',
    name: 'Radiology',
    description: 'Imaging diagnostics: medical scans, X-rays, MRIs, and ultrasounds.',
    icon: Scan,
    colorClasses: 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 hover:border-cyan-500/30',
    iconColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/5 border-cyan-500/10',
  },
  {
    key: 'oncology',
    name: 'Oncology',
    description: 'Comprehensive cancer care, oncology consultations, diagnostics, and chemotherapy management.',
    icon: Activity,
    colorClasses: 'bg-gradient-to-br from-red-500/10 to-orange-500/10 hover:border-red-500/30',
    iconColor: 'text-red-400',
    badgeBg: 'bg-red-500/5 border-red-500/10',
  },
  {
    key: 'hematology',
    name: 'Hematology',
    description: 'Diagnosis and treatment of blood-related disorders, including anemia, clotting issues, and blood diagnostics.',
    icon: Droplet,
    colorClasses: 'bg-gradient-to-br from-purple-500/10 to-violet-500/10 hover:border-purple-500/30',
    iconColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/5 border-purple-500/10',
  },
  {
    key: 'emergency',
    name: 'Emergency',
    description: 'Immediate medical care for acute illnesses, severe injuries, and urgent medical needs.',
    icon: AlertCircle,
    colorClasses: 'bg-gradient-to-br from-amber-500/10 to-red-500/10 hover:border-red-500/30',
    iconColor: 'text-red-400',
    badgeBg: 'bg-red-500/5 border-red-500/10',
  }
]

// ── Emergency Request Form (standalone, no doctor selection) ─────────────────
function EmergencyRequestForm({ emergencyDoctors, onClose }) {
  const [isPending, startTransition] = useTransition()
  const [selectedDoctorId, setSelectedDoctorId] = useState(emergencyDoctors[0]?.id || '')
  const minDateTime = getGlobalDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000))

  const handleSubmit = (formData) => {
    startTransition(async () => {
      try {
        await bookAppointment(formData)
      } catch (err) {
        if (err && err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
          throw err
        }
      }
    })
  }

  return (
    <div className="border-t border-red-500/10 pt-5 mt-5 flex flex-col gap-4 animate-fade-in">
      {/* Info box */}
      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-red-300 mb-1">Admin-Reviewed Request</p>
          <p className="text-zinc-400 font-medium">
            Your emergency request will be sent directly to the admin team for priority review and assignment. 
            You will be contacted promptly once it is confirmed.
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="doctorId" value={selectedDoctorId} />
        <input type="hidden" name="durationMinutes" value="30" />

        {/* Doctor selector (only if multiple emergency doctors) */}
        {emergencyDoctors.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Available Emergency Physician
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full bg-white/5 border border-white/8 text-zinc-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition cursor-pointer"
            >
              {emergencyDoctors.map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-zinc-900">
                  Dr. {doc.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Preferred date & time <span className="text-red-400">*</span>
          </label>
          <input
            name="scheduledAt"
            type="datetime-local"
            min={minDateTime}
            required
            className="w-full bg-white/5 border border-white/8 text-zinc-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Describe your emergency <span className="text-red-400">*</span>
          </label>
          <textarea
            name="reason"
            rows={3}
            required
            maxLength={500}
            placeholder="Briefly describe your symptoms or the nature of the emergency..."
            className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition resize-none min-h-[100px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Additional notes (optional)
          </label>
          <input
            name="notes"
            type="text"
            maxLength={500}
            placeholder="Any other information (medical history, allergies, etc.)..."
            className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition"
          />
        </div>

        <div className="flex gap-3 mt-1">
          <button
            type="submit"
            disabled={isPending || !selectedDoctorId}
            className="flex-1 bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 hover:border-red-500/35 active:scale-[0.98] disabled:opacity-50 font-bold py-3 text-xs transition duration-200 cursor-pointer rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.07)]"
          >
            {isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              : <><Siren className="w-4 h-4" /> Submit Emergency Request</>
            }
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function BookingPageClient({ doctors }) {
  const [selectedDept, setSelectedDept] = useState(null)
  const [emergencyFormOpen, setEmergencyFormOpen] = useState(false)

  const matchCategory = (doctor, categoryKey) => {
    const specName = (doctor.specialty_name || '').toLowerCase().trim()
    const deptName = (doctor.department || '').toLowerCase().trim()

    switch (categoryKey) {
      case 'general':
        return specName === 'general practice' || specName === 'general practices' || deptName === 'general practice' || deptName === 'general practices'
      case 'dermatology':
        return specName === 'dermatology' || deptName === 'dermatology'
      case 'radiology':
        return specName === 'radiology' || deptName === 'radiology'
      case 'oncology':
        return specName === 'oncology' || deptName === 'oncology'
      case 'hematology':
        return specName === 'hematology' || specName === 'hemotology' || deptName === 'hematology' || deptName === 'hemotology'
      case 'emergency':
        return specName === 'emergency' || deptName === 'emergency'
      default:
        return false
    }
  }

  const getDoctorCount = (key) => doctors.filter(doc => matchCategory(doc, key)).length

  const filteredDoctors = selectedDept
    ? doctors.filter(doc => matchCategory(doc, selectedDept.key))
    : []

  const emergencyDoctors = doctors.filter(doc => matchCategory(doc, 'emergency'))

  return (
    <div className="space-y-8">
      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => {
          const count = getDoctorCount(dept.key)
          const IconComponent = dept.icon
          const isEmergency = dept.key === 'emergency'

          return (
            <div
              key={dept.key}
              onClick={() => {
                if (isEmergency) {
                  setSelectedDept(dept)
                  setEmergencyFormOpen(false)
                } else {
                  setSelectedDept(dept)
                }
              }}
              className={`bg-zinc-950/40 backdrop-blur-2xl rounded-2xl border border-white/6 p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group ${dept.colorClasses} ${isEmergency ? 'hover:border-red-500/40 ring-0 hover:ring-1 hover:ring-red-500/10' : ''}`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-white/10 ${dept.iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {isEmergency ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/15 text-red-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
                      Admin Reviewed
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-0.5 rounded-full">
                      {count} {count === 1 ? 'Doctor' : 'Doctors'} Available
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className={`text-lg font-bold text-white tracking-tight mb-2 transition-colors ${dept.iconColor.replace('text-', 'group-hover:text-')}`}>
                  {dept.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {dept.description}
                </p>
              </div>

              {/* CTA */}
              <div className={`mt-6 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 group-hover:text-white transition-colors`}>
                <span>{isEmergency ? 'Submit Emergency Request' : 'View Available Doctors'}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── MODAL for non-emergency departments ── */}
      {selectedDept && selectedDept.key !== 'emergency' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/12 rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl relative flex flex-col">

            {/* Sticky Header */}
            <div className="p-6 border-b border-white/10 sticky top-0 bg-zinc-950/95 backdrop-blur-xl z-10 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${selectedDept.iconColor}`}>
                    {(() => { const IC = selectedDept.icon; return <IC className="w-4 h-4" /> })()}
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {selectedDept.name} Doctors
                  </h2>
                </div>
                <p className="text-xs text-zinc-450 mt-1.5 leading-relaxed font-medium">
                  {selectedDept.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-12 bg-white/4 border border-white/6 rounded-2xl">
                  <Users className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 font-medium">
                    No doctors are currently available in this department.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredDoctors.map((doc) => (
                    <BookingInterface key={doc.id} doctor={doc} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 bg-white/5 border border-white/8 text-zinc-350 hover:bg-white/10 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL for Emergency ── */}
      {selectedDept && selectedDept.key === 'emergency' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-500/15 rounded-2xl max-w-xl w-full shadow-2xl shadow-red-500/5 relative flex flex-col max-h-[90vh]">

            {/* Animated top strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-t-2xl" />

            {/* Header */}
            <div className="p-6 border-b border-white/8 flex justify-between items-start gap-4 pt-7">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Siren className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Emergency Request</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1 leading-relaxed">
                    For life-threatening emergencies, call <span className="text-red-400 font-bold">115</span> immediately.
                    Use this form for urgent, non-life-threatening consultations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedDept(null); setEmergencyFormOpen(false) }}
                className="text-zinc-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {emergencyDoctors.length === 0 ? (
                <div className="text-center py-12 bg-white/4 border border-white/6 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400 font-medium">
                    No emergency physicians are currently on call.
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Please contact the clinic directly or call emergency services.
                  </p>
                </div>
              ) : (
                <>
                  {!emergencyFormOpen ? (
                    <div className="space-y-5">
                      {/* Available physicians list */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                          On-call Emergency Physicians ({emergencyDoctors.length})
                        </p>
                        <div className="space-y-2">
                          {emergencyDoctors.map((doc) => (
                            <div key={doc.id} className="bg-white/4 border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-white">Dr. {doc.full_name}</p>
                                {doc.bio && (
                                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{doc.bio}</p>
                                )}
                              </div>
                              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                                Available
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEmergencyFormOpen(true)}
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 hover:border-red-500/35 font-bold py-3 text-sm transition duration-200 cursor-pointer rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.07)] active:scale-[0.98]"
                      >
                        <Siren className="w-5 h-5" />
                        Request Emergency Consultation
                      </button>
                    </div>
                  ) : (
                    <EmergencyRequestForm
                      emergencyDoctors={emergencyDoctors}
                      onClose={() => setEmergencyFormOpen(false)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
