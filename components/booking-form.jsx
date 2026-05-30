'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { bookAppointment } from '@/app/appointments/actions'
import { getGlobalDateTimeLocalString } from '@/utils/time'

export default function BookingForm({ specialties, doctors }) {
    const [loading, setLoading] = useState(false)
    const [selectedSpecialty, setSelectedSpecialty] = useState("")
    const [selectedDoctor, setSelectedDoctor] = useState("")

    // Filter doctors based on selected specialty
    const filteredDoctors = doctors.filter(doc => doc.specialty_id === selectedSpecialty)

    async function handleSubmit(formData) {
        setLoading(true)

        // Note: bookAppointment returns a redirect on success, or redirect with error param
        // To handle errors properly via standard UI we can just await it since redirect throws
        try {
            await bookAppointment(formData)
        } catch (error) {
            // Next.js redirect throws an error, so we let it propagate if it's a redirect
            if (error?.message?.includes('NEXT_REDIRECT')) {
                throw error;
            }
            alert(error.message)
        }
        setLoading(false)
    }

    return (
        <Card className="bg-zinc-950/30 border border-white/6 backdrop-blur-2xl rounded-2xl shadow-xl text-white">
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-5">
                    {/* Specialty Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">1. Select Specialty</label>
                        <Select 
                            name="specialtyId" 
                            required 
                            onValueChange={(val) => {
                                setSelectedSpecialty(val)
                                setSelectedDoctor("") // Reset doctor when specialty changes
                            }}
                        >
                            <SelectTrigger className="w-full bg-white/5 border border-white/8 text-white rounded-xl h-11 px-3.5 focus:ring-2 focus:ring-brand-500/40 focus:border-transparent transition-all">
                                <SelectValue placeholder="Choose a department" className="text-zinc-500" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border border-white/8 text-white shadow-2xl rounded-xl">
                                {specialties.map((spec) => (
                                    <SelectItem key={spec.id} value={spec.id} className="text-zinc-300 hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg transition-colors cursor-pointer">
                                        {spec.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Doctor Selection (Dependent on Specialty) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">2. Select Doctor</label>
                        <Select 
                            name="doctorId" 
                            required 
                            disabled={!selectedSpecialty}
                            value={selectedDoctor}
                            onValueChange={setSelectedDoctor}
                        >
                            <SelectTrigger className="w-full bg-white/5 border border-white/8 text-white rounded-xl h-11 px-3.5 focus:ring-2 focus:ring-brand-500/40 focus:border-transparent transition-all disabled:opacity-40">
                                <SelectValue placeholder={selectedSpecialty ? "Choose a specialist" : "First, select a specialty"} className="text-zinc-500" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border border-white/8 text-white shadow-2xl rounded-xl">
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id} className="text-zinc-300 hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg transition-colors cursor-pointer">
                                            {doc.full_name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled className="text-zinc-500">No doctors found in this specialty</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Doctor Bio Preview */}
                    {selectedDoctor && (
                        <div className="p-4 bg-white/5 backdrop-blur-md border border-white/8 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                                About the Doctor
                            </h4>
                            <p className="text-sm text-zinc-350 italic">
                                {doctors.find(d => d.id === selectedDoctor)?.bio || "No biography available."}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2 flex flex-col">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">3. Appointment Date & Time</label>
                        <Input 
                            type="datetime-local" 
                            name="scheduledAt" 
                            required 
                            min={getGlobalDateTimeLocalString()} // Prevents selecting past dates in Pakistan standard time
                            className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-xl h-11 px-3.5 focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">4. Reason for Visit</label>
                        <Input 
                            name="reason" 
                            placeholder="e.g. Annual checkup" 
                            required 
                            className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-xl h-11 px-3.5 focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !selectedDoctor}
                        className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl h-11 text-sm shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 disabled:opacity-45 disabled:pointer-events-none cursor-pointer mt-4"
                    >
                        {loading ? "Booking..." : "Confirm Appointment"}
                    </button>
                </form>
            </CardContent>
        </Card>
    )
}