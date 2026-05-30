'use client'

import { useState } from 'react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE,  month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
         d.toLocaleTimeString('en-US', { timeZone: GLOBAL_TIMEZONE,  hour: '2-digit', minute: '2-digit', hour12: false })
}

export function ExpandableRow({ log }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr onClick={() => setExpanded(!expanded)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
        <td className="px-4 py-3">{formatDate(log.created_at)}</td>
        <td className="px-4 py-3 capitalize">{log.actor_role}</td>
        <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
        <td className="px-4 py-3">{log.target_type || '-'}</td>
        <td className="px-4 py-3 font-mono text-xs">{log.ip_address || '-'}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
            <pre className="text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}
