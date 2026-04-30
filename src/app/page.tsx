"use client";

import { useState, useEffect } from "react";

// ===== ТИПЫ =====
type Video = { 
  id: string; 
  title: string; 
  views: number; 
  isVip: boolean; 
  persona: string | null; 
  duration: string; 
  date: string;
  preview?: string;
};

type Persona = { 
  id: string; 
  name: string; 
  role: string; 
  isVip: boolean;
  avatar?: string;
};

type TagSuggestion = {
  id: string;
  text: string;
  votes: number;
  createdAt: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  isVip: boolean;
};

// ===== МОКОВЫЕ ДАННЫЕ =====
const MOCK_VIDEOS: Video[] = [
  { id: "1", title: "Киберпанк-город в деталях", views: 12450, isVip: false, persona: "Нео", duration: "12:34", date: "2026-04-28", preview: "🌃" },
  { id: "2", title: "AI Аниме-сцена: Рассвет", views: 8900, isVip: true, persona: "Сакура", duration: "08:15", date: "2026-04-27", preview: "🌸" },
  { id: "3", title: "Фотореалистичный портрет", views: 21000, isVip: false, persona: "Алиса", duration: "15:42", date: "2026-04-25", preview: "👤" },
  { id: "4", title: "Фэнтези-битва: Магия огня", views: 5600, isVip: true, persona: "Дракон", duration: "04:20", date: "2026-04-29", preview: "🐉" },
  { id: "5", title: "Синтвейв-путешествие", views: 18200, isVip: false, persona: "Ретровейв", duration: "22:10", date: "2026-04-26", preview: "🌆" },
  { id: "6", title: "Минимализм: Абстракция №7", views: 3400, isVip: true, persona: "Геометрия", duration: "06:55", date: "2026-04-30", preview: "🔷" },
];

const MOCK_PERSONAS: Persona[] = [
  { id: "p1", name: "Нео", role: "Киберпанк-рассказчик", isVip: false, avatar: "🤖" },
  { id: "p2", name: "Сакура", role: "Аниме-аватар", isVip: true, avatar: "🌸" },
  { id: "p3", name: "Алиса", role: "Фотореализм", isVip: false, avatar: "👩" },
  { id: "p4", name: "Дракон", role: "Фэнтези-эпос", isVip: true, avatar: "🐲" },
  { id: "p5", name: "Ретровейв", role: "Неон & Синт", isVip: false, avatar: "🎵" },
  { id: "p6", name: "Геометрия", role: "Абстракция", isVip: false, avatar: "🔷" },
];

const SUPPORT_TEXT = "Поддержите проект ❤️";

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const hashPassword = (pwd: string) => btoa(pwd).split('').reverse().join(''); // Простой хеш для демо

const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem('current_user_id');
  if (!userId) return null;
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find((u: User) => u.id === userId) || null;
};

// ===== КОМПОНЕНТ =====
export default function HomePage() {
  // Состояния
  const [theme, setTheme] = useState<"light" | "dark" | "midnight" | "lavender">("light");
  const [tagInput, setTagInput] = useState("");
  const [myTags, setMyTags] = useState<TagSuggestion[]>([]);
  const [showSupport, setShowSupport] = useState(false);
  const [contactMsg, setContactMsg] = useState({ name: "", text: "" });
  const [contactSent, setContactSent] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Регистрация / Авторизация
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Инициализация
  useEffect(() => {
    // Тема
    const savedTheme = localStorage.getItem("theme") as typeof theme;
    if (savedTheme) setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", theme);

    // Теги пользователя
    const savedTags = localStorage.getItem("user_tags");
    if (savedTags) setMyTags(JSON.parse(savedTags));

    // Текущий пользователь
    setCurrentUser(getCurrentUser());
  }, [theme]);

  // Обработчики тем
  const handleThemeChange = (t: typeof theme) => {
    setTheme(t);
    localStorage.setItem("theme", t);
  };

  // ===== ОПРОС: добавление тега =====
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag: TagSuggestion = {
      id: `tag_${Date.now()}`,
      text: tagInput.trim(),
      votes: 1,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newTag, ...myTags].slice(0, 10); // Храним последние 10
    setMyTags(updated);
    localStorage.setItem("user_tags", JSON.stringify(updated));
    setTagInput("");
  };

  // ===== КОНТАКТ =====
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messages = JSON.parse(localStorage.getItem("dev_messages") || "[]");
    messages.push({ ...contactMsg, id: Date.now(), date: new Date().toISOString() });
    localStorage.setItem("dev_messages", JSON.stringify(messages));
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3000);
    setContactMsg({ name: "", text: "" });
  };

  // ===== АВТОРИЗАЦИЯ / РЕГИСТРАЦИЯ =====
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const { username, email, password, confirm } = authForm;

    // Валидация
    if (!username || !email || !password) {
      setAuthError("Заполните все поля");
      return;
    }
    if (password.length < 8) {
      setAuthError("Пароль должен быть от 8 символов");
      return;
    }
    if (password !== confirm) {
      setAuthError("Пароли не совпадают");
      return;
    }

    // Проверка уникальности
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((u: User) => u.username === username)) {
      setAuthError("Имя пользователя уже занято");
      return;
    }
    if (users.some((u: User) => u.email === email)) {
      setAuthError("Email уже зарегистрирован");
      return;
    }

    // Создание пользователя
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      isVip: false,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("current_user_id", newUser.id);
    
    setAuthSuccess("✅ Регистрация успешна!");
    setCurrentUser(newUser);
    setTimeout(() => {
      setShowAuthModal(false);
      setAuthForm({ username: "", email: "", password: "", confirm: "" });
      setAuthSuccess("");
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const { username, password } = authForm;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: User) => u.username === username && u.passwordHash === hashPassword(password));

    if (!user) {
      setAuthError("Неверный логин или пароль");
      return;
    }

    localStorage.setItem("current_user_id", user.id);
    setAuthSuccess("✅ Вход выполнен!");
    setCurrentUser(user);
    setTimeout(() => {
      setShowAuthModal(false);
      setAuthForm({ username: "", email: "", password: "", confirm: "" });
      setAuthSuccess("");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("current_user_id");
    setCurrentUser(null);
  };

  // ===== РЕНДЕР =====
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
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline">{currentUser.username}</span>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-[var(--border)] text-sm hover:bg-[var(--hover)] transition">
                Выйти
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="px-3 py-1.5 rounded-lg hover:bg-[var(--hover)] transition text-sm font-medium">
                Войти
              </button>
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition">
                Регистрация
              </button>
            </>
          )}
          
          <button className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)]" onClick={() => setShowMobileMenu(!showMobileMenu)}>☰</button>
        </div>
      </header>

      {/* Мобильное меню */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md pt-20 px-4 space-y-4 md:hidden">
          {["Главная", "Видео", "Персоны", "VIP"].map(item => (
            <button key={item} className="w-full text-left px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-lg font-medium">{item}</button>
          ))}
        </div>
      )}

      {/* ===== МОДАЛКА АВТОРИЗАЦИИ / РЕГИСТРАЦИИ ===== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAuthModal(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{authMode === 'register' ? '📝 Регистрация' : '🔐 Вход'}</h3>
            
            {authError && <p className="mb-3 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{authError}</p>}
            {authSuccess && <p className="mb-3 text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">{authSuccess}</p>}
            
            <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-3">
              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Имя пользователя *"
                    value={authForm.username}
                    onChange={e => setAuthForm({...authForm, username: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                    required
                  />
                </>
              )}
              <input
                type="password"
                placeholder="Пароль *"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                required
                minLength={8}
              />
              {authMode === 'register' && (
                <input
                  type="password"
                  placeholder="Подтвердите пароль *"
                  value={authForm.confirm}
                  onChange={e => setAuthForm({...authForm, confirm: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                  required
                />
              )}
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition">
                {authMode === 'register' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </form>
            
            <p className="mt-4 text-center text-sm text-[var(--muted)]">
              {authMode === 'register' ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
              <button 
                onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(""); setAuthSuccess(""); }}
                className="text-[var(--accent)] font-medium hover:underline"
              >
                {authMode === 'register' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </p>
          </div>
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
            Без регистрации доступен ограниченный каталог.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button className="px-6 py-3 rounded-full bg-[var(--accent)] text-white font-medium hover:opacity-90 transition shadow-lg shadow-[var(--accent)]/20">
              Смотреть каталог
            </button>
            {!currentUser && (
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="px-6 py-3 rounded-full bg-[var(--surface)] border border-[var(--border)] font-medium hover:bg-[var(--hover)] transition">
                Зарегистрироваться
              </button>
            )}
          </div>
        </section>

        {/* ===== ЛЕВАЯ ПАНЕЛЬ: ТОП-ВИДЕО (рекламный блок) ===== */}
        <aside className="hidden lg:block fixed left-4 top-24 w-72 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-lg p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-1">🔥 ТОП видео</h3>
            <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full">Реклама</span>
          </div>
          <div className="space-y-2">
            {MOCK_VIDEOS.slice(0, 4).map((v, i) => (
              <div key={v.id} className="flex gap-2 items-center p-2 rounded-xl hover:bg-[var(--hover)] transition cursor-pointer group">
                <span className="text-base font-bold text-[var(--muted)] w-5">{i + 1}</span>
                <div className="w-14 h-9 rounded-lg bg-[var(--bg)] flex items-center justify-center text-xs flex-shrink-0">
                  {v.preview || "🎬"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">{v.title}</p>
                  <p className="text-[10px] text-[var(--muted)]">{v.views.toLocaleString('ru-RU')} 👁️</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <p className="text-[10px] text-[var(--muted)] text-center">
              VIP-доступ от <span className="font-bold text-[var(--accent)]">99₽/нед</span>
            </p>
            <button className="w-full mt-2 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white font-medium hover:opacity-90 transition">
              Оформить VIP
            </button>
          </div>
        </aside>

        {/* ===== ПРАВАЯ ЧАСТЬ: Опрос + Поддержка + Контакт ===== */}
        <div className="lg:ml-80 space-y-4">
          
          {/* 1. Опрос: только ввод тега */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-semibold text-lg mb-3">📊 Предложите тег оживления</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Введите свой тег и нажмите Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              />
              <button 
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
              >
                Добавить
              </button>
            </div>
            
            {/* Список добавленных тегов */}
            {myTags.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-[var(--muted)] mb-2">Ваши предложения:</p>
                <div className="flex flex-wrap gap-2">
                  {myTags.map(tag => (
                    <span key={tag.id} className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                      #{tag.text} <span className="text-[var(--muted)]">({tag.votes})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Поддержать проект */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-inner">☕</div>
              <div>
                <h3 className="font-semibold">{SUPPORT_TEXT}</h3>
              </div>
            </div>
            <button 
              onClick={() => setShowSupport(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition active:scale-95 whitespace-nowrap"
            >
              Поддержать
            </button>
          </div>

          {/* 3. Написать разработчикам */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-sm">
            <h3 className="font-semibold text-lg mb-3">✉️ Написать разработчикам</h3>
            {contactSent ? (
              <div className="flex items-center justify-center text-green-500 font-medium py-4">
                ✅ Сообщение сохранено!
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Ваше имя" 
                  required
                  value={contactMsg.name} 
                  onChange={e => setContactMsg({...contactMsg, name: e.target.value})}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                />
                <input 
                  type="text" 
                  placeholder="Сообщение..." 
                  required
                  value={contactMsg.text} 
                  onChange={e => setContactMsg({...contactMsg, text: e.target.value})}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                />
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
                >
                  Отправить
                </button>
              </form>
            )}
          </div>

          {/* ===== ПЕРСОНЫ: карточки такого же размера, как видео + фото ===== */}
          <section>
            <h2 className="text-2xl font-bold mb-4">🤖 AI-персоны</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {MOCK_PERSONAS.map(p => (
                <div 
                  key={p.id} 
                  className="group relative bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Аватар / Фото — такого же размера, как превью видео */}
                  <div className="aspect-video bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent2)]/20 relative flex items-center justify-center overflow-hidden">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {p.avatar || "👤"}
                    </div>
                    {/* Оверлей при наведении */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white font-medium text-sm">Профиль →</span>
                    </div>
                  </div>
                  
                  {/* Инфо */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{p.role}</p>
                    {p.isVip && (
                      <span className="inline-block mt-2 text-[10px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-semibold">
                        ⭐ Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ===== МОДАЛКА ПОДДЕРЖКИ ===== */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowSupport(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Спасибо за поддержку! 🙏</h3>
            <p className="text-[var(--muted)] text-sm mb-4">
              Ваш вклад помогает оплачивать серверы и развивать ИИ.
              <br/><br/>
              💳 Карта: <span className="font-mono text-xs">0000 0000 0000 0000</span>
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