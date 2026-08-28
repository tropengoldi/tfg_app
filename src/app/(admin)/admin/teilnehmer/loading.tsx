import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Teilnehmer"
        description="Einladen, Status verwalten, Admin-Rechte vergeben."
      />
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-44" />
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
