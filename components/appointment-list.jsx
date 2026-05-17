'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { respondToAppointment } from '@/app/appointments/actions'
import { Check, Trash2, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function AppointmentList({ initialAppointments, userId }) {
    const [appointments, setAppointments] = useState(initialAppointments)
    const [processingId, setProcessingId] = useState(null)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('doctor-appointments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `doctor_id=eq.${userId}`
                },
                (payload) => {
                    const now = new Date()
                    if (payload.eventType === 'INSERT') {
                        // Add if pending/confirmed AND in the future
                        const isFuture = new Date(payload.new.scheduled_at) >= now
                        if (['pending', 'confirmed'].includes(payload.new.status) && !payload.new.deleted_at && isFuture) {
                            setAppointments((prev) => [payload.new, ...prev])
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const isFuture = new Date(payload.new.scheduled_at) >= now
                        // Remove if rejected, deleted, cancelled, or past
                        if (['rejected', 'cancelled'].includes(payload.new.status) || payload.new.deleted_at || !isFuture) {
                            setAppointments((prev) => prev.filter(apt => apt.id !== payload.new.id))
                        } else {
                            setAppointments((prev) =>
                                prev.map(apt => apt.id === payload.new.id ? { ...apt, ...payload.new } : apt)
                            )
                        }
                    }
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [userId, supabase])

    return (
        <div className="space-y-4">
            {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Check className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No upcoming consultations</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm">
                        All set! New patient requests will appear here in real-time.
                    </p>
                </div>
            ) : (
                appointments.map((apt) => (
                    <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border rounded-xl shadow-sm gap-4 transition-all hover:border-blue-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <p className="font-bold text-slate-900 text-lg">
                                    {apt.profiles?.full_name || 'Patient'}
                                </p>
                                {apt.status === 'pending' ? (
                                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>
                                ) : (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Confirmed</Badge>
                                )}
                                {apt.specialties?.name && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
                                        {apt.specialties.name}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                                {format(new Date(apt.scheduled_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                            <div className="flex items-start gap-2 mt-2">
                                <Info className="h-4 w-4 text-slate-300 mt-0.5" />
                                <p className="text-sm text-slate-600 italic">
                                    {apt.reason_for_visit}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {apt.status === 'pending' && (
                                <form action={respondToAppointment}>
                                    <input type="hidden" name="appointmentId" value={apt.id} />
                                    <input type="hidden" name="status" value="confirmed" />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4"
                                        onClick={() => setProcessingId(apt.id)}
                                        disabled={!!processingId}
                                    >
                                        {processingId === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Accept
                                    </Button>
                                </form>
                            )}

                            <form action={respondToAppointment}>
                                <input type="hidden" name="appointmentId" value={apt.id} />
                                <input type="hidden" name="status" value="rejected" />
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                    className="border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2 px-4"
                                    onClick={() => {
                                        setProcessingId(apt.id)
                                        // Optimistic hide
                                        setAppointments(prev => prev.filter(a => a.id !== apt.id))
                                    }}
                                    disabled={!!processingId}
                                    title="Reject Appointment"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {apt.status === 'confirmed' ? 'Cancel' : 'Reject'}
                                </Button>
                            </form>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}