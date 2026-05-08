import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/login/actions'

export default async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md py-3 z-50 supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span className="text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                        Tj's <span className="text-slate-900 dark:text-slate-50">Medical Hub</span>
                    </span>
                </Link>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden md:inline text-sm text-muted-foreground">
                                {user.email}
                            </span>
                            <form action={signout}>
                                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400">
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </Link>
                            <Link href="/login">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
