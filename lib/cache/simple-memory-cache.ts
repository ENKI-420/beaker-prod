import { logger } from "../logging/enhanced-logger"

// Simple in-memory cache with Map
const cache = new Map<string, { value: any; expiry: number | null }>()

/**
 * Sets a value in the cache with optional TTL
 */
export function cacheSet<T>(key: string, value: T, ttlSeconds?: number): boolean {
  try {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
    cache.set(key, { value, expiry })
    return true
  } catch (error) {
    logger.error("Error setting cache value", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * Gets a value from the cache
 */
export function cacheGet<T>(key: string): T | null {
  try {
    const entry = cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      cache.delete(key)
      return null
    }

    return entry.value as T
  } catch (error) {
    logger.error("Error getting cache value", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

/**
 * Deletes a value from the cache
 */
export function cacheDelete(key: string): boolean {
  try {
    return cache.delete(key)
  } catch (error) {
    logger.error("Error deleting cache value", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * Gets cache statistics
 */
export function cacheStats(): Record<string, any> {
  try {
    const now = Date.now()
    let activeItems = 0
    let expiredItems = 0

    for (const entry of cache.values()) {
      if (entry.expiry === null || entry.expiry >= now) {
        activeItems++
      } else {
        expiredItems++
      }
    }

    return {
      totalItems: cache.size,
      activeItems,
      expiredItems,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    logger.error("Error getting cache stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return {
      totalItems: 0,
      activeItems: 0,
      expiredItems: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Cleans up expired keys
 */
export function cleanupExpiredKeys(): number {
  try {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of cache.entries()) {
      if (entry.expiry !== null && entry.expiry < now) {
        cache.delete(key)
        removedCount++
      }
    }

    return removedCount
  } catch (error) {
    logger.error("Error cleaning up expired keys", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return 0
  }
}

export default {
  set: cacheSet,
  get: cacheGet,
  delete: cacheDelete,
  stats: cacheStats,
  cleanup: cleanupExpiredKeys,
}
