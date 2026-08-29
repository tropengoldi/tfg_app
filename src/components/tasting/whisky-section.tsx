'use client'

import { ExternalLink, Pencil, Plus, Trash2, Wine } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { WhiskyFormDialog } from '@/components/tasting/whisky-form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { removeWhiskyAction } from '@/lib/actions/whiskies'
import type { MyWhisky } from '@/lib/queries/tastings'
import type { Quota } from '@/lib/whisky-quota'
import type { WhiskyFormInput } from '@/lib/schemas/whiskies'

interface WhiskySectionProps {
  eventId: string
  editable: boolean
  whiskies: MyWhisky[]
  quota: Quota
}

export function WhiskySection({ eventId, editable, whiskies, quota }: WhiskySectionProps) {
  const router = useRouter()
  const [removing, startRemoving] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MyWhisky | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<MyWhisky | null>(null)

  function openAdd() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(whisky: MyWhisky) {
    setEditTarget(whisky)
    setFormOpen(true)
  }

  function onRemove() {
    if (!confirmTarget) return
    const target = confirmTarget
    startRemoving(async () => {
      const res = await removeWhiskyAction(eventId, target.whisky_id)
      setConfirmTarget(null)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Whisky entfernt.')
      router.refresh()
    })
  }

  const editDefaults: WhiskyFormInput | undefined = editTarget
    ? {
        name: editTarget.name,
        videoUrl: editTarget.video_url ?? '',
        ownerNotes: editTarget.owner_notes ?? '',
      }
    : undefined

  return (
    <div className="space-y-4">
      {editable ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{quota.hint}</p>
          <Button onClick={openAdd} disabled={!quota.canAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Whisky hinzufügen
          </Button>
        </div>
      ) : null}

      {whiskies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Wine className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {editable
                ? 'Trag ein, was du mitbringst — sieht außer dir nur der Gastgeber.'
                : 'Du hast für diesen Abend nichts eingetragen.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul
          aria-label="Meine Whiskys"
          className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
        >
          {whiskies.map((whisky) => (
            <li key={whisky.whisky_id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">{whisky.name}</p>
                {whisky.video_url ? (
                  <a
                    href={whisky.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    Video-Link
                  </a>
                ) : null}
                {whisky.owner_notes ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {whisky.owner_notes}
                  </p>
                ) : null}
              </div>

              {editable ? (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`„${whisky.name}" bearbeiten`}
                    onClick={() => openEdit(whisky)}
                    disabled={removing}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`„${whisky.name}" entfernen`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmTarget(whisky)}
                    disabled={removing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {editable ? (
        <>
          <WhiskyFormDialog
            key={editTarget?.whisky_id ?? 'neu'}
            open={formOpen}
            onOpenChange={setFormOpen}
            eventId={eventId}
            whiskyId={editTarget?.whisky_id}
            defaultValues={editDefaults}
            onSaved={() => router.refresh()}
          />
          <ConfirmDialog
            open={confirmTarget !== null}
            onOpenChange={(o) => !o && setConfirmTarget(null)}
            title="Whisky entfernen?"
            description="Die Angaben zu diesem Whisky sind danach endgültig weg. Das lässt sich nicht rückgängig machen."
            confirmLabel="Entfernen"
            destructive
            pending={removing}
            onConfirm={onRemove}
          />
        </>
      ) : null}
    </div>
  )
}
