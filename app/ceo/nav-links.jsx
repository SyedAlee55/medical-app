'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { name: 'Dashboard', href: '/ceo/dashboard' },
  { name: 'Users', href: '/ceo/users' },
  { name: 'Patients', href: '/ceo/patients' },
  { name: 'Appointments', href: '/ceo/appointments' },
  { name: 'Approvals', href: '/ceo/approvals' },
  { name: 'Employee IDs', href: '/ceo/employee-ids' },
  { name: 'Activity Logs', href: '/ceo/logs' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`block px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'font-medium border-l-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </>
  )
}
