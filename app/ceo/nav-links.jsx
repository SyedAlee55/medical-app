'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  ClipboardList,
  BadgeCheck,
  ScrollText,
} from 'lucide-react'

const links = [
  { name: 'Dashboard',    href: '/ceo/dashboard',     icon: LayoutDashboard },
  { name: 'Users',        href: '/ceo/users',          icon: Users },
  { name: 'Patients',     href: '/ceo/patients',       icon: UserRound },
  { name: 'Appointments', href: '/ceo/appointments',   icon: CalendarDays },
  { name: 'Approvals',    href: '/ceo/approvals',      icon: ClipboardList },
  { name: 'Employee IDs', href: '/ceo/employee-ids',   icon: BadgeCheck },
  { name: 'Activity Logs',href: '/ceo/logs',           icon: ScrollText },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
        const Icon = link.icon
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{link.name}</span>
          </Link>
        )
      })}
    </>
  )
}
