'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, Stethoscope, CalendarDays, Settings } from 'lucide-react'

export default function NavLinks({ pendingCount = 0, pendingApptsCount = 0 }) {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard (Overview)', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Application Reviews', href: '/admin/approvals', icon: ClipboardList, badge: pendingCount },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Doctors & Staff', href: '/admin/staff', icon: Stethoscope },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays, badge: pendingApptsCount },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
        const Icon = link.icon
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-4 h-4" />}
              {link.name}
            </div>
            
            {link.badge > 0 && (
              <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )
}
