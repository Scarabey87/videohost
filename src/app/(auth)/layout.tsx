export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 transition-colors duration-300">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        {children}
      </div>
    </div>
  )
}