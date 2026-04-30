import { ThemeProvider } from "next-themes"
import "./globals.css"

export const metadata = {
  title: "AI Оживление Фото | LIVE-AI.ART — Живые ИИ-аватары",
  description: "Оживите фото за секунды с помощью ИИ. AI live photo, живые гиф, ИИ оживление. Бесплатный доступ к премиум-технологиям.",
  keywords: ["ai оживление фото", "порно оживление", "порно гиф", "porno gif", "ai live photo", "живое фото", "ИИ оживление фото", "ai alive photo", "ai live picture"],
  icons: { icon: "/favicon.ico" },
  robots: "index, follow"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="keywords" content="ai оживление фото, порно оживление, порно гиф, porno gif, ai live photo, живое фото, ИИ оживление фото, ai alive photo, ai live picture" />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}