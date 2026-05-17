export default function CeoLoading() {
  return (
    <div className="w-full space-y-6 p-4">
      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-1/4 rounded animate-pulse"></div>
      <div className="h-32 bg-zinc-200 dark:bg-zinc-800 w-full rounded animate-pulse"></div>
      <div className="h-64 bg-zinc-200 dark:bg-zinc-800 w-full rounded animate-pulse"></div>
    </div>
  )
}
