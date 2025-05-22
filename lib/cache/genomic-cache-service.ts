import { cacheGet, cacheSet, cacheDelete } from "./simple-memory-cache"
import { logger } from "../logging/enhanced-logger"

// Cache regions enum
export const CacheRegion = {
  VARIANT: "variant",
  PATIENT: "patient",
  ANALYSIS: "analysis",
  REFERENCE: "reference",
  ANNOTATION: "annotation",
  POPULATION: "population",
}

// Default TTL values in seconds
export const DEFAULT_TTL = {
  [CacheRegion.VARIANT]: 86400, // 24 hours
  [CacheRegion.PATIENT]: 3600, // 1 hour
  [CacheRegion.ANALYSIS]: 7200, // 2 hours
  [CacheRegion.REFERENCE]: 604800, // 7 days
  [CacheRegion.ANNOTATION]: 259200, // 3 days
  [CacheRegion.POPULATION]: 604800, // 7 days
}

// Simple stats tracking
const stats = {
  hits: 0,
  misses: 0,
  errors: 0,
}

// Generate a cache key
export function generateCacheKey(region, identifier, subType) {
  const parts = ["cache", region, identifier]
  if (subType) {
    parts.push(subType)
  }
  return parts.join(":")
}

// Get data from cache
export async function getCachedData(region, identifier, subType) {
  const cacheKey = generateCacheKey(region, identifier, subType)

  try {
    const cachedData = cacheGet(cacheKey)

    if (cachedData) {
      stats.hits++
      logger.debug("Cache hit", { region, identifier })
      return cachedData
    }

    stats.misses++
    logger.debug("Cache miss", { region, identifier })
    return null
  } catch (error) {
    stats.errors++
    logger.error("Cache get error", { region, identifier, error: String(error) })
    return null
  }
}

// Set data in cache
export async function setCachedData(region, identifier, data, subType, ttl) {
  const cacheKey = generateCacheKey(region, identifier, subType)
  const effectiveTtl = ttl ?? DEFAULT_TTL[region] ?? 3600

  try {
    cacheSet(cacheKey, data, effectiveTtl)
    logger.debug("Cache set", { region, identifier, ttl: effectiveTtl })
    return true
  } catch (error) {
    logger.error("Cache set error", { region, identifier, error: String(error) })
    return false
  }
}

// Invalidate cached data
export async function invalidateCachedData(region, identifier, subType) {
  const cacheKey = generateCacheKey(region, identifier, subType)

  try {
    cacheDelete(cacheKey)
    logger.debug("Cache invalidated", { region, identifier })
    return true
  } catch (error) {
    logger.error("Cache invalidation error", { region, identifier, error: String(error) })
    return false
  }
}

// Get cache statistics
export function getCacheStats() {
  const total = stats.hits + stats.misses
  const hitRatio = total > 0 ? stats.hits / total : 0

  return {
    hits: stats.hits,
    misses: stats.misses,
    errors: stats.errors,
    hitRatio,
    timestamp: new Date().toISOString(),
  }
}

// Reset cache statistics
export function resetCacheStats() {
  stats.hits = 0
  stats.misses = 0
  stats.errors = 0
}

export default {
  CacheRegion,
  DEFAULT_TTL,
  generateCacheKey,
  getCachedData,
  setCachedData,
  invalidateCachedData,
  getCacheStats,
  resetCacheStats,
}
