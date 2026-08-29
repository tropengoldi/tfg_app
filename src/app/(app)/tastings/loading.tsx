import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Tastings"
        description="Deine Abende — trag hier ein, was du mitbringst."
      />
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="space-y-2 p-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
          </li>
        ))}
      </ul>
    </>
  )
}
