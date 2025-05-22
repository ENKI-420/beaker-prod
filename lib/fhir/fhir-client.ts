/**
 * FHIR Client Module
 * Provides standardized access to FHIR resources from various FHIR servers
 * Supports Epic, Cerner, and other FHIR-compliant systems
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { createAuthenticationError, createNetworkError } from "@/lib/error/error-handler"

// FHIR API configuration
const FHIR_BASE_URL = process.env.FHIR_BASE_URL || "https://api.example.com/fhir/r4"
const FHIR_CLIENT_ID = process.env.FHIR_CLIENT_ID
const FHIR_CLIENT_SECRET = process.env.FHIR_CLIENT_SECRET

// Token cache
let cachedToken: {
  access_token: string
  expires_at: number
} | null = null

/**
 * FHIR Resource Types
 */
export enum FhirResourceType {
  PATIENT = "Patient",
  OBSERVATION = "Observation",
  CONDITION = "Condition",
  MEDICATION_STATEMENT = "MedicationStatement",
  MEDICATION_REQUEST = "MedicationRequest",
  DIAGNOSTIC_REPORT = "DiagnosticReport",
  PROCEDURE = "Procedure",
  IMMUNIZATION = "Immunization",
  ALLERGY_INTOLERANCE = "AllergyIntolerance",
  ENCOUNTER = "Encounter",
  CARE_PLAN = "CarePlan",
  GOAL = "Goal",
  SPECIMEN = "Specimen",
  SEQUENCE = "Sequence",
  MOLECULAR_SEQUENCE = "MolecularSequence",
  GENOMIC_STUDY = "GenomicStudy",
}

/**
 * FHIR Search Parameters
 */
export interface FhirSearchParams {
  _count?: number
  _sort?: string
  _include?: string | string[]
  _revinclude?: string | string[]
  [key: string]: any
}

/**
 * FHIR Resource Interface
 */
export interface FhirResource {
  resourceType: string
  id: string
  meta?: {
    versionId?: string
    lastUpdated?: string
  }
  [key: string]: any
}

/**
 * FHIR Bundle Interface
 */
export interface FhirBundle {
  resourceType: "Bundle"
  type: string
  total?: number
  link?: Array<{
    relation: string
    url: string
  }>
  entry?: Array<{
    resource: FhirResource
    search?: {
      mode?: string
      score?: number
    }
  }>
}

/**
 * FHIR Patient Interface
 */
export interface FhirPatient extends FhirResource {
  resourceType: "Patient"
  name?: Array<{
    family?: string
    given?: string[]
    prefix?: string[]
    suffix?: string[]
    text?: string
  }>
  gender?: string
  birthDate?: string
  address?: Array<{
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  telecom?: Array<{
    system?: string
    value?: string
    use?: string
  }>
  identifier?: Array<{
    system?: string
    value?: string
    type?: {
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }
  }>
  active?: boolean
  deceasedBoolean?: boolean
  deceasedDateTime?: string
  maritalStatus?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  communication?: Array<{
    language?: {
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }
    preferred?: boolean
  }>
}

/**
 * FHIR Observation Interface
 */
export interface FhirObservation extends FhirResource {
  resourceType: "Observation"
  status: string
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  code: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject: {
    reference: string
  }
  effectiveDateTime?: string
  effectivePeriod?: {
    start?: string
    end?: string
  }
  issued?: string
  valueQuantity?: {
    value?: number
    unit?: string
    system?: string
    code?: string
  }
  valueString?: string
  valueBoolean?: boolean
  valueInteger?: number
  valueCodeableConcept?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  interpretation?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }>
  referenceRange?: Array<{
    low?: {
      value?: number
      unit?: string
    }
    high?: {
      value?: number
      unit?: string
    }
    text?: string
  }>
}

/**
 * FHIR Condition Interface
 */
export interface FhirCondition extends FhirResource {
  resourceType: "Condition"
  clinicalStatus?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  verificationStatus?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  severity?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  code?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject: {
    reference: string
  }
  onsetDateTime?: string
  onsetPeriod?: {
    start?: string
    end?: string
  }
  abatementDateTime?: string
  abatementString?: string
  recordedDate?: string
  recorder?: {
    reference?: string
    display?: string
  }
  asserter?: {
    reference?: string
    display?: string
  }
  note?: Array<{
    text?: string
  }>
}

/**
 * FHIR DiagnosticReport Interface
 */
export interface FhirDiagnosticReport extends FhirResource {
  resourceType: "DiagnosticReport"
  status: string
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  code: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject: {
    reference: string
  }
  effectiveDateTime?: string
  issued?: string
  performer?: Array<{
    reference?: string
    display?: string
  }>
  result?: Array<{
    reference: string
  }>
  presentedForm?: Array<{
    contentType?: string
    language?: string
    data?: string
    url?: string
    title?: string
  }>
}

