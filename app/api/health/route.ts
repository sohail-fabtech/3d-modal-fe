import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    return NextResponse.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    console.error("Error in Health API route:", error)
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
