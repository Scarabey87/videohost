"use client";

import { useState, useEffect, useRef } from "react";

// ===== ТИПЫ =====
type Video = { id: string; title: string; views: number; isVip: boolean; persona: string | null; duration: string; date: string };
type Persona = { id: string; name: string; role: string; isVip: boolean };
type PollOption = { id: string; text: string; votes: number };

// ===== МОКОВЫЕ ДАННЫЕ =====
const MOCK_VIDEOS: Video[] = [
  { id: "1", title: "Киберпанк-город в деталях", views: 12450, isVip: false, persona: "Нео", duration: "12:34", date: "2026-04-28" },
  { id: "2", title: "AI Аниме-сцена: Рассвет", views: 8900, isVip: true, persona: "Сакура", duration: "08:15", date: "2026-04-27" },
  { id: "3", title: "Фотореалистичный портрет", views: 21000, isVip: false, persona: "Алиса", duration: "15:42", date: "2026-04-25" },
  { id: "4", title: "Фэнтези-битва: Магия огня", views: 5600, isVip: true, persona: "Дракон", duration: "04:20", date: "2026-04-29" },
  { id: "5", title: "Синтвейв-путешествие", views: 18200, isVip: false, persona: "Ретровейв", duration: "22:10", date: "2026-04-26" },
  { id: "6", title: "Минимализм: Абстракция №7", views: 3400, isVip: true, persona: "Геометрия", duration: "06:55", date: "2026-04-30" },
];

const MOCK_PERSONAS: Persona[] = [
  { id: "p1", name: "Нео", role: "Киберпанк-рассказчик", isVip: false },
  { id: "p2", name: "Сакура", role: "Аниме-аватар", isVip: true },
  { id: "p3", name: "Алиса", role: "Фотореализм", isVip: false },
  { id: "p4", name: "Дракон", role: "Фэнтези-эпос", isVip: true },
  { id: "p5", name: "Ретровейв", role: "Неон & Синт", isVip: false },
  { id: "p6", name: "Геометрия", role: "Абстракция", isVip: false },
];

const MOCK_POLL: PollOption[] = [
  { id: "tag1", text: "Реализм", votes: 142 },
  { id: "tag2", text: "Аниме", votes: 98 },
  { id: "tag3", text: "Киберпанк", votes: 76 },
  { id: "tag4", text: "Фэнтези", votes: 54 },
];

const SUPPORT_TEXT = "Поддержите проект ❤️. Каждая копейка идёт на аренду серверов и развитие ИИ-моделей.";

