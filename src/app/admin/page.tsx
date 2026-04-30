"use client"

import { useState, useEffect } from "react"

type Tab = "poll" | "users" | "videos" | "stats"

type PollTag = { id: string; text: string; votes: number; createdAt: string }
type User = { id: string; email: string; role: string; createdAt: string; isBlocked?: boolean }
type Video = { id: string; title: string; views: number; isVip: boolean; isPublished: boolean; authorEmail: string }

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("stats")
  const [pollTags, setPollTags] = useState<PollTag[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка данных (в реальном проекте — fetch к API)
  useEffect(() => {
    const loadData = async () => {
      // Имитация API-запросов
      setPollTags([
        { id: "1", text: "Реализм", votes: 142, createdAt: "2026-04-28" },
        { id: "2", text: "Аниме", votes: 98, createdAt: "2026-04-27" },
      ])
      setUsers([
        { id: "u1", email: "admin@live-ai.art", role: "ADMIN", createdAt: "2026-04-01" },
        { id: "u2", email: "user@example.com", role: "USER", createdAt: "2026-04-25" },
      ])
      setVideos([
        { id: "v1", title: "Киберпанк-город", views: 12450, isVip: false, isPublished: true, authorEmail: "admin@live-ai.art" },
        { id: "v2", title: "AI Аниме-сцена", views: 8900, isVip: true, isPublished: true, authorEmail: "admin@live-ai.art" },
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // Действия
  const toggleUserVIP = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: u.role === "VIP" ? "USER" : "VIP" } : u))
  }
  const toggleUserBlock = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u))
  }
  const toggleVideoPublish = (id: string) => {
    setVideos(videos.map(v => v.id === id ? { ...v, isPublished: !v.isPublished } : v))
  }
  const toggleVideoVIP = (id: string) => {
    setVideos(videos.map(v => v.id === id ? { ...v, isVip: !v.isVip } : v))
  }
  const deleteItem = (type: "poll" | "user" | "video", id: string) => {
    if (!confirm("Удалить?")) return
    if (type === "poll") setPollTags(pollTags.filter(t => t.id !== id))
    if (type === "user") setUsers(users.filter(u => u.id !== id))
    if (type === "video") setVideos(videos.filter(v => v.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-6">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🛠 Админ-панель</h1>
        <a href="/" className="px-4 py-2 rounded-lg bg-[var(--border)] text-sm hover:bg-[var(--hover)]">← На сайт</a>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["stats", "poll", "users", "videos"] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--hover)]"}`}>
            {tab === "stats" && "📊 Статистика"}
            {tab === "poll" && "📊 Теги опроса"}
            {tab === "users" && "👥 Пользователи"}
            {tab === "videos" && "🎬 Видео"}
          </button>
        ))}
      </div>

      {/* Контент табов */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 md:p-6 shadow-sm">
        
        {/* 📊 СТАТИСТИКА */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Пользователи" value={users.length} trend="+12%" />
            <StatCard label="VIP-пользователи" value={users.filter(u => u.role === "VIP").length} trend="+3" />
            <StatCard label="Видео" value={videos.length} trend="+2" />
            <StatCard label="Просмотры" value={videos.reduce((sum, v) => sum + v.views, 0).toLocaleString("ru-RU")} trend="+8.4%" />
            <div className="col-span-2 md:col-span-4 mt-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <h3 className="font-semibold mb-2">🔥 Популярные теги</h3>
              <div className="flex flex-wrap gap-2">
                {pollTags.slice(0, 5).map(tag => (
                  <span key={tag.id} className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">#{tag.text} ({tag.votes})</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 📊 ОПРОС */}
        {activeTab === "poll" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Предложенные теги ({pollTags.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <tr><th className="py-2">Тег</th><th>Голоса</th><th>Дата</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {pollTags.map(tag => (
                    <tr key={tag.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--hover)]">
                      <td className="py-3 font-medium">#{tag.text}</td>
                      <td>{tag.votes}</td>
                      <td className="text-[var(--muted)]">{new Date(tag.createdAt).toLocaleDateString("ru-RU")}</td>
                      <td>
                        <button onClick={() => deleteItem("poll", tag.id)} className="text-red-500 hover:underline text-xs">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 👥 ПОЛЬЗОВАТЕЛИ */}
        {activeTab === "users" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Пользователи ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <tr><th className="py-2">Email</th><th>Роль</th><th>Статус</th><th>Дата</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--hover)]">
                      <td className="py-3 font-medium">{user.email}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${user.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : user.role === "VIP" ? "bg-amber-500/20 text-amber-400" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.isBlocked ? "🔒 Заблок." : "✅ Активен"}</td>
                      <td className="text-[var(--muted)]">{new Date(user.createdAt).toLocaleDateString("ru-RU")}</td>
                      <td className="space-x-2">
                        <button onClick={() => toggleUserVIP(user.id)} className="text-[var(--accent)] hover:underline text-xs">{user.role === "VIP" ? "Снять VIP" : "Дать VIP"}</button>
                        <button onClick={() => toggleUserBlock(user.id)} className="text-orange-500 hover:underline text-xs">{user.isBlocked ? "Разблок." : "Блок."}</button>
                        <button onClick={() => deleteItem("user", user.id)} className="text-red-500 hover:underline text-xs">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🎬 ВИДЕО */}
        {activeTab === "videos" && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Видео ({videos.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <tr><th className="py-2">Название</th><th>Просмотры</th><th>VIP</th><th>Статус</th><th>Автор</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {videos.map(video => (
                    <tr key={video.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--hover)]">
                      <td className="py-3 font-medium">{video.title}</td>
                      <td>{video.views.toLocaleString("ru-RU")}</td>
                      <td>{video.isVip ? "⭐" : "—"}</td>
                      <td>{video.isPublished ? "✅ Опубликовано" : "🔒 Черновик"}</td>
                      <td className="text-[var(--muted)] text-xs">{video.authorEmail}</td>
                      <td className="space-x-2">
                        <button onClick={() => toggleVideoPublish(video.id)} className="text-[var(--accent)] hover:underline text-xs">{video.isPublished ? "Снять" : "Опубликовать"}</button>
                        <button onClick={() => toggleVideoVIP(video.id)} className="text-amber-500 hover:underline text-xs">{video.isVip ? "Убрать VIP" : "Сделать VIP"}</button>
                        <button onClick={() => deleteItem("video", video.id)} className="text-red-500 hover:underline text-xs">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Компонент карточки статистики
function StatCard({ label, value, trend }: { label: string; value: number | string; trend?: string }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {trend && <p className="text-xs text-green-500 mt-1">{trend}</p>}
    </div>
  )
}