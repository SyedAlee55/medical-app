'use client'

import { useState } from 'react'
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

const dialogContentClass =
  'bg-white rounded-2xl p-6 border-0 shadow-xl ring-0 outline-none text-zinc-900 sm:max-w-md gap-0'

const dialogHeaderClass = 'text-left sm:place-items-start sm:text-left'

const dialogFooterClass =
  'mt-6 flex flex-row justify-end gap-3 border-0 bg-transparent p-0 -mx-0 -mb-0 rounded-none'

const cancelButtonClass =
  'px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer bg-white shadow-none ring-0 outline-none'

export function DeleteUserDialog({ userId, trigger }) {
  const [pending, setPending] = useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={dialogContentClass}>
        <AlertDialogHeader className={dialogHeaderClass}>
          <AlertDialogTitle className="font-bold text-zinc-900 text-lg">
            Delete User Permanently?
          </AlertDialogTitle>
          <AlertDialogDescription className="!text-zinc-500 text-sm mt-2">
            This action <strong className="text-zinc-700">cannot be undone</strong>. The user&apos;s
            account, profile, and all associated data will be permanently removed from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={dialogFooterClass}>
          <AlertDialogCancel asChild>
            <button type="button" disabled={pending} className={cancelButtonClass}>
              Cancel
            </button>
          </AlertDialogCancel>

          {/*
            IMPORTANT: The submit button must NOT be wrapped by AlertDialogAction asChild.
            Radix UI's AlertDialogAction fires preventDefault() on click for its exit animation,
            which silently blocks form submission and the server action never runs.
          */}
          <form
            action={async (formData) => {
              setPending(true)
              await deleteUser(formData)
              setPending(false)
            }}
          >
            <input type="hidden" name="userId" value={userId} />
            <button
              type="submit"
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-none ring-0 border-0 outline-none"
            >
              {pending ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
