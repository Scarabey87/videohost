"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function submitPollTag(text: string) {
  if (!text || text.trim().length < 2) {
    throw new Error("Тег должен содержать минимум 2 символа")
  }

  await db.pollTag.create({
    data: {
      text: text.trim(),
      votes: 1
    }
  })

  revalidatePath("/")
  return { success: true }
}

// Только для админки: получить все теги
export async function getPollTags() {
  return await db.pollTag.findMany({
    orderBy: { votes: "desc" },
    take: 50
  })
}