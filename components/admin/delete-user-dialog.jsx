'use client'

import { deleteUser } from '@/app/admin/actions'
import {
  AlertDialog,
  AlertDialogAction,
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

const deleteButtonClass =
  'bg-red-600 text-white hover:bg-red-700 font-semibold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-none ring-0 border-0 outline-none'

export function DeleteUserDialog({ userId, trigger }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={dialogContentClass}>
        <AlertDialogHeader className={dialogHeaderClass}>
          <AlertDialogTitle className="font-bold text-zinc-900 text-lg">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="!text-zinc-500 text-sm mt-2">
            This action is permanent and cannot be undone. This will delete the user&apos;s
            account, profile, and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={dialogFooterClass}>
          <AlertDialogCancel asChild>
            <button type="button" className={cancelButtonClass}>
              Cancel
            </button>
          </AlertDialogCancel>
          <form action={deleteUser}>
            <input type="hidden" name="userId" value={userId} />
            <AlertDialogAction asChild>
              <button type="submit" className={deleteButtonClass}>
                Delete
              </button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
