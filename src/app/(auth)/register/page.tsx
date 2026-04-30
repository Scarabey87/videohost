"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerAction } from "@/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (form.password.length < 8) {
      setError("Пароль должен быть от 8 символов")
      setLoading(false)
      return
    }
    if (form.password !== form.confirm) {
      setError("Пароли не совпадают")
      setLoading(false)
      return
    }

    try {
      const res = await registerAction(form.email, form.password)
      setSuccess("✅ Регистрация успешна! Перенаправляем...")
      localStorage.setItem("user_session", JSON.stringify(res))
      
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации")
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
        <p className="text-[var(--muted)] text-sm mt-1">Создать аккаунт</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
          {success}
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
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition"
            placeholder="Минимум 8 символов"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Подтвердите пароль</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition"
            placeholder="Повторите пароль"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-[var(--accent)] font-medium hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}