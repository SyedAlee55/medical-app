'use client'

import { usePathname } from 'next/navigation'

/**
 * LayoutShell — conditionally renders the global Header, padded main wrapper,
 * and site footer based on the current route.
 *
 * The landing page (/) has its own Navbar, layout, and footer, so we bypass
 * the global shell entirely for that route to avoid:
 *   - Nested <main> elements (invalid HTML → hydration mismatch)
 *   - Double header/footer rendering
 *
 * Server Components (e.g. <Header />) are passed as props so this client
 * component never imports server-only code — the official Next.js pattern.
 */
export default function LayoutShell({ header, children }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isShellFree = pathname.startsWith('/admin')
                   || pathname.startsWith('/ceo')
                   || pathname.startsWith('/login')
                   || pathname.startsWith('/about')
                   || pathname.startsWith('/schedule')

  // These routes manage their own full-page layouts — no global shell
  if (isLanding || isShellFree) {
    return <>{children}</>
  }

  // All other routes: standard app shell
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {header}
      <main className="flex-1 pt-16 bg-black">
        {children}
      </main>
      <footer className="border-t border-white/5 bg-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            &copy; {new Date().getFullYear()} Tj&apos;s Medical Hub. Built with care.
          </p>
        </div>
      </footer>
    </div>
  )
}
