"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  useEffect(() => {
    const session = localStorage.getItem("user_session")
    if (!session) { router.replace("/") }
    else {
      const user = JSON.parse(session)
      if (user.role !== "ADMIN") { router.replace("/") }
    }
  }, [router])
  
  return <>{children}</>
}