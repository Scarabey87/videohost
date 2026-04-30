"use client";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ src, poster, title }: any) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.disablePictureInPicture = true;
    // Отключение контекстного меню "Сохранить видео как..."
    v.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  return (
    <video
      ref={ref}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      playsInline
      poster={poster}
      className="w-full rounded-xl bg-black aspect-video object-contain"
      preload="metadata"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}