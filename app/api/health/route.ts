import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the application is healthy
    // This is a simple check that just returns success
    // In a real application, you might check database connections, etc.

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
