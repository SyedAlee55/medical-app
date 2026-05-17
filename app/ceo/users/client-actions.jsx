'use client'

import { useState } from 'react'
import { killSwitch, deleteUser } from '@/app/ceo/actions'
import { useRouter } from 'next/navigation'

export function ActionButtons({ userId }) {
  const [confirmKill, setConfirmKill] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleKillSwitch() {
    setLoading(true)
    const formData = new FormData()
    formData.append('userId', userId)
    await killSwitch(formData)
    setLoading(false)
    setConfirmKill(false)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    const formData = new FormData()
    formData.append('userId', userId)
    await deleteUser(formData)
    setLoading(false)
    setConfirmDelete(false)
    router.refresh()
  }

  if (confirmKill) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-red-600 font-medium">Terminate and lock this account?</span>
        <button disabled={loading} onClick={handleKillSwitch} className="bg-red-600 text-white px-2 py-1 rounded">Confirm</button>
        <button disabled={loading} onClick={() => setConfirmKill(false)} className="border px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
      </div>
    )
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-600 dark:text-zinc-400 font-medium">Soft-delete account?</span>
        <button disabled={loading} onClick={handleDelete} className="bg-red-600 text-white px-2 py-1 rounded">Confirm</button>
        <button disabled={loading} onClick={() => setConfirmDelete(false)} className="border px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <a href={`/ceo/users/${userId}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline">Edit</a>
      <button onClick={() => setConfirmKill(true)} className="text-red-600 hover:underline">Kill Switch</button>
      <button onClick={() => setConfirmDelete(true)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">Delete</button>
    </div>
  )
}
