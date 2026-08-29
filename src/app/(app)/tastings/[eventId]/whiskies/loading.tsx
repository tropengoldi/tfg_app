import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <PageHeader title="Meine Whiskys" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-full sm:w-48" />
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="space-y-2 p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
