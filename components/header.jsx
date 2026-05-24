import React from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'
import { PageTitle } from './page-title-client'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initials = 'U'
  if (user && user.email) {
    initials = user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-zinc-900 text-lg tracking-tight">Tj&apos;s Medical Hub</span>
        </Link>

        {/* Page Title (passed or resolved from path) */}
        <span className="text-zinc-300 hidden sm:inline">|</span>
        <PageTitle />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Search Input (Desktop) */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-full hover:bg-zinc-50 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
            </button>

            {/* User Avatar Dropdown */}
            <details className="relative group">
              <summary className="list-none cursor-pointer flex items-center focus:outline-none">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm flex items-center justify-center hover:bg-brand-200 transition-colors">
                  {initials}
                </div>
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-zinc-50">
                  <p className="text-xs text-zinc-400 truncate">Signed in as</p>
                  <p className="text-xs font-medium text-zinc-800 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                >
                  Settings
                </Link>
                <div className="border-t border-zinc-100 my-1.5" />
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </details>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/schedule"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2 text-xs transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98]"
            >
              Book Appointment
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
