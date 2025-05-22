import { CacheRegion, getCachedData, setCachedData, invalidateCachedData } from "./genomic-cache-service"

/**
 * Reference data cache service
 * Specialized caching for genomic reference data
 */

export interface GeneInfo {
  symbol: string
  name: string
  chromosome: string
  start: number
  end: number
  strand: string
  type: string
  aliases?: string[]
  description?: string
  externalIds?: Record<string, string>
}

export interface PathwayInfo {
  id: string
  name: string
  source: string
  genes: string[]
  description?: string
  url?: string
}

export interface PopulationFrequency {
  population: string
  frequency: number
  sampleSize?: number
  source?: string
}

/**
 * Get gene information from cache
 */
export async function getCachedGeneInfo(geneSymbol: string): Promise<GeneInfo | null> {
  return getCachedData<GeneInfo>(CacheRegion.REFERENCE, geneSymbol, "gene")
}

/**
 * Cache gene information
 */
export async function cacheGeneInfo(geneInfo: GeneInfo, ttl?: number): Promise<boolean> {
  return setCachedData<GeneInfo>(CacheRegion.REFERENCE, geneInfo.symbol, geneInfo, "gene", ttl)
}

/**
 * Invalidate cached gene information
 */
export async function invalidateGeneInfo(geneSymbol: string): Promise<boolean> {
  return invalidateCachedData(CacheRegion.REFERENCE, geneSymbol, "gene")
}

/**
 * Get pathway information from cache
 */
export async function getCachedPathwayInfo(pathwayId: string): Promise<PathwayInfo | null> {
  return getCachedData<PathwayInfo>(CacheRegion.REFERENCE, pathwayId, "pathway")
}

/**
 * Cache pathway information
 */
export async function cachePathwayInfo(pathwayInfo: PathwayInfo, ttl?: number): Promise<boolean> {
  return setCachedData<PathwayInfo>(CacheRegion.REFERENCE, pathwayInfo.id, pathwayInfo, "pathway", ttl)
}

/**
 * Invalidate cached pathway information
 */
export async function invalidatePathwayInfo(pathwayId: string): Promise<boolean> {
  return invalidateCachedData(CacheRegion.REFERENCE, pathwayId, "pathway")
}

/**
 * Get pathways by gene from cache
 */
export async function getCachedPathwaysByGene(geneSymbol: string): Promise<PathwayInfo[] | null> {
  return getCachedData<PathwayInfo[]>(CacheRegion.REFERENCE, geneSymbol, "pathways-by-gene")
}

/**
 * Cache pathways by gene
 */
export async function cachePathwaysByGene(geneSymbol: string, pathways: PathwayInfo[], ttl?: number): Promise<boolean> {
  return setCachedData<PathwayInfo[]>(CacheRegion.REFERENCE, geneSymbol, pathways, "pathways-by-gene", ttl)
}

/**
 * Get population frequency data from cache
 */
export async function getCachedPopulationFrequency(
  variantKey: string,
  source = "gnomAD",
): Promise<PopulationFrequency[] | null> {
  return getCachedData<PopulationFrequency[]>(CacheRegion.POPULATION, variantKey, source)
}

/**
 * Cache population frequency data
 */
export async function cachePopulationFrequency(
  variantKey: string,
  frequencies: PopulationFrequency[],
  source = "gnomAD",
  ttl?: number,
): Promise<boolean> {
  return setCachedData<PopulationFrequency[]>(CacheRegion.POPULATION, variantKey, frequencies, source, ttl)
}

export default {
  getCachedGeneInfo,
  cacheGeneInfo,
  invalidateGeneInfo,
  getCachedPathwayInfo,
  cachePathwayInfo,
  invalidatePathwayInfo,
  getCachedPathwaysByGene,
  cachePathwaysByGene,
  getCachedPopulationFrequency,
  cachePopulationFrequency,
}
