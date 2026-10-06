import type { Metadata } from 'next'

import { MessageComposer } from '@/components/messages/message-composer'
import { SentMessagesList } from '@/components/messages/sent-messages-list'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'
import { getComposeData, getSentMessages } from '@/lib/queries/messages'

export const metadata: Metadata = { title: 'Nachrichten' }

export default async function NachrichtenPage() {
  const { userId, profile } = await requireUser()

  const [composeData, sentMessages] = await Promise.all([
    getComposeData(userId, profile.is_test),
    getSentMessages(userId),
  ])

  return (
    <>
      <PageHeader
        title="Nachrichten"
        description="Schreib der Runde oder den Teilnehmern eines Tastings."
      />
      <div className="space-y-6">
        <MessageComposer {...composeData} />
        <SentMessagesList messages={sentMessages} />
      </div>
    </>
  )
}
