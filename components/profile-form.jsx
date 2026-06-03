'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/profile/actions'
import { toast } from "sonner"
import { Loader2 } from 'lucide-react'

export default function ProfileForm({ profile, specialties, role }) {
    const [isPending, startTransition] = useTransition()
    const loading = isPending

    function handleSubmit(formData) {
        startTransition(async () => {
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
        })
    }

    if (role === 'doctor' || role === 'staff') {
        // --- DOCTOR & STAFF MIDNIGHT-BLACK GLASSMORPHIC PROFILE FORM ---
        return (
            <div className="relative overflow-hidden bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 w-full max-w-xl mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
                {loading && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500/10 overflow-hidden z-50">
                        <div className="absolute top-0 bottom-0 left-0 bg-brand-500 animate-progress-linear" />
                    </div>
                )}
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Update Professional Profile</h2>
                    <p className="text-sm text-zinc-400 mt-1.5">
                        Keep your professional information and credentials up to date.
                    </p>
                </div>

                {/* Form */}
                <form action={handleSubmit} className="flex flex-col gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="full_name" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Full name <span className="text-red-400">*</span></label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            defaultValue={profile.full_name || ''}
                            required
                            className="w-full bg-white/5 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                        />
                    </div>

                    {/* Phone & Employee ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Phone number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={profile.phone || ''}
                                className="w-full bg-white/5 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="employee_id" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Employee ID</label>
                            <input
                                id="employee_id"
                                name="employee_id"
                                type="text"
                                defaultValue={profile.employee_id || ''}
                                placeholder="Your hospital-issued ID"
                                className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                            />
                        </div>
                    </div>

                    {/* Specialty & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="specialty_id" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Specialty</label>
                            <select
                                id="specialty_id"
                                name="specialty_id"
                                defaultValue={profile.specialty_id || ''}
                                className="w-full bg-zinc-900 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
                            >
                                <option value="" className="bg-zinc-950">Select a specialty</option>
                                {specialties?.map(s => (
                                    <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="department" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Department</label>
                            <input
                                id="department"
                                name="department"
                                type="text"
                                defaultValue={profile.department || ''}
                                placeholder="e.g. Cardiology"
                                className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                            />
                        </div>
                    </div>

                    {/* Professional Bio */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="bio" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Professional Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            defaultValue={profile.bio || ''}
                            placeholder="Brief professional background and qualifications..."
                            className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition min-h-[100px] resize-y"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 cursor-pointer mt-2 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? "Saving Changes..." : "Update Profile"}
                    </button>
                </form>
            </div>
        )
    }

    // --- PATIENT MIDNIGHT-BLACK GLASSMORPHIC STYLE FORM ---
    return (
        <div className="relative overflow-hidden bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 w-full max-w-xl mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
            {loading && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500/10 overflow-hidden z-50">
                    <div className="absolute top-0 bottom-0 left-0 bg-brand-500 animate-progress-linear" />
                </div>
            )}
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Update Personal Profile</h2>
                <p className="text-sm text-zinc-400 mt-1.5">
                    Keep your personal and medical information up to date to ensure proper care.
                </p>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="flex flex-col gap-5">
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="full_name" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Full Name</label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            defaultValue={profile.full_name || ''}
                            required
                            className="w-full bg-white/5 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={profile.phone || ''}
                            placeholder="e.g. +123456789"
                            className="w-full bg-white/5 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                        />
                    </div>
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="dob" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Date of Birth</label>
                        <input
                            id="dob"
                            name="dob"
                            type="date"
                            defaultValue={profile.date_of_birth ? profile.date_of_birth.substring(0, 10) : ''}
                            className="w-full bg-white/5 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="gender" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            defaultValue={profile.gender || ''}
                            className="w-full bg-zinc-900 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
                        >
                            <option value="" className="bg-zinc-950">Select...</option>
                            <option value="male" className="bg-zinc-950">Male</option>
                            <option value="female" className="bg-zinc-950">Female</option>
                            <option value="other" className="bg-zinc-950">Other</option>
                            <option value="prefer_not_to_say" className="bg-zinc-950">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                {/* Allergies */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="allergies" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Known Allergies</label>
                    <input
                        id="allergies"
                        name="allergies"
                        type="text"
                        defaultValue={profile.allergies || ''}
                        placeholder="e.g. Penicillin, Peanuts (or 'None')"
                        className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
                    />
                </div>

                {/* Medical History */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="history" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Medical History</label>
                    <textarea
                        id="history"
                        name="history"
                        defaultValue={profile.medical_history || ''}
                        placeholder="Briefly describe any past surgeries or chronic conditions..."
                        className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition min-h-[120px] resize-y"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 cursor-pointer mt-2 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Saving Changes..." : "Save Changes"}
                </button>
            </form>
        </div>
    )
}
