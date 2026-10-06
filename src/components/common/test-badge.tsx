import { FlaskConical } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Abzeichen „Test" für Testkonten und Test-Tastings (PROJ-26). Normale
 * Mitglieder bekommen solche Datensätze von der Datenbank gar nicht erst —
 * es reicht also, das Abzeichen anhand von `is_test` zu zeigen.
 */
export function TestBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('shrink-0 gap-1 border-dashed px-1.5 py-0 text-xs font-normal', className)}
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      Test
    </Badge>
  )
}
