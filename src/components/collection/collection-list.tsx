'use client'

import { Library, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { CollectionEntryCard } from '@/components/collection/collection-entry-card'
import { CollectionEntryDialog } from '@/components/collection/collection-entry-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { deleteCollectionEntryAction } from '@/lib/actions/collection'
import type { CollectionEntry } from '@/lib/queries/collection'

export function CollectionList({ entries }: { entries: CollectionEntry[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CollectionEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CollectionEntry | null>(null)
  const [deleting, startDeleting] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || (e.distillery ?? '').toLowerCase().includes(q),
    )
  }, [entries, query])

  function openAdd() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(entry: CollectionEntry) {
    setEditTarget(entry)
    setFormOpen(true)
  }

  function onDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    startDeleting(async () => {
      const res = await deleteCollectionEntryAction(target.id)
      setDeleteTarget(null)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Eintrag gelöscht.')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Neuer Eintrag
        </Button>

        {entries.length > 0 ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name oder Destillerie suchen"
              className="pl-9"
            />
          </div>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Library className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Deine Sammlung ist noch leer. Trag deinen ersten Whisky ein.
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Keine Treffer.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <CollectionEntryCard
              key={entry.id}
              entry={entry}
              editable
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CollectionEntryDialog
        key={editTarget?.id ?? 'neu'}
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editTarget ?? undefined}
        onSaved={() => router.refresh()}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eintrag löschen?"
        description="Dieser Sammlungs-Eintrag ist danach endgültig weg. Das lässt sich nicht rückgängig machen."
        confirmLabel="Löschen"
        destructive
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  )
}
