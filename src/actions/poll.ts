"use server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function votePoll(optionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Авторизуйтесь");

  const existing = await db.pollVote.findFirst({
    where: { userId: session.user.id }
  });
  if (existing) throw new Error("Вы уже голосовали");

  await db.pollVote.create({
    data: { userId: session.user.id, optionId }
  });
  await db.pollOption.update({ where: { id: optionId }, data: { votes: { increment: 1 } } });
  revalidatePath("/");
}