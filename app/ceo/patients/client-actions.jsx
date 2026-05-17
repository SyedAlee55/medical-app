'use client'

import { useState } from 'react'
import { deleteUser } from '@/app/ceo/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function PatientActionButtons({ userId }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const formData = new FormData()
    formData.append('userId', userId)
    await deleteUser(formData)
    setLoading(false)
    setConfirmDelete(false)
    router.refresh()
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-600 dark:text-zinc-400 font-medium">Soft-delete?</span>
        <button disabled={loading} onClick={handleDelete} className="bg-red-600 text-white px-2 py-1 rounded">Confirm</button>
        <button disabled={loading} onClick={() => setConfirmDelete(false)} className="border px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href={`/ceo/patients/${userId}`} className="text-blue-600 dark:text-blue-400 hover:underline">View</Link>
      <button onClick={() => setConfirmDelete(true)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">Delete</button>
    </div>
  )
}
