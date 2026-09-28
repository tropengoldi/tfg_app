import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Nachrichten"
        description="Schreib der Runde oder den Teilnehmern eines Tastings."
      />
      <div className="space-y-6">
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </>
  )
}
