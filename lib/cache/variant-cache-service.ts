import { CacheRegion, getCachedData, setCachedData, invalidateCachedData } from "./genomic-cache-service"

/**
 * Variant cache service
 * Specialized caching for genomic variants
 */

export interface VariantIdentifier {
  chromosome: string
  position: number
  reference: string
  alternate: string
}

export interface VariantData {
  id?: string
  chromosome: string
  position: number
  reference: string
  alternate: string
  gene?: string
  type?: string
  clinicalSignificance?: string
  phenotypes?: string[]
  populationFrequency?: Record<string, number>
  impact?: string
  confidence?: number
  annotations?: Record<string, any>
  lastUpdated?: string
}

/**
 * Generate a consistent variant key
 */
export function generateVariantKey(variant: VariantIdentifier): string {
  return `${variant.chromosome}-${variant.position}-${variant.reference}-${variant.alternate}`
}

/**
 * Get variant data from cache
 */
export async function getCachedVariant(variant: VariantIdentifier): Promise<VariantData | null> {
  const variantKey = generateVariantKey(variant)
  return getCachedData<VariantData>(CacheRegion.VARIANT, variantKey)
}

/**
 * Cache variant data
 */
export async function cacheVariant(variant: VariantData, ttl?: number): Promise<boolean> {
  const variantKey = generateVariantKey(variant)
  return setCachedData<VariantData>(CacheRegion.VARIANT, variantKey, variant, undefined, ttl)
}

/**
 * Invalidate cached variant
 */
export async function invalidateVariant(variant: VariantIdentifier): Promise<boolean> {
  const variantKey = generateVariantKey(variant)
  return invalidateCachedData(CacheRegion.VARIANT, variantKey)
}

/**
 * Get variants by gene from cache
 */
export async function getCachedVariantsByGene(gene: string): Promise<VariantData[] | null> {
  return getCachedData<VariantData[]>(CacheRegion.VARIANT, gene, "by-gene")
}

/**
 * Cache variants by gene
 */
export async function cacheVariantsByGene(gene: string, variants: VariantData[], ttl?: number): Promise<boolean> {
  return setCachedData<VariantData[]>(CacheRegion.VARIANT, gene, variants, "by-gene", ttl)
}

/**
 * Invalidate cached variants by gene
 */
export async function invalidateVariantsByGene(gene: string): Promise<boolean> {
  return invalidateCachedData(CacheRegion.VARIANT, gene, "by-gene")
}

export default {
  generateVariantKey,
  getCachedVariant,
  cacheVariant,
  invalidateVariant,
  getCachedVariantsByGene,
  cacheVariantsByGene,
  invalidateVariantsByGene,
}
