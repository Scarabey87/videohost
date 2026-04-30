'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка')
      }

      // Успешный вход/регистрация
      console.log('Success:', data)
      
      // Перенаправление на главную или профиль
      router.push('/')
      router.refresh()
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login' ? 'Вход' : 'Регистрация'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={8}
          disabled={loading}
        />
        {mode === 'register' && (
          <p className="text-sm text-gray-500 mt-1">Минимум 8 символов</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:bg-blue-300"
      >
        {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
      </button>
      
      <div className="mt-4 text-center">
        <a 
          href={mode === 'login' ? '/register' : '/login'}
          className="text-blue-500 hover:underline text-sm"
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </a>
      </div>
    </form>
  )
}