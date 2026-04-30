"use server";
import { db } from "./db";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";

export async function votePoll(optionId: string) {
  const session = await auth();
  if (!session) throw new Error("Авторизуйтесь");

  await db.pollVote.create({
    data: { userId: session.user.id, optionId }
  });

  await db.pollOption.update({
    where: { id: optionId },
    data: { votes: { increment: 1 } }
  });

  revalidatePath("/");
}

export async function getPollStats() {
  return db.pollOption.findMany({ orderBy: { votes: "desc" } });
}