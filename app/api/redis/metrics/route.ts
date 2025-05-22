import { type NextRequest, NextResponse } from "next/server"
import RedisPoolMonitor from "@/lib/redis/redis-pool-monitor"
import { logger } from "@/lib/logging/enhanced-logger"
import { getRedisClient } from "@/lib/redis/genomic-redis-client"

// Helper function to safely execute Redis commands
async function safeRedisCommand<T>(command: string, args: any[] = []): Promise<T | null> {
  try {
    const client = await getRedisClient()
    // @ts-ignore - Using dynamic command execution
    return await client[command](...args)
  } catch (error) {
    logger.error(`Error executing Redis command ${command}`, {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    })
    return null
  }
}

// Get memory stats from Redis INFO command
async function getMemoryStats() {
  try {
    const info = await safeRedisCommand<string>("info", ["memory"])
    if (!info) return null

    const memoryUsed = info.match(/used_memory:(\d+)/)?.[1]
    const memoryPeak = info.match(/used_memory_peak:(\d+)/)?.[1]
    const memoryRss = info.match(/used_memory_rss:(\d+)/)?.[1]
    const memoryFragmentationRatio = info.match(/mem_fragmentation_ratio:([0-9.]+)/)?.[1]

    return {
      memoryUsed: memoryUsed ? Number.parseInt(memoryUsed) : 0,
      memoryPeak: memoryPeak ? Number.parseInt(memoryPeak) : 0,
      memoryRss: memoryRss ? Number.parseInt(memoryRss) : 0,
      memoryFragmentationRatio: memoryFragmentationRatio ? Number.parseFloat(memoryFragmentationRatio) : 0,
    }
  } catch (error) {
    logger.error("Error parsing Redis memory stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

// Get stats about keys and expirations
async function getKeyspaceStats() {
  try {
    const info = await safeRedisCommand<string>("info", ["keyspace"])
    const dbStats: Record<string, any> = {}

    if (info) {
      const dbMatches = info.matchAll(/db(\d+):keys=(\d+),expires=(\d+),avg_ttl=(\d+)/g)
      for (const match of dbMatches) {
        const [, db, keys, expires, avgTtl] = match
        dbStats[`db${db}`] = {
          keys: Number.parseInt(keys),
          expires: Number.parseInt(expires),
          avgTtl: Number.parseInt(avgTtl),
        }
      }
    }

    // Get total key count
    const keyCount = await safeRedisCommand<number>("dbsize")

    return {
      totalKeys: keyCount || 0,
      databases: dbStats,
    }
  } catch (error) {
    logger.error("Error getting Redis keyspace stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

// Get operation stats
async function getOperationStats() {
  try {
    const info = await safeRedisCommand<string>("info", ["stats"])
    if (!info) return null

    const totalCommands = info.match(/total_commands_processed:(\d+)/)?.[1]
    const opsPerSecond = info.match(/instantaneous_ops_per_sec:(\d+)/)?.[1]
    const keyspaceMisses = info.match(/keyspace_misses:(\d+)/)?.[1]
    const keyspaceHits = info.match(/keyspace_hits:(\d+)/)?.[1]

    const hitRate =
      keyspaceHits && keyspaceMisses
        ? Number.parseInt(keyspaceHits) / (Number.parseInt(keyspaceHits) + Number.parseInt(keyspaceMisses))
        : 0

    return {
      totalCommands: totalCommands ? Number.parseInt(totalCommands) : 0,
      opsPerSecond: opsPerSecond ? Number.parseInt(opsPerSecond) : 0,
      keyspaceHits: keyspaceHits ? Number.parseInt(keyspaceHits) : 0,
      keyspaceMisses: keyspaceMisses ? Number.parseInt(keyspaceMisses) : 0,
      hitRate: hitRate,
    }
  } catch (error) {
    logger.error("Error getting Redis operation stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

// Get latency metrics by running a simple ping test
async function getLatencyMetrics(samples = 5) {
  try {
    const latencies: number[] = []

    for (let i = 0; i < samples; i++) {
      const start = performance.now()
      await safeRedisCommand("ping")
      const end = performance.now()
      latencies.push(end - start)
    }

    const avgLatency = latencies.reduce((sum, val) => sum + val, 0) / latencies.length
    const minLatency = Math.min(...latencies)
    const maxLatency = Math.max(...latencies)

    return {
      avgLatencyMs: avgLatency,
      minLatencyMs: minLatency,
      maxLatencyMs: maxLatency,
      samples: latencies,
    }
  } catch (error) {
    logger.error("Error measuring Redis latency", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

// Get client connection stats
async function getClientStats() {
  try {
    const info = await safeRedisCommand<string>("info", ["clients"])
    if (!info) return null

    const connectedClients = info.match(/connected_clients:(\d+)/)?.[1]
    const blockedClients = info.match(/blocked_clients:(\d+)/)?.[1]
    const maxClients = info.match(/maxclients:(\d+)/)?.[1]

    return {
      connectedClients: connectedClients ? Number.parseInt(connectedClients) : 0,
      blockedClients: blockedClients ? Number.parseInt(blockedClients) : 0,
      maxClients: maxClients ? Number.parseInt(maxClients) : 0,
    }
  } catch (error) {
    logger.error("Error getting Redis client stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

// Get top keys by memory usage (simulated for Upstash)
async function getTopKeys(limit = 10) {
  try {
    // For Upstash, we can't use SCAN or MEMORY USAGE, so we'll simulate this
    // In a real Redis instance, you would use SCAN with MEMORY USAGE
    const keys = await safeRedisCommand<string[]>("keys", ["*"])
    if (!keys || keys.length === 0) return []

    // Get a sample of keys (up to the limit)
    const sampleKeys = keys.slice(0, Math.min(limit, keys.length))

    // Get the type and size of each key
    const keyStats = await Promise.all(
      sampleKeys.map(async (key) => {
        const type = await safeRedisCommand<string>("type", [key])
        let size = 0

        // Estimate size based on key type
        if (type === "string") {
          const value = await safeRedisCommand<string>("get", [key])
          size = value ? Buffer.from(value).length : 0
        } else if (type === "list") {
          const length = await safeRedisCommand<number>("llen", [key])
          size = length || 0
        } else if (type === "set") {
          const members = await safeRedisCommand<number>("scard", [key])
          size = members || 0
        } else if (type === "hash") {
          const fields = await safeRedisCommand<number>("hlen", [key])
          size = fields || 0
        } else if (type === "zset") {
          const members = await safeRedisCommand<number>("zcard", [key])
          size = members || 0
        }

        return {
          key,
          type,
          size,
        }
      }),
    )

    // Sort by estimated size
    return keyStats.sort((a, b) => b.size - a.size)
  } catch (error) {
    logger.error("Error getting top Redis keys", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const includePool = searchParams.get("includePool") !== "false"
    const includeMemory = searchParams.get("includeMemory") !== "false"
    const includeKeyspace = searchParams.get("includeKeyspace") !== "false"
    const includeOperations = searchParams.get("includeOperations") !== "false"
    const includeLatency = searchParams.get("includeLatency") !== "false"
    const includeClients = searchParams.get("includeClients") !== "false"
    const includeTopKeys = searchParams.get("includeTopKeys") !== "false"

    // Collect metrics in parallel
    const results = await Promise.allSettled([
      includePool ? RedisPoolMonitor.getInstance().getLatestStats() : Promise.resolve(null),
      includeMemory ? getMemoryStats() : Promise.resolve(null),
      includeKeyspace ? getKeyspaceStats() : Promise.resolve(null),
      includeOperations ? getOperationStats() : Promise.resolve(null),
      includeLatency ? getLatencyMetrics() : Promise.resolve(null),
      includeClients ? getClientStats() : Promise.resolve(null),
      includeTopKeys ? getTopKeys() : Promise.resolve(null),
    ])

    // Extract results
    const [poolStats, memoryStats, keyspaceStats, operationStats, latencyMetrics, clientStats, topKeys] = results.map(
      (result) => (result.status === "fulfilled" ? result.value : null),
    )

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      metrics: {
        pool: poolStats,
        memory: memoryStats,
        keyspace: keyspaceStats,
        operations: operationStats,
        latency: latencyMetrics,
        clients: clientStats,
        topKeys: topKeys,
      },
    })
  } catch (error) {
    logger.error("Error in Redis metrics API", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
