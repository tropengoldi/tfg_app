export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="brand-surface pointer-events-none fixed inset-0 -z-10"
      />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
