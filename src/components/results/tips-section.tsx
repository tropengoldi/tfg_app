'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Info } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { sortTips, tipLine, type KennerSummary, type RevealedTip } from '@/lib/winner-tips'

/**
 * „Alle Tipps" nach dem Abschluss (PROJ-22). Ohne Tipps wird nichts gerendert.
 * Wer nicht getippt hat, erscheint nicht.
 */
export function TipsSection({
  tips,
  summary,
}: {
  tips: RevealedTip[]
  summary: KennerSummary
}) {
  const [open, setOpen] = useState(false)
  if (summary.kind === 'none') return null
  const sorted = sortTips(tips)

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-foreground">Sieger-Tipps</h2>

      {summary.kind === 'no-winner' ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Kein Sieger — keine Kenner.</AlertDescription>
        </Alert>
      ) : null}

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary">
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          Alle Tipps ({sorted.length})
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-1 divide-y divide-border rounded-md border border-border">
            {sorted.map((t) => (
              <li
                key={t.profileId}
                className={cn(
                  'flex items-start gap-2 px-3 py-2 text-sm',
                  t.isCorrect && 'bg-gold/10 font-medium text-gold',
                )}
              >
                {t.isCorrect ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-label="richtig getippt" />
                ) : (
                  <span className="w-4 shrink-0" aria-hidden />
                )}
                <span className="min-w-0 break-words">
                  <Link href={`/profil/${t.profileId}`} className="hover:underline">
                    {t.name}
                  </Link>
                  {tipLine(t).slice(t.name.length)}
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
