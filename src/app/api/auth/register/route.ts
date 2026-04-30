import { registerAction } from "@/lib/auth"
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
    
    const user = await registerAction(email, password)
    
    return NextResponse.json({ 
      success: true, 
      user,
      message: "Регистрация успешна" 
    })
  } catch (error: any) {
    console.error("Register error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка регистрации" },
      { status: 400 }
    )
  }
}