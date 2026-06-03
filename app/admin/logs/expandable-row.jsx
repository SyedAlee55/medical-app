'use client'

import { useState } from 'react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
         d.toLocaleTimeString('en-US', { timeZone: GLOBAL_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })
}

export function ExpandableRow({ log }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr onClick={() => setExpanded(!expanded)} className="hover:bg-zinc-800/20 cursor-pointer transition">
        <td className="px-6 py-4 text-xs font-semibold text-zinc-300">{formatDate(log.created_at)}</td>
        <td className="px-6 py-4 capitalize text-xs">
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            log.actor_role === 'ceo' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
            log.actor_role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            log.actor_role === 'doctor' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
            log.actor_role === 'staff' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
            'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
          }`}>
            {log.actor_role || 'system'}
          </span>
        </td>
        <td className="px-6 py-4 font-mono text-xs text-zinc-100">{log.action}</td>
        <td className="px-6 py-4 text-xs text-zinc-400 font-medium">{log.target_type || '—'}</td>
        <td className="px-6 py-4 font-mono text-xs text-zinc-400">{log.ip_address || '—'}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="px-6 py-4 bg-zinc-950/60 border-t border-b border-zinc-800">
            <pre className="text-xs text-brand-400/90 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-w-full">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}
