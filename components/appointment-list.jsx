'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import { Check, X, Loader2 } from 'lucide-react'

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
                    if (payload.eventType === 'INSERT') {
                        setAppointments((prev) => [payload.new, ...prev])
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

    async function handleStatusUpdate(id, status) {
        setProcessingId(id)
        const result = await updateAppointmentStatus(id, status)
        if (result.error) {
            alert(result.error)
        }
        setProcessingId(null)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>
            case 'accepted':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Accepted</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (appointments.length === 0) {
        return <p className="text-slate-500 text-sm py-4">No appointments scheduled today.</p>
    }

    return (
        <div className="space-y-4">
            {appointments.map((apt) => (
                <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border rounded-xl shadow-sm gap-4">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <p className="font-bold text-slate-900 text-lg">
                                {apt.profiles?.full_name || 'New Patient'}
                            </p>
                            {getStatusBadge(apt.status)}
                            {apt.specialties?.name && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
                                    {apt.specialties.name}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            {format(new Date(apt.appointment_date), 'PPP p')}
                        </p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            <span className="font-semibold text-slate-400 mr-1">Reason:</span>
                            {apt.reason_for_visit}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                            <>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white gap-1"
                                    disabled={!!processingId}
                                    onClick={() => handleStatusUpdate(apt.id, 'accepted')}
                                >
                                    {processingId === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1"
                                    disabled={!!processingId}
                                    onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                                >
                                    {processingId === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                    Reject
                                </Button>
                            </>
                        )}
                        {apt.status !== 'pending' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400"
                                onClick={() => handleStatusUpdate(apt.id, 'pending')}
                                disabled={!!processingId}
                            >
                                Undo
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}