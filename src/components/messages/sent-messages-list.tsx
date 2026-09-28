import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/dates'
import type { SentMessageRow } from '@/lib/queries/messages'

function excerpt(text: string, max = 140): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

export function SentMessagesList({ messages }: { messages: SentMessageRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Gesendet</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Du hast noch keine Nachricht geschickt.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {messages.map((m) => (
              <li key={m.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
                <p className="text-sm">{excerpt(m.body)}</p>
                <p className="text-xs text-muted-foreground">
                  {m.recipientCount === 1
                    ? '1 Empfänger'
                    : `${m.recipientCount} Empfänger`}
                  {m.tasting ? ` · ${m.tasting.location}` : ''} ·{' '}
                  {formatDateTime(m.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