/**
 * Get an OAuth token for FHIR API authentication
 */
async function getFhirToken(): Promise<string> {
  try {
    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expires_at > Date.now()) {
      return cachedToken.access_token
    }

    // Validate required credentials
    if (!FHIR_CLIENT_ID || !FHIR_CLIENT_SECRET) {
      throw createAuthenticationError("Missing FHIR API credentials")
    }

    // Request new token
    const response = await fetch(`${FHIR_BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: FHIR_CLIENT_ID,
        client_secret: FHIR_CLIENT_SECRET,
        scope: "patient/*.read",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw createAuthenticationError(`Failed to obtain FHIR token: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    // Cache the token with expiration
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute for safety
    }

    return cachedToken.access_token
  } catch (error) {
    logger.error("FHIR authentication error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Make an authenticated request to the FHIR API
 */
async function fhirRequest<T>(
  endpoint: string,
  method = "GET",
  body?: any,
  additionalHeaders: Record<string, string> = {},
): Promise<T> {
  try {
    const token = await getFhirToken()

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
      ...additionalHeaders,
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    const response = await fetch(`${FHIR_BASE_URL}${endpoint}`, requestOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw createNetworkError(`FHIR API error: ${errorData.message || response.statusText}`, {
        status: response.status,
        endpoint,
      })
    }

    return await response.json()
  } catch (error) {
    logger.error("FHIR API request failed", {
      endpoint,
      method,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Build a FHIR search URL with parameters
 */
function buildSearchUrl(resourceType: FhirResourceType, params: FhirSearchParams = {}): string {
  const url = new URL(`${FHIR_BASE_URL}/${resourceType}`)

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v.toString()))
    } else if (value !== undefined) {
      url.searchParams.append(key, value.toString())
    }
  })

  return url.pathname + url.search
}

/**
 * Get a FHIR resource by ID
 */
export async function getFhirResourceById<T extends FhirResource>(
  resourceType: FhirResourceType,
  id: string,
): Promise<T> {
  logger.info("Fetching FHIR resource", { resourceType, id })
  return fhirRequest<T>(`/${resourceType}/${id}`)
}

/**
 * Search for FHIR resources
 */
export async function searchFhirResources<T extends FhirResource>(
  resourceType: FhirResourceType,
  params: FhirSearchParams = {},
): Promise<FhirBundle> {
  logger.info("Searching FHIR resources", { resourceType, params })
  const searchUrl = buildSearchUrl(resourceType, params)
  return fhirRequest<FhirBundle>(searchUrl)
}

/**
 * Get a patient by ID
 */
export async function getPatient(id: string): Promise<FhirPatient> {
  return getFhirResourceById<FhirPatient>(FhirResourceType.PATIENT, id)
}

/**
 * Search for patients
 */
export async function searchPatients(params: FhirSearchParams = {}): Promise<FhirBundle> {
  return searchFhirResources(FhirResourceType.PATIENT, params)
}

/**
 * Get observations for a patient
 */
export async function getPatientObservations(patientId: string, params: FhirSearchParams = {}): Promise<FhirBundle> {
  return searchFhirResources(FhirResourceType.OBSERVATION, {
    patient: patientId,
    ...params,
  })
}

/**
 * Get conditions for a patient
 */
export async function getPatientConditions(patientId: string, params: FhirSearchParams = {}): Promise<FhirBundle> {
  return searchFhirResources(FhirResourceType.CONDITION, {
    patient: patientId,
    ...params,
  })
}

/**
 * Get medication statements for a patient
 */
export async function getPatientMedicationStatements(
  patientId: string,
  params: FhirSearchParams = {},
): Promise<FhirBundle> {
  return searchFhirResources(FhirResourceType.MEDICATION_STATEMENT, {
    patient: patientId,
    ...params,
  })
}

/**
 * Get diagnostic reports for a patient
 */
export async function getPatientDiagnosticReports(
  patientId: string,
  params: FhirSearchParams = {},
): Promise<FhirBundle> {
  return searchFhirResources(FhirResourceType.DIAGNOSTIC_REPORT, {
    patient: patientId,
    ...params,
  })
}

/**
 * Get genomic studies for a patient
 */
export async function getPatientGenomicStudies(patientId: string, params: FhirSearchParams = {}): Promise<FhirBundle> {
  return searchFhirResources(FhirResourceType.GENOMIC_STUDY, {
    patient: patientId,
    ...params,
  })
}

export default {
  getPatient,
  searchPatients,
  getPatientObservations,
  getPatientConditions,
  getPatientMedicationStatements,
  getPatientDiagnosticReports,
  getPatientGenomicStudies,
  getFhirResourceById,
  searchFhirResources,
}
