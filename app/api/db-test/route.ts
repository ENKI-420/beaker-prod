import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { logger } from "@/lib/logging/enhanced-logger"

export async function GET() {
  try {
    logger.info("DB test route called")

    // Check for required environment variable
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }

    // Create a SQL client using the DATABASE_URL environment variable
    const sql = neon(process.env.DATABASE_URL)

    // Test the connection with a simple query
    const result = await sql`SELECT NOW() as time`

    return NextResponse.json({
      status: "connected",
      timestamp: new Date().toISOString(),
      serverTime: result[0]?.time,
      message: "Database connection successful",
    })
  } catch (error) {
    logger.error("Database connection error", { error: String(error) })

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
