import type { Metadata } from 'next'

import { FeedbackForm } from '@/components/feedback/feedback-form'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Fehler & Wünsche' }

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ von?: string | string[] }>
}) {
  await requireUser()
  const { von } = await searchParams
  const from = typeof von === 'string' ? von : null

  return (
    <>
      <PageHeader
        title="Fehler & Wünsche"
        description="Etwas klemmt oder du hast eine Idee? Schreib es dem Admin."
      />
      <FeedbackForm from={from} />
    </>
  )
}
