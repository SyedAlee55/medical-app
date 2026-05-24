'use client'

import { usePathname } from 'next/navigation'

export function PageTitle() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)

  if (parts.length === 0) return null

  // Capitalize and format path segments for a friendly title
  const title = parts
    .map(part => {
      // replace ID pattern or weird strings if any
      if (part.length > 20) return ''
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .filter(Boolean)
    .join(' \u203a ')

  return (
    <span className="font-semibold text-zinc-800 text-sm hidden sm:inline-block">
      {title}
    </span>
  )
}
