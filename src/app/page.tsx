"use client"

import { useState, useEffect, FormEvent } from "react"
import { registerAction, loginAction } from "@/actions/auth"
import { submitPollTag } from "@/actions/poll"

// ===== ТИПЫ =====
type Theme = "light" | "dark" | "midnight" | "lavender"
type UserSession = { id: string; email: string; role: string } | null

export default function HomePage() {
  // ===== СОСТОЯНИЯ =====
  const [theme, setTheme] = useState<Theme>("light")
  const [user, setUser] = useState<UserSession>(null)
  
  // Модальные окна
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showContact, setShowContact] = useState(false)
  
  // Формы
  const [authForm, setAuthForm] = useState({ email: "", password: "" })
  const [authError, setAuthError] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")
  
  const [pollInput, setPollInput] = useState("")
  const [pollSent, setPollSent] = useState(false)
  
  const [contactForm, setContactForm] = useState({ name: "", message: "" })
  const [contactSent, setContactSent] = useState(false)

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", theme)
    
    const session = localStorage.getItem("user_session")
    if (session) setUser(JSON.parse(session))
  }, [theme])

  // ===== ОБРАБОТЧИКИ =====
  const handleTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem("theme", t)
  }

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setAuthSuccess("")
    try {
      // Прямая передача строк обходит баг Turbopack с FormData
      const res = authMode === "register"
        ? await registerAction(authForm.email, authForm.password)
        : await loginAction(authForm.email, authForm.password)
      
      localStorage.setItem("user_session", JSON.stringify(res))
      setUser(res)
      setAuthSuccess("✅ Успешно!")
      setTimeout(() => { setShowAuth(false); setAuthForm({ email: "", password: "" }); setAuthSuccess("") }, 1000)
    } catch (err: any) {
      setAuthError(err.message || "Ошибка авторизации")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    setUser(null)
  }

  const handlePoll = async () => {
    if (!pollInput.trim()) return
    if (!user) { alert("Войдите, чтобы предложить тег"); return }
    try {
      await submitPollTag(pollInput.trim())
      setPollSent(true)
      setPollInput("")
      setTimeout(() => setPollSent(false), 2000)
    } catch {
      alert("Ошибка отправки")
    }
  }

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault()
    const msgs = JSON.parse(localStorage.getItem("dev_messages") || "[]")
    msgs.push({ ...contactForm, id: Date.now(), date: new Date().toISOString() })
    localStorage.setItem("dev_messages", JSON.stringify(msgs))
    setContactSent(true)
    setTimeout(() => { setContactSent(false); setShowContact(false); setContactForm({ name: "", message: "" }) }, 2000)
  }

  // ===== РЕНДЕР =====
  return (
    <div className="min-h-screen transition-colors duration-300 bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* ===== ШАПКА ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 px-4 flex items-center justify-between bg-[var(--header)] backdrop-blur-xl border-b border-[var(--border)]">
        <span className="text-base font-black tracking-tight bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent">LIVE-AI.ART</span>
        <div className="flex items-center gap-2">
          <select value={theme} onChange={e => handleTheme(e.target.value as Theme)} className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-1.5 py-0.5 text-[10px] cursor-pointer">
            <option value="light">☀️</option><option value="dark">🌙</option><option value="midnight">🌌</option><option value="lavender">🟣</option>
          </select>
          {user ? (
            <>
              <span className="text-[10px] hidden sm:inline truncate max-w-24">{user.email}</span>
              <button onClick={handleLogout} className="px-2 py-0.5 rounded-md bg-[var(--border)] text-[10px] hover:bg-[var(--hover)] transition">Выйти</button>
            </>
          ) : (
            <button onClick={() => { setAuthMode("login"); setShowAuth(true) }} className="px-2 py-0.5 rounded-md bg-[var(--accent)] text-white text-[10px] hover:opacity-90 transition">Войти</button>
          )}
        </div>
      </header>

      <main className="pt-16 pb-8 px-4 max-w-4xl mx-auto flex flex-col items-center">
        {/* ===== HERO ===== */}
        <section className="text-center w-full py-2 mb-3">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-1 select-none">
            <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent2)] to-purple-500 bg-clip-text text-transparent">LIVE-AI.ART</span>
          </h1>
          <p className="text-[var(--muted)] text-xs mb-2">Платформа цифровых аватаров</p>
          <div className="flex justify-center gap-2">
            {user ? (
              <span className="text-[10px] text-green-600 font-medium bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">✓ {user.email}</span>
            ) : (
              <>
                <button onClick={() => { setAuthMode("login"); setShowAuth(true) }} className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition">Войти</button>
                <button onClick={() => { setAuthMode("register"); setShowAuth(true) }} className="px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-medium hover:bg-[var(--hover)] transition">Регистрация</button>
              </>
            )}
          </div>
        </section>

        {/* ===== КОМПАКТНЫЙ 3-БЛОЧНЫЙ РЯД ===== */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          {/* 1. Опрос */}
          <div className="bg-[var(--surface)] rounded-lg p-2 border border-[var(--border)] shadow-sm flex flex-col">
            <h3 className="font-semibold text-[11px] mb-1">📊 Тег оживления</h3>
            {pollSent ? (
              <div className="flex items-center justify-center text-green-500 text-[10px] font-medium py-1 bg-green-500/10 rounded-md flex-1">✅ Отправлено</div>
            ) : (
              <div className="flex gap-1 flex-1">
                <input type="text" placeholder="Ваш тег" value={pollInput} onChange={e => setPollInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handlePoll()} className="flex-1 px-2 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition" />
                <button onClick={handlePoll} disabled={!pollInput.trim() || !user} className="px-2 py-1 rounded-md bg-[var(--accent)] text-white text-[10px] font-medium disabled:opacity-50 transition">OK</button>
              </div>
            )}
          </div>

          {/* 2. Поддержать */}
          <div className="bg-[var(--surface)] rounded-lg p-2 border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-sm mb-0.5">☕</div>
            <h3 className="font-semibold text-[11px]">Поддержать</h3>
            <button className="mt-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-medium hover:opacity-90 transition active:scale-95">Донат</button>
          </div>

          {/* 3. Связаться (кнопка) */}
          <div className="bg-[var(--surface)] rounded-lg p-2 border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-sm mb-0.5">✉️</div>
            <h3 className="font-semibold text-[11px]">Разработчикам</h3>
            <button onClick={() => setShowContact(true)} className="mt-1 px-3 py-1 rounded-md bg-[var(--accent)] text-white text-[10px] font-medium hover:opacity-90 transition">Написать</button>
          </div>
        </div>
      </main>

      {/* ===== МОДАЛКА АВТОРИЗАЦИИ ===== */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-[var(--surface)] rounded-xl p-4 max-w-sm w-full shadow-2xl border border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3">{authMode === "register" ? "📝 Регистрация" : "🔐 Вход"}</h3>
            {authError && <p className="mb-2 text-[10px] text-red-500 bg-red-500/10 px-2 py-1 rounded-md">{authError}</p>}
            {authSuccess && <p className="mb-2 text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded-md">{authSuccess}</p>}
            <form onSubmit={handleAuth} className="space-y-2">
              <input type="email" placeholder="Email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition" />
              <input type="password" placeholder="Пароль (мин. 8 символов)" required minLength={8} value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition" />
              <button type="submit" className="w-full py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition">{authMode === "register" ? "Зарегистрироваться" : "Войти"}</button>
            </form>
            <p className="mt-3 text-center text-[10px] text-[var(--muted)]">
              {authMode === "register" ? "Есть аккаунт? " : "Нет аккаунта? "}
              <button onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); setAuthSuccess(""); }} className="text-[var(--accent)] font-medium hover:underline">{authMode === "register" ? "Войти" : "Создать"}</button>
            </p>
          </div>
        </div>
      )}

      {/* ===== МОДАЛКА КОНТАКТА ===== */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowContact(false)}>
          <div className="bg-[var(--surface)] rounded-xl p-4 max-w-sm w-full shadow-2xl border border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3">✉️ Написать разработчикам</h3>
            {contactSent ? (
              <div className="flex items-center justify-center text-green-500 font-medium py-6">✅ Сообщение сохранено!</div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-2">
                <input type="text" placeholder="Ваше имя" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition" />
                <textarea placeholder="Сообщение, идея или баг..." required rows={3} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition resize-none" />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowContact(false)} className="flex-1 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm hover:bg-[var(--hover)] transition">Отмена</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition">Отправить</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-[var(--border)] py-4 text-center text-[10px] text-[var(--muted)]">© {new Date().getFullYear()} LIVE-AI.ART. Все права защищены.</footer>
    </div>
  )
}