import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updatePatientProfile } from './actions'

export default async function PatientOnboardingPage({ searchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')



    const params = await searchParams
    const hasError = params?.error === 'save_failed'

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-blue-900">Complete Your Medical Profile</CardTitle>
                    <CardDescription>
                        This information helps our doctors provide the best care possible.
                        All data is encrypted and secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasError && (
                        <div className="mb-4 p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md animate-in fade-in duration-300">
                            Something went wrong saving your profile. Please try again.
                        </div>
                    )}
                    <form action={updatePatientProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" name="dob" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select 
                                    id="gender"
                                    name="gender" 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allergies">Known Allergies</Label>
                            <Input id="allergies" name="allergies" placeholder="e.g. Penicillin, Peanuts (or 'None')" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="history">Medical History</Label>
                            <Textarea
                                id="history"
                                name="history"
                                placeholder="Briefly describe any past surgeries or chronic conditions..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                            Finish Setup & Enter Dashboard
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}