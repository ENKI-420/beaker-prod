/**
 * Environment variable configuration
 * Centralizes access to environment variables with proper typing and fallbacks
 */

// Database configuration
export const DATABASE_CONFIG = {
  POSTGRES_URL: process.env.POSTGRES_URL || process.env.DATABASE_URL || "",
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL || "",
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING || "",
  POSTGRES_USER: process.env.POSTGRES_USER || "",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "",
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || "",
  POSTGRES_HOST: process.env.POSTGRES_HOST || "",
}

// Redis/KV configuration
export const REDIS_CONFIG = {
  KV_URL: process.env.KV_URL || process.env.REDIS_URL || "",
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",
  KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN || "",
  KV_REST_API_URL: process.env.KV_REST_API_URL || "",
  REDIS_USERNAME: process.env.REDIS_USERNAME || "",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
  REDIS_TLS: process.env.REDIS_TLS === "true",
}

// Genomic KV configuration
export const GENOMIC_KV_CONFIG = {
  GENOMIC_KV_URL: process.env.GENOMIC_KV_URL || "",
  GENOMIC_REDIS_URL: process.env.GENOMIC_REDIS_URL || "",
  GENOMIC_KV_REST_API_TOKEN: process.env.GENOMIC_KV_REST_API_TOKEN || "",
}

// Supabase configuration
export const SUPABASE_CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || "",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
}

// FHIR configuration
export const FHIR_CONFIG = {
  FHIR_BASE_URL: process.env.FHIR_BASE_URL || "",
  FHIR_AUTH_URL: process.env.FHIR_AUTH_URL || "",
  FHIR_TOKEN_URL: process.env.FHIR_TOKEN_URL || "",
  FHIR_CLIENT_ID: process.env.FHIR_CLIENT_ID || "",
  FHIR_CLIENT_SECRET: process.env.FHIR_CLIENT_SECRET || "",
}

// Aiden configuration
export const AIDEN_CONFIG = {
  AIDEN_API_BASE_URL: process.env.AIDEN_API_BASE_URL || "",
  AIDEN_WS_URL: process.env.AIDEN_WS_URL || "",
  AIDEN_CLIENT_ID: process.env.AIDEN_CLIENT_ID || "",
  AIDEN_CLIENT_SECRET: process.env.AIDEN_CLIENT_SECRET || "",
}

// Blob storage configuration
export const BLOB_CONFIG = {
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
}

// Application configuration
export const APP_CONFIG = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
  NODE_ENV: process.env.NODE_ENV || "development",
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || "",
}

// Validate required environment variables
export function validateRequiredEnvVars(): string[] {
  const missingVars: string[] = []

  // Check for critical environment variables
  if (!DATABASE_CONFIG.POSTGRES_URL) missingVars.push("DATABASE_URL or POSTGRES_URL")
  if (!SUPABASE_CONFIG.SUPABASE_URL) missingVars.push("SUPABASE_URL")
  if (!SUPABASE_CONFIG.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY")
  if (!SUPABASE_CONFIG.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!SUPABASE_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  return missingVars
}

export default {
  DATABASE: DATABASE_CONFIG,
  REDIS: REDIS_CONFIG,
  GENOMIC_KV: GENOMIC_KV_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  FHIR: FHIR_CONFIG,
  AIDEN: AIDEN_CONFIG,
  BLOB: BLOB_CONFIG,
  APP: APP_CONFIG,
  validateRequiredEnvVars,
}