// ===== КОМПОНЕНТ =====
export default function HomePage() {
  // Состояния
  const [theme, setTheme] = useState<"light" | "dark" | "midnight" | "lavender">("light");
  const [pollOptions, setPollOptions] = useState<PollOption[]>(MOCK_POLL);
  const [votedTag, setVotedTag] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [contactMsg, setContactMsg] = useState({ name: "", text: "" });
  const [contactSent, setContactSent] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Инициализация темы и голосования
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as typeof theme;
    if (savedTheme) setTheme(savedTheme);
    
    const voted = localStorage.getItem("poll_vote");
    if (voted) setVotedTag(voted);

    // Применение CSS-переменных
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Обработчики
  const handleThemeChange = (t: typeof theme) => {
    setTheme(t);
    localStorage.setItem("theme", t);
  };

  const handleVote = (id: string) => {
    if (votedTag) return;
    setPollOptions(prev => prev.map(o => o.id === id ? { ...o, votes: o.votes + 1 } : o));
    setVotedTag(id);
    localStorage.setItem("poll_vote", id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Имитация отправки в БД
    const messages = JSON.parse(localStorage.getItem("dev_messages") || "[]");
    messages.push({ ...contactMsg, id: Date.now(), date: new Date().toISOString() });
    localStorage.setItem("dev_messages", JSON.stringify(messages));
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3000);
    setContactMsg({ name: "", text: "" });
  };

  // Рендер
  return (
    <div className="min-h-screen transition-colors duration-300 bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* ===== ШАПКА ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between bg-[var(--header)] backdrop-blur-xl border-b border-[var(--border)]">
        <span className="text-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent cursor-pointer">
          AI Video Hub
        </span>
        
        <nav className="hidden md:flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--hover)] transition text-sm font-medium">Главная</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--hover)] transition text-sm font-medium">Видео</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--hover)] transition text-sm font-medium">Персоны</button>
          <button className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">VIP</button>
        </nav>

        <div className="flex items-center gap-2">
          <select 
            value={theme} 
            onChange={(e) => handleThemeChange(e.target.value as any)}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm cursor-pointer"
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="midnight">🌌 Midnight</option>
            <option value="lavender">🟣 Lavender</option>
          </select>
          <button className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)]" onClick={() => setShowMobileMenu(!showMobileMenu)}>☰</button>
        </div>
      </header>

      {/* Мобильное меню */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md pt-20 px-4 space-y-4 md:hidden">
          {["Главная", "Видео", "Персоны", "VIP"].map(item => (
            <button key={item} className="w-full text-left px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-lg font-medium">{item}</button>
          ))}
          <button className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium mt-4">Войти</button>
        </div>
      )}

      {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
      <main className="pt-20 pb-16 px-4 max-w-7xl mx-auto space-y-10">
        
        {/* Приветствие */}
        <section className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Оживите видео с помощью <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent">ИИ</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            Платформа нового поколения для создания, просмотра и управления AI-аватарами. 
            Без регистрации доступен ограниченный каталог. Для полного доступа оформите VIP.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button className="px-6 py-3 rounded-full bg-[var(--accent)] text-white font-medium hover:opacity-90 transition shadow-lg shadow-[var(--accent)]/20">
              Смотреть каталог
            </button>
            <button className="px-6 py-3 rounded-full bg-[var(--surface)] border border-[var(--border)] font-medium hover:bg-[var(--hover)] transition">
              Зарегистрироваться
            </button>
          </div>
        </section>

        {/* ===== 3 БЛОКА В РЯД ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Опрос */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">📊 Предложите теги оживления</h3>
            <div className="space-y-2">
              {pollOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={!!votedTag}
                  className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                    votedTag === opt.id ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] hover:bg-[var(--hover)]"
                  }`}
                >
                  <span>{opt.text}</span>
                  <span className="text-[var(--muted)]">{opt.votes} голосов</span>
                </button>
              ))}
              {!votedTag && <p className="text-xs text-[var(--muted)] mt-2">Голосовать можно только один раз</p>}
            </div>
          </div>

          {/* 2. Поддержать проект */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-inner">☕</div>
            <h3 className="font-semibold text-lg">{SUPPORT_TEXT}</h3>
            <button 
              onClick={() => setShowSupport(true)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium hover:opacity-90 transition active:scale-95"
            >
              Поддержать проект
            </button>
          </div>

          {/* 3. Написать разработчикам */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-semibold text-lg mb-3">✉️ Написать разработчикам</h3>
            {contactSent ? (
              <div className="h-full flex items-center justify-center text-green-500 font-medium py-6">✅ Сообщение сохранено!</div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input 
                  type="text" placeholder="Ваше имя" required
                  value={contactMsg.name} onChange={e => setContactMsg({...contactMsg, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                />
                <textarea 
                  placeholder="Сообщение, идея или баг..." required rows={2}
                  value={contactMsg.text} onChange={e => setContactMsg({...contactMsg, text: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-none"
                />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition">
                  Отправить
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ===== ВИДЕО ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🔥 Популярные видео</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_VIDEOS.map(v => (
              <div key={v.id} className="group relative bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="aspect-video bg-[var(--bg)] relative flex items-center justify-center overflow-hidden">
                  {v.isVip ? (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white font-medium">▶ Воспроизвести</span>
                    </div>
                  )}
                  <div className="text-4xl opacity-30">🎬</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{v.title}</h3>
                  <div className="flex justify-between items-center mt-2 text-xs text-[var(--muted)]">
                    <span>👁️ {v.views.toLocaleString()}</span>
                    <span>{v.date}</span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--accent)] font-medium">{v.persona}</div>
                </div>
                {v.isVip && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">VIP</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== ПЕРСОНЫ ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🤖 AI-персоны</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {MOCK_PERSONAS.map(p => (
              <div key={p.id} className="flex flex-col items-center p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:scale-105 transition-transform cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {p.name[0]}
                </div>
                <span className="mt-3 font-medium text-center text-sm">{p.name}</span>
                <span className="text-xs text-[var(--muted)] mt-0.5">{p.role}</span>
                {p.isVip && <span className="mt-1 text-[10px] text-amber-500 font-semibold">⭐ Premium</span>}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ===== МОДАЛКА ПОДДЕРЖКИ ===== */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowSupport(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Спасибо за поддержку! 🙏</h3>
            <p className="text-[var(--muted)] text-sm mb-4">
              Ваш вклад помогает оплачивать GPU-серверы, развивать модели и добавлять новые функции.
              <br/><br/>
              💳 Карта: <span className="font-mono">0000 0000 0000 0000</span><br/>
              🪙 USDT (TRC20): <span className="font-mono text-xs">TX...xxx</span>
            </p>
            <button onClick={() => setShowSupport(false)} className="w-full py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--hover)] transition">
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ===== ФУТЕР ===== */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
        © {new Date().getFullYear()} AI Video Platform. Все права защищены.
      </footer>
    </div>
  );
}