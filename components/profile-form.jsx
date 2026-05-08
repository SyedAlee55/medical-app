'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateProfile } from '@/app/profile/actions'
import { toast } from "sonner"
import { Loader2 } from 'lucide-react'

export default function ProfileForm({ profile, specialties, role }) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData) {
        setLoading(true)
        const result = await updateProfile(formData)
        
        if (result.success) {
            toast.success("Profile updated!", {
                description: "Your changes have been saved successfully."
            })
        } else {
            toast.error("Update failed", {
                description: result.error
            })
        }
        setLoading(false)
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
                <CardDescription>
                    Update your personal and professional information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    {/* Common Field: Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                            id="fullName" 
                            name="fullName" 
                            defaultValue={profile?.full_name} 
                            placeholder="Your full name" 
                            required 
                        />
                    </div>

                    {/* Patient Specific Fields */}
                    {role === 'patient' && (
                        <div className="space-y-2">
                            <Label htmlFor="medicalHistory">Medical History</Label>
                            <Textarea 
                                id="medicalHistory" 
                                name="medicalHistory" 
                                defaultValue={profile?.medical_history} 
                                placeholder="List any chronic conditions, allergies, or past surgeries..." 
                                className="min-h-[150px]"
                            />
                        </div>
                    )}

                    {/* Doctor Specific Fields */}
                    {role === 'doctor' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="specialtyId">Medical Specialty</Label>
                                <Select name="specialtyId" defaultValue={profile?.specialty_id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your field" />
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

                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea 
                                    id="bio" 
                                    name="bio" 
                                    defaultValue={profile?.bio} 
                                    placeholder="Briefly describe your experience and qualifications..." 
                                    className="min-h-[150px]"
                                />
                            </div>
                        </>
                    )}

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {loading ? "Saving Changes..." : "Update Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
