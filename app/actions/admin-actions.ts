"use server"

import { logger } from "@/lib/logging/enhanced-logger"
import fs from "fs"
import path from "path"
import { getSupabaseServiceClient } from "@/lib/supabase/client"

/**
 * Server action to initialize RBAC system
 * This keeps the admin token secure on the server
 */
export async function initializeRbacSystem(formData: FormData) {
  try {
    // Get the provided token from the form
    const providedToken = formData.get("adminToken") as string

    // Securely validate the token on the server
    // The actual token is never exposed to the client
    if (!providedToken || providedToken !== process.env.ADMIN_TOKEN) {
      logger.warn("Unauthorized RBAC initialization attempt")
      return {
        success: false,
        error: "Unauthorized. Invalid admin token.",
      }
    }

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "rbac-setup.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL using the Supabase service client
    const supabase = getSupabaseServiceClient()
    const { error } = await supabase.rpc("exec_sql", { sql: sqlContent })

    if (error) {
      logger.error("Failed to initialize RBAC system", { error })
      return {
        success: false,
        error: "Failed to initialize RBAC system: " + error.message,
      }
    }

    logger.info("RBAC system initialized successfully")
    return { success: true }
  } catch (error) {
    logger.error("Error initializing RBAC system", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return {
      success: false,
      error: "Internal server error",
    }
  }
}
