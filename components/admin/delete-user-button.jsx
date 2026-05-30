'use client'

import { DeleteUserDialog } from '@/components/admin/delete-user-dialog'

export function DeleteUserButton({ userId, canDelete = true, fullWidth = false }) {
  const triggerClass = fullWidth
    ? 'w-full border font-semibold rounded-lg px-3 py-2 text-xs transition cursor-pointer'
    : 'border font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer'

  if (!canDelete) {
    return (
      <span
        title="Suspend this user first to cancel pending or confirmed appointments"
        className={`${triggerClass} border-zinc-200 text-zinc-400 bg-zinc-50 cursor-not-allowed inline-block text-center`}
      >
        Delete
      </span>
    )
  }

  return (
    <DeleteUserDialog
      userId={userId}
      trigger={
        <button
          type="button"
          className={`${triggerClass} border-red-200 text-red-600 hover:bg-red-50 cursor-pointer`}
        >
          Delete
        </button>
      }
    />
  )
}
