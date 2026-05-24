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
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              isActive 
                ? 'bg-brand-50 text-brand-700' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{link.name}</span>
            </div>
            
            {link.badge > 0 && (
              <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )
}
