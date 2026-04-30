"use client";
import { useState } from "react";
import { votePoll } from "@/actions/poll";
import { sendMessage } from "@/actions/contact";

interface TopBlocksProps {
  pollOptions: { id: string; text: string; votes: number }[];
  supportText: string;
  isAuthenticated: boolean;
}

export default function TopBlocks({ pollOptions, supportText, isAuthenticated }: TopBlocksProps) {
  const [showSupport, setShowSupport] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [pollVoted, setPollVoted] = useState<string | null>(null);

  const handleVote = async (id: string) => {
    if (!isAuthenticated) return alert("Войдите, чтобы голосовать");
    try {
      await votePoll(id);
      setPollVoted(id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(contactForm);
      setContactSuccess(true);
      setTimeout(() => setContactSuccess(false), 3000);
      setContactForm({ name: "", email: "", message: "" });
    } catch (e) {
      alert("Ошибка отправки. Попробуйте позже.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Опрос */}
      <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">📊 Предложите теги оживления</h3>
        <div className="space-y-2">
          {pollOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={!!pollVoted}
              className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all ${
                pollVoted === opt.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--bg)]/50"
              }`}
            >
              <span className="font-medium">{opt.text}</span>
              <span className="float-right text-xs text-[var(--muted)]">{opt.votes} голосов</span>
            </button>
          ))}
          {!isAuthenticated && (
            <p className="text-xs text-[var(--muted)] mt-2">Войдите, чтобы участвовать в голосовании</p>
          )}
        </div>
      </section>

      {/* 2. Поддержать проект */}
      <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3">☕</div>
        <h3 className="font-semibold text-lg mb-2">{supportText}</h3>
        <button
          onClick={() => setShowSupport(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white font-medium text-sm hover:opacity-90 transition-all active:scale-95"
        >
          Поддержать проект
        </button>
      </section>

      {/* 3. Написать разработчикам */}
      <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">✉️ Написать разработчикам</h3>
        {contactSuccess ? (
          <div className="h-full flex items-center justify-center text-green-500 font-medium">
            ✅ Сообщение отправлено!
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-3">
            <input
              placeholder="Ваше имя"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              required
            />
            <textarea
              placeholder="Сообщение..."
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-none"
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Отправить
            </button>
          </form>
        )}
      </section>

      {/* Модалка поддержки */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowSupport(false)}>
          <div className="bg-[var(--surface)] rounded-[20px] p-6 max-w-sm w-full shadow-2xl border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-2">Спасибо за поддержку! 🙏</h3>
            <p className="text-[var(--muted)] mb-4 text-sm">
              Ваш вклад помогает развивать платформу, оплачивать серверы и улучшать ИИ-модели.
              <br /><br />
              💳 Карта: 0000 0000 0000 0000<br />
              🪙 Крипто: 0x000...000
            </p>
            <button
              onClick={() => setShowSupport(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--border)] transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}