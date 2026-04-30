"use client";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  views: number;
  isVip: boolean;
  preview?: string | null;
  person?: { name: string } | null;
}

export default function VideoGrid({ videos, isAuthenticated, isVip }: { videos: Video[]; isAuthenticated: boolean; isVip: boolean }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">🔥 Популярные видео</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => {
          const isLocked = video.isVip && !isVip;
          return (
            <Link
              key={video.id}
              href={isLocked ? "/vip" : `/watch/${video.id}`}
              className="group relative block rounded-[16px] overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-all"
            >
              {/* Превью */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {isLocked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md">
                    <div className="text-center">
                      <span className="text-2xl">🔒</span>
                      <p className="text-white text-xs mt-1 font-medium">Требуется VIP</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-sm font-medium">▶ Смотреть</span>
                  </div>
                )}
                {/* Заглушка превью */}
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-xs">
                  {video.preview ? <img src={video.preview} alt={video.title} className="w-full h-full object-cover" /> : "🎬 Превью"}
                </div>
              </div>

              {/* Инфо */}
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{video.title}</h3>
                <div className="flex items-center justify-between mt-1 text-xs text-[var(--muted)]">
                  <span>{video.person?.name || "AI Platform"}</span>
                  <span>{video.views.toLocaleString()} 👁️</span>
                </div>
              </div>

              {video.isVip && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  VIP
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}