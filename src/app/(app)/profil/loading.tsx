import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <PageHeader title="Profil" />
      <div className="space-y-6">
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </>
  )
}
