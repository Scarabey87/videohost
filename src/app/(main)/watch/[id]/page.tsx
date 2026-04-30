import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const video = await db.video.findUnique({
    where: { id: params.id, isPublished: true },
    include: { person: true, author: true }
  });

  if (!video) notFound();

  // VIP проверка
  if (video.isVip && !session?.user?.isVip) {
    redirect("/vip?video=" + video.id);
  }

  // Увеличение счётчика (оптимистично + Redis debounce в продакшене)
  await db.video.update({ where: { id: video.id }, data: { views: { increment: 1 } } });

  // Запись в историю
  if (session?.user.id) {
    await db.view.create({
      data: { videoId: video.id, userId: session.user.id, progress: 0 }
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      <VideoPlayer 
        src={video.filePath} 
        poster={video.preview} 
        title={video.title} 
      />
      <div className="mt-6 space-y-2">
        <h1 className="text-2xl font-semibold">{video.title}</h1>
        <p className="text-sm text-muted-foreground">{video.description}</p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{video.views.toLocaleString()} просмотров</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          {video.person && <span>🎭 {video.person.name}</span>}
        </div>
      </div>
    </div>
  );
}