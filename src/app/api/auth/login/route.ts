import { loginAction } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    
    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Заполните все поля" },
        { status: 400 }
      )
    }
    
    const user = await loginAction(email, password)
    
    return NextResponse.json({ 
      success: true, 
      user,
      message: "Вход выполнен успешно" 
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка входа" },
      { status: 400 }
    )
  }
}