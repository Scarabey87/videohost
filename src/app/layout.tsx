import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata = {
  title: "AI Video Platform",
  description: "Оживите видео с помощью ИИ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body 
        className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
        suppressHydrationWarning  // ← ← ← ДОБАВИТЬ ЭТУ СТРОКУ
      >
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}