'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAppointment } from '@/app/patient/dashboard/book/actions'

export default function BookingForm({ specialties, doctors }) {
    const [loading, setLoading] = useState(false)
    const [selectedSpecialty, setSelectedSpecialty] = useState("")
    const [selectedDoctor, setSelectedDoctor] = useState("")

    // Filter doctors based on selected specialty
    const filteredDoctors = doctors.filter(doc => doc.specialty_id === selectedSpecialty)

    async function handleSubmit(formData) {
        setLoading(true)
        const result = await createAppointment(formData)
        if (result?.error) {
            alert(result.error)
        }
        setLoading(false)
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-4">
                    {/* Specialty Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">1. Select Specialty</label>
                        <Select 
                            name="specialty_id" 
                            required 
                            onValueChange={(val) => {
                                setSelectedSpecialty(val)
                                setSelectedDoctor("") // Reset doctor when specialty changes
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a department" />
                            </SelectTrigger>
                            <SelectContent>
                                {specialties.map((spec) => (
                                    <SelectItem key={spec.id} value={spec.id}>
                                        {spec.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Doctor Selection (Dependent on Specialty) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">2. Select Doctor</label>
                        <Select 
                            name="doctor_id" 
                            required 
                            disabled={!selectedSpecialty}
                            value={selectedDoctor}
                            onValueChange={setSelectedDoctor}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedSpecialty ? "Choose a specialist" : "First, select a specialty"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            {doc.full_name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>No doctors found in this specialty</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Doctor Bio Preview */}
                    {selectedDoctor && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                                About the Doctor
                            </h4>
                            <p className="text-sm text-slate-700 italic">
                                {doctors.find(d => d.id === selectedDoctor)?.bio || "No biography available."}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">3. Appointment Date & Time</label>
                        <Input type="datetime-local" name="date" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">4. Reason for Visit</label>
                        <Input name="reason" placeholder="e.g. Annual checkup" required />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !selectedDoctor}>
                        {loading ? "Booking..." : "Confirm Appointment"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}