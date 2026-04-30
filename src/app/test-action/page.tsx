"use client"
import { useState } from "react"
import { registerAction } from "@/actions/auth"

export default function TestPage() {
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const test = async () => {
    try {
      const res = await registerAction("test@test.com", "test12345678")
      setResult(JSON.stringify(res))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <h1>🧪 Test Server Action</h1>
      <button onClick={test} className="px-4 py-2 bg-blue-500 text-white rounded">Test registerAction</button>
      {result && <p className="mt-4 text-green-600">✅ {result}</p>}
      {error && <p className="mt-4 text-red-600">❌ {error}</p>}
    </div>
  )
}