import { CacheRegion, getCachedData, setCachedData, invalidateCachedData } from "./genomic-cache-service"

/**
 * Patient genomic data cache service
 * Specialized caching for patient genomic data
 */

export interface PatientGenomicData {
  patientId: string
  sampleId?: string
  collectionDate?: string
  variants: any[]
  metadata?: Record<string, any>
  lastUpdated?: string
}

export interface AnalysisResult {
  id: string
  patientId: string
  timestamp: string
  status: string
  results: Record<string, any>
}

/**
 * Get patient genomic data from cache
 */
export async function getCachedPatientGenomicData(patientId: string): Promise<PatientGenomicData | null> {
  return getCachedData<PatientGenomicData>(CacheRegion.PATIENT, patientId, "genomic")
}

/**
 * Cache patient genomic data
 */
export async function cachePatientGenomicData(data: PatientGenomicData, ttl?: number): Promise<boolean> {
  return setCachedData<PatientGenomicData>(CacheRegion.PATIENT, data.patientId, data, "genomic", ttl)
}

/**
 * Invalidate cached patient genomic data
 */
export async function invalidatePatientGenomicData(patientId: string): Promise<boolean> {
  return invalidateCachedData(CacheRegion.PATIENT, patientId, "genomic")
}

/**
 * Get patient analysis result from cache
 */
export async function getCachedAnalysisResult(analysisId: string): Promise<AnalysisResult | null> {
  return getCachedData<AnalysisResult>(CacheRegion.ANALYSIS, analysisId)
}

/**
 * Cache patient analysis result
 */
export async function cacheAnalysisResult(result: AnalysisResult, ttl?: number): Promise<boolean> {
  return setCachedData<AnalysisResult>(CacheRegion.ANALYSIS, result.id, result, undefined, ttl)
}

/**
 * Invalidate cached analysis result
 */
export async function invalidateAnalysisResult(analysisId: string): Promise<boolean> {
  return invalidateCachedData(CacheRegion.ANALYSIS, analysisId)
}

/**
 * Get patient analysis results by patient ID from cache
 */
export async function getCachedAnalysisResultsByPatient(patientId: string): Promise<AnalysisResult[] | null> {
  return getCachedData<AnalysisResult[]>(CacheRegion.ANALYSIS, patientId, "by-patient")
}

/**
 * Cache patient analysis results by patient ID
 */
export async function cacheAnalysisResultsByPatient(
  patientId: string,
  results: AnalysisResult[],
  ttl?: number,
): Promise<boolean> {
  return setCachedData<AnalysisResult[]>(CacheRegion.ANALYSIS, patientId, results, "by-patient", ttl)
}

/**
 * Invalidate cached analysis results by patient ID
 */
export async function invalidateAnalysisResultsByPatient(patientId: string): Promise<boolean> {
  return invalidateCachedData(CacheRegion.ANALYSIS, patientId, "by-patient")
}

export default {
  getCachedPatientGenomicData,
  cachePatientGenomicData,
  invalidatePatientGenomicData,
  getCachedAnalysisResult,
  cacheAnalysisResult,
  invalidateAnalysisResult,
  getCachedAnalysisResultsByPatient,
  cacheAnalysisResultsByPatient,
  invalidateAnalysisResultsByPatient,
}
