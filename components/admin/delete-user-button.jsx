'use client'

import { deleteUser } from '@/app/admin/actions'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={`${triggerClass} border-red-200 text-red-600 hover:bg-red-50 cursor-pointer`}
        >
          Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white rounded-2xl p-6 border border-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-zinc-900 text-lg">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-500 text-sm mt-2">
            This will remove the user from the directory, revoke their sessions, and block sign-in.
            Appointment history is retained.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-3">
          <AlertDialogCancel className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <form action={deleteUser}>
            <input type="hidden" name="userId" value={userId} />
            <button
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700 font-semibold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer"
            >
              Delete
            </button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

