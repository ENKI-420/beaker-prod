import { logger } from "@/lib/logging/enhanced-logger"
import { getGenomicRedisClient } from "@/lib/redis/genomic-redis-client-generic"

// Helper function to safely execute Redis commands
async function safeRedisCommand<T>(command: string, args: any[] = []): Promise<T | null> {
  try {
    const client = await getGenomicRedisClient()

    // Execute the command based on its name
    switch (command) {
      case "info":
        return (await client.info(args[0])) as T
      case "dbsize":
        return (await client.dbSize()) as T
      case "ping":
        return (await client.ping()) as T
      case "keys":
        return (await client.keys(args[0])) as T
      case "type":
        return (await client.type(args[0])) as T
      case "get":
        return (await client.get(args[0])) as T
      case "llen":
        return (await client.lLen(args[0])) as T
      case "scard":
        return (await client.sCard(args[0])) as T
      case "hlen":
        return (await client.hLen(args[0])) as T
      case "zcard":
        return (await client.zCard(args[0])) as T
      default:
        throw new Error(`Unsupported Redis command: ${command}`)
    }
  } catch (error) {
    logger.error(`Error executing Redis command ${command}`, {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    })
    return null
  }
}

// Rest of the file remains the same as the original metrics route
// but uses the safeRedisCommand function for command execution
