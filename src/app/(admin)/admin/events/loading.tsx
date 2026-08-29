import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <PageHeader title="Tastings" description="Abende anlegen und vorbereiten." />
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="space-y-2 p-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
