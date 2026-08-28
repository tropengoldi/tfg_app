import { BottomNav } from '@/components/layout/bottom-nav'
import type { AppRole } from '@/lib/supabase/aliases'

export function AppShell({
  role,
  children,
}: {
  role: AppRole
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
      <BottomNav isAdmin={role === 'admin'} />
    </div>
  )
}
