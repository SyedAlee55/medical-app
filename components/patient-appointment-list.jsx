'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Stethoscope } from 'lucide-react'

export default function PatientAppointmentList({ initialAppointments, userId }) {
    const [appointments, setAppointments] = useState(initialAppointments)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('patient-appointments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `patient_id=eq.${userId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // For inserts, we'd need to fetch the doctor's name, 
                        // but usually the patient just created this.
                        // For now, let's just refresh or add it.
                        window.location.reload() 
                    } else if (payload.eventType === 'UPDATE') {
                        setAppointments((prev) =>
                            prev.map(apt => apt.id === payload.new.id ? { ...apt, ...payload.new } : apt)
                        )
                    }
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [userId, supabase])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending Approval</Badge>
            case 'accepted':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Confirmed</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Declined</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (appointments.length === 0) {
        return (
            <div className="mt-10 p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No appointments yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                    Your upcoming consultations and medical history will appear here once booked.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 mt-8">
            {appointments.map((apt) => (
                <div key={apt.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                {getStatusBadge(apt.status)}
                                {apt.specialties?.name && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50">
                                        {apt.specialties.name}
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                <User className="h-5 w-5 text-blue-500" />
                                <span>Dr. {apt.profiles?.full_name || 'Assigned Specialist'}</span>
                            </div>

                            <div className="flex flex-col gap-1 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(apt.appointment_date), 'PPPP p')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    Reason: {apt.reason_for_visit}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
