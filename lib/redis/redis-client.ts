import { Redis } from "@upstash/redis"
import { logger } from "../logging/enhanced-logger"

// Singleton instance
let redisInstance: Redis | null = null

/**
 * Configuration options for Redis client
 */
interface RedisConfig {
  url?: string
  token?: string
}

/**
 * Creates and returns a Redis client
 * Uses singleton pattern to prevent multiple instances
 */
export function getRedisClient(config?: RedisConfig): Redis {
  if (redisInstance) return redisInstance

  try {
    const url = config?.url || process.env.KV_REST_API_URL || process.env.KV_URL || process.env.REDIS_URL
    const token = config?.token || process.env.KV_REST_API_TOKEN

    if (!url || !token) {
      throw new Error("Missing required Redis environment variables")
    }

    redisInstance = new Redis({
      url,
      token,
    })

    logger.info("Redis client initialized successfully")
    return redisInstance
  } catch (error) {
    logger.error("Failed to initialize Redis client", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Sets a value in Redis with optional expiration
 * @param key Key to set
 * @param value Value to store
 * @param expireInSeconds Optional TTL in seconds
 * @returns Success status
 */
export async function redisSet<T>(key: string, value: T, expireInSeconds?: number): Promise<boolean> {
  try {
    const redis = getRedisClient()

    if (expireInSeconds) {
      await redis.set(key, value, { ex: expireInSeconds })
    } else {
      await redis.set(key, value)
    }

    logger.debug("Redis SET operation successful", { key })
    return true
  } catch (error) {
    logger.error("Redis SET operation failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * Gets a value from Redis
 * @param key Key to retrieve
 * @returns Value or null if not found
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient()
    const value = (await redis.get(key)) as T

    logger.debug("Redis GET operation successful", { key })
    return value
  } catch (error) {
    logger.error("Redis GET operation failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

/**
 * Deletes a key from Redis
 * @param key Key to delete
 * @returns Success status
 */
export async function redisDel(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    await redis.del(key)

    logger.debug("Redis DEL operation successful", { key })
    return true
  } catch (error) {
    logger.error("Redis DEL operation failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * Tests the Redis connection
 * @returns Success status
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const result = await redis.ping()

    logger.info("Redis connection test successful", { result })
    return result === "PONG"
  } catch (error) {
    logger.error("Redis connection test failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

export default {
  getClient: getRedisClient,
  set: redisSet,
  get: redisGet,
  del: redisDel,
  testConnection: testRedisConnection,
}
