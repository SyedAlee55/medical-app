'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, Stethoscope, CalendarDays, AlertCircle, BadgeCheck, ScrollText } from 'lucide-react'

export default function NavLinks({ pendingCount = 0, pendingApptsCount = 0, pendingEmergenciesCount = 0, pendingEmployeeIdsCount = 0 }) {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard (Overview)', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Application Reviews', href: '/admin/approvals', icon: ClipboardList, badge: pendingCount },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Doctors & Staff', href: '/admin/staff', icon: Stethoscope },
    { name: 'Employee IDs', href: '/admin/employee-ids', icon: BadgeCheck, badge: pendingEmployeeIdsCount },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarDays, badge: pendingApptsCount },
    { name: 'Emergency Requests', href: '/admin/emergencies', icon: AlertCircle, badge: pendingEmergenciesCount },
    { name: 'Activity Logs', href: '/admin/logs', icon: ScrollText },
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
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
              isActive 
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/25' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{link.name}</span>
            </div>
            
            {link.badge > 0 && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )
}
