"use server";
import { db } from "@/lib/db";

export async function sendMessage(data: { name: string; email?: string; message: string }) {
  await db.message.create({
    data: {
      userName: data.name,
      email: data.email || null,
      text: data.message,
    }
  });
  return { success: true };
}