'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const TAB_BUTTON_CLASS =
  'box-border h-9 w-full min-w-0 shrink-0 grow-0 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5'

export default function ApprovalsTabs({ pendingCount = 0, pendingPanel, reviewedPanel }) {
  const [activeTab, setActiveTab] = useState('pending')

  return (
    <div className="w-full">
      {/* Fixed-size tab bar — layout isolated from panel content below */}
      <div
        className="mb-6 w-[17.75rem] max-w-full shrink-0"
        style={{ contain: 'layout' }}
        role="tablist"
        aria-label="Application review tabs"
      >
        <div className="box-border grid h-11 w-[17.75rem] max-w-full grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            className={cn(
              TAB_BUTTON_CLASS,
              activeTab === 'pending'
                ? 'bg-white text-zinc-950'
                : 'bg-transparent text-zinc-500 hover:text-zinc-700'
            )}
          >
            Pending
            <span
              className={cn(
                'min-w-[1.125rem] rounded-full border border-red-100 bg-red-50 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-red-700 tabular-nums',
                pendingCount === 0 && 'invisible'
              )}
              aria-hidden={pendingCount === 0}
            >
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviewed'}
            onClick={() => setActiveTab('reviewed')}
            className={cn(
              TAB_BUTTON_CLASS,
              activeTab === 'reviewed'
                ? 'bg-white text-zinc-950'
                : 'bg-transparent text-zinc-500 hover:text-zinc-700'
            )}
          >
            Reviewed
            <span
              className="invisible min-w-[1.125rem] rounded-full border border-red-100 bg-red-50 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-red-700"
              aria-hidden
            >
              0
            </span>
          </button>
        </div>
      </div>

      {/* Panel content — only one panel mounted at a time so the table cannot affect the tab bar */}
      <div className="min-w-0 w-full">
        {activeTab === 'pending' ? (
          <div role="tabpanel" className="space-y-4">
            {pendingPanel}
          </div>
        ) : (
          <div role="tabpanel" className="min-w-0 overflow-x-auto">
            {reviewedPanel}
          </div>
        )}
      </div>
    </div>
  )
}
