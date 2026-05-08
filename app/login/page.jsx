import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleSelector } from "./role-selector"

export default async function LoginPage({ searchParams }) {
    const params = await searchParams;
    const errorMessage = params?.error;

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50">
            <Card className="mx-auto max-w-sm border-t-4 border-t-blue-600 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800 text-center">Tj's Medical Hub</CardTitle>
                    <CardDescription className="text-center">
                        Join our secure medical network.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        {errorMessage && (
                            <div className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {errorMessage}
                            </div>
                        )}

                        {/* Role Selection - Important for your DB trigger */}
                        <div className="grid gap-2">
                            <Label>I am a...</Label>
                            <RoleSelector />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" placeholder="Dr. John Doe" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        <div className="flex flex-col gap-2 pt-4">
                            <Button formAction={login} className="w-full bg-blue-600 hover:bg-blue-700">
                                Log in
                            </Button>
                            <Button formAction={signup} variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                Create Account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}