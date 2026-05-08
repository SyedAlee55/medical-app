import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signout } from '../../login/actions' // Fixed import path after move
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Verify the user is authenticated on the server
    const { data: { user }, error } = await supabase.auth.getUser()

    // If no user is found, redirect them back to login
    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Medical Dashboard</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back, Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">
                            You are logged in as: <span className="font-mono text-blue-600">{user.email}</span>
                        </p>
                        <div className="mt-6 p-4 border border-dashed rounded-md bg-white">
                            <p className="text-sm text-slate-500 italic">
                                This is a protected route. Only authenticated staff can see this message.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}