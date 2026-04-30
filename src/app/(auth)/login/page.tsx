"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginAction } from "@/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await loginAction(form.email, form.password)
      localStorage.setItem("user_session", JSON.stringify(res))
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Ошибка входа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent">
          LIVE-AI.ART
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">Вход в аккаунт</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Пароль</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-[var(--accent)] font-medium hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}