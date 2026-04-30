"use server"

import { db } from "@/lib/db"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { revalidatePath } from "next/cache"

export async function uploadVideoAction(formData: FormData, authorId: string) {
  const title = formData.get("title") as string
  const file = formData.get("file") as File
  const isVip = formData.get("isVip") === "true"

  // Валидация
  if (!title?.trim()) throw new Error("Укажите название видео")
  if (!file || !(file instanceof File)) throw new Error("Выберите файл видео")
  if (file.size > 100 * 1024 * 1024) throw new Error("Файл не должен превышать 100 МБ")
  
  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/x-msvideo"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Неподдерживаемый формат. Допустимы: MP4, WebM, MOV, MKV, AVI")
  }

  // Проверка прав (только админы могут загружать)
  const author = await db.user.findUnique({ where: { id: authorId } })
  if (!author || author.role !== "ADMIN") {
    throw new Error("Только администраторы могут загружать видео")
  }

  // Сохранение файла (локально для dev)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_").toLowerCase()}`
  const uploadDir = join(process.cwd(), "public", "uploads")
  
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, fileName), buffer)

  // Запись в БД
  const video = await db.video.create({
    data: {
      title: title.trim(),
      filePath: `/uploads/${fileName}`,
      previewPath: null, // можно добавить генерацию превью через ffmpeg
      isVip,
      isPublished: true,
      authorId
    },
    select: { id: true, title: true, createdAt: true }
  })

  revalidatePath("/")
  return video
}