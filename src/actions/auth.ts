"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerAction(email: string, password: string) {
  // 🔹 Фолбэк для разработки без БД
  if (process.env.MOCK_AUTH === "true") {
    return { id: "mock_" + Date.now(), email, role: "USER" }
  }

  if (!email || !password) throw new Error("Заполните все поля")
  if (password.length < 8) throw new Error("Пароль должен быть от 8 символов")

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) throw new Error("Email уже зарегистрирован")

  const passwordHash = await bcrypt.hash(password, 10)
  
  // 🔑 ИСПРАВЛЕНО: добавлен обязательный ключ `data:`
  const user = await db.user.create({
    data: { email, passwordHash, role: "USER" },
    select: { id: true, email: true, role: true }
  })

  return user
}

export async function loginAction(email: string, password: string) {
  // 🔹 Фолбэк для разработки без БД
  if (process.env.MOCK_AUTH === "true") {
    return { id: email === "admin@test.com" ? "mock_admin" : "mock_user", email, role: email === "admin@test.com" ? "ADMIN" : "USER" }
  }

  if (!email || !password) throw new Error("Заполните все поля")

  const user = await db.user.findUnique({ where: { email } })
  if (!user) throw new Error("Неверный email или пароль")

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error("Неверный email или пароль")

  return { id: user.id, email: user.email, role: user.role }
}