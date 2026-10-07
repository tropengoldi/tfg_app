import { FlaskConical } from 'lucide-react'

import { badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Abzeichen „Test" für Testkonten und Test-Tastings (PROJ-26). Normale
 * Mitglieder bekommen solche Datensätze von der Datenbank gar nicht erst —
 * es reicht also, das Abzeichen anhand von `is_test` zu zeigen.
 *
 * Bewusst ein `span` mit den Badge-Stilen (statt des `div` aus `Badge`): Es
 * sitzt auch in Links, Labels und Text-Spans, wo ein `div` ungültig wäre.
 * Nicht auf dem Dashboard verwenden (PROJ-26 BUG-2, Live-Neuladen).
 */
export function TestBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        badgeVariants({ variant: 'outline' }),
        'shrink-0 gap-1 border-dashed px-1.5 py-0 text-xs font-normal',
        className,
      )}
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      Test
    </span>
  )
}
