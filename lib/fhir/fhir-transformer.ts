/**
 * FHIR Data Transformer
 * Utilities for transforming FHIR resources into formats suitable for the AIDEN AI engine
 * and internal application use
 */

import type {
  FhirPatient,
  FhirObservation,
  FhirCondition,
  FhirDiagnosticReport,
  FhirBundle,
} from "@/lib/fhir/fhir-client"

/**
 * Patient summary interface for internal use
 */
export interface PatientSummary {
  id: string
  name: string
  gender?: string
  birthDate?: string
  age?: number
  address?: string
  phone?: string
  email?: string
  identifiers: Array<{
    system: string
    value: string
    type?: string
  }>
  active: boolean
  deceased?: boolean
  deceasedDate?: string
}

/**
 * Observation summary interface for internal use
 */
export interface ObservationSummary {
  id: string
  date: string
  code: string
  display: string
  value?: string | number | boolean
  unit?: string
  interpretation?: string
  category?: string
  status: string
  referenceRanges?: Array<{
    low?: number
    high?: number
    unit?: string
    text?: string
  }>
  abnormal: boolean
}

/**
 * Condition summary interface for internal use
 */
export interface ConditionSummary {
  id: string
  code: string
  display: string
  category?: string
  clinicalStatus?: string
  verificationStatus?: string
  severity?: string
  onsetDate?: string
  abatementDate?: string
  recordedDate?: string
  active: boolean
  notes?: string[]
}

/**
 * Diagnostic report summary interface for internal use
 */
export interface DiagnosticReportSummary {
  id: string
  code: string
  display: string
  status: string
  category?: string
  effectiveDate?: string
  issued?: string
  results?: ObservationSummary[]
  hasAttachments: boolean
  attachmentUrls?: string[]
}

/**
 * Patient health record interface for internal use
 */
export interface PatientHealthRecord {
  patient: PatientSummary
  observations: ObservationSummary[]
  conditions: ConditionSummary[]
  diagnosticReports: DiagnosticReportSummary[]
  medications: any[]
  procedures: any[]
  immunizations: any[]
  allergies: any[]
}

/**
 * Transform a FHIR Patient resource to a PatientSummary
 */
export function transformPatient(patient: FhirPatient): PatientSummary {
  // Calculate age if birthDate is available
  let age: number | undefined
  if (patient.birthDate) {
    const birthDate = new Date(patient.birthDate)
    const today = new Date()
    age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
  }

  // Get the primary name
  const primaryName = patient.name?.[0]
  const name = primaryName
    ? [primaryName.prefix?.join(" "), primaryName.given?.join(" "), primaryName.family, primaryName.suffix?.join(" ")]
        .filter(Boolean)
        .join(" ")
    : "Unknown"

  // Get the primary address
  const primaryAddress = patient.address?.[0]
  const address = primaryAddress
    ? [
        primaryAddress.line?.join(" "),
        primaryAddress.city,
        primaryAddress.state,
        primaryAddress.postalCode,
        primaryAddress.country,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined

  // Get contact information
  const phone = patient.telecom?.find((t) => t.system === "phone")?.value
  const email = patient.telecom?.find((t) => t.system === "email")?.value

  // Get identifiers
  const identifiers = (patient.identifier || []).map((id) => ({
    system: id.system || "unknown",
    value: id.value || "unknown",
    type: id.type?.coding?.[0]?.display,
  }))

  return {
    id: patient.id,
    name,
    gender: patient.gender,
    birthDate: patient.birthDate,
    age,
    address,
    phone,
    email,
    identifiers,
    active: patient.active !== false, // Default to true if not specified
    deceased: patient.deceasedBoolean || !!patient.deceasedDateTime,
    deceasedDate: patient.deceasedDateTime,
  }
}

/**
 * Transform a FHIR Observation resource to an ObservationSummary
 */
export function transformObservation(observation: FhirObservation): ObservationSummary {
  // Get the primary code
  const primaryCode = observation.code.coding?.[0]
  const code = primaryCode?.code || "unknown"
  const display = primaryCode?.display || observation.code.text || "Unknown Observation"

  // Get the value
  let value: string | number | boolean | undefined
  let unit: string | undefined

  if (observation.valueQuantity) {
    value = observation.valueQuantity.value
    unit = observation.valueQuantity.unit
  } else if (observation.valueString !== undefined) {
    value = observation.valueString
  } else if (observation.valueBoolean !== undefined) {
    value = observation.valueBoolean
  } else if (observation.valueInteger !== undefined) {
    value = observation.valueInteger
  } else if (observation.valueCodeableConcept) {
    value = observation.valueCodeableConcept.text || observation.valueCodeableConcept.coding?.[0]?.display
  }

  // Get the interpretation
  const interpretation = observation.interpretation?.[0]?.text || observation.interpretation?.[0]?.coding?.[0]?.display

  // Get the category
  const category = observation.category?.[0]?.coding?.[0]?.display

  // Get the reference ranges
  const referenceRanges = observation.referenceRange?.map((range) => ({
    low: range.low?.value,
    high: range.high?.value,
    unit: range.low?.unit || range.high?.unit,
    text: range.text,
  }))

  // Determine if abnormal
  const abnormal = !!interpretation && interpretation.toLowerCase().includes("abnormal")

  // Get the effective date
  const date = observation.effectiveDateTime || observation.effectivePeriod?.start || observation.issued || ""

  return {
    id: observation.id,
    date,
    code,
    display,
    value,
    unit,
    interpretation,
    category,
    status: observation.status,
    referenceRanges,
    abnormal,
  }
}

/**
 * Transform a FHIR Condition resource to a ConditionSummary
 */
export function transformCondition(condition: FhirCondition): ConditionSummary {
  // Get the primary code
  const primaryCode = condition.code?.coding?.[0]
  const code = primaryCode?.code || "unknown"
  const display = primaryCode?.display || condition.code?.text || "Unknown Condition"

  // Get the category
  const category = condition.category?.[0]?.coding?.[0]?.display

  // Get the clinical status
  const clinicalStatus = condition.clinicalStatus?.coding?.[0]?.display

  // Get the verification status
  const verificationStatus = condition.verificationStatus?.coding?.[0]?.display

  // Get the severity
  const severity = condition.severity?.coding?.[0]?.display

  // Get the onset date
  const onsetDate = condition.onsetDateTime || condition.onsetPeriod?.start

  // Get the abatement date
  const abatementDate = condition.abatementDateTime || condition.abatementString

  // Get the recorded date
  const recordedDate = condition.recordedDate

  // Get notes
  const notes = condition.note?.map((n) => n.text).filter(Boolean) as string[]

  // Determine if active
  const active = clinicalStatus?.toLowerCase() === "active"

  return {
    id: condition.id,
    code,
    display,
    category,
    clinicalStatus,
    verificationStatus,
    severity,
    onsetDate,
    abatementDate,
    recordedDate,
    active,
    notes,
  }
}

/**
 * Transform a FHIR DiagnosticReport resource to a DiagnosticReportSummary
 */
export function transformDiagnosticReport(report: FhirDiagnosticReport): DiagnosticReportSummary {
  // Get the primary code
  const primaryCode = report.code.coding?.[0]
  const code = primaryCode?.code || "unknown"
  const display = primaryCode?.display || report.code.text || "Unknown Report"

  // Get the category
  const category = report.category?.[0]?.coding?.[0]?.display

  // Check for attachments
  const hasAttachments = !!report.presentedForm?.length
  const attachmentUrls = report.presentedForm?.map((form) => form.url).filter(Boolean) as string[]

  return {
    id: report.id,
    code,
    display,
    status: report.status,
    category,
    effectiveDate: report.effectiveDateTime,
    issued: report.issued,
    results: [], // This would be populated separately with the actual observations
    hasAttachments,
    attachmentUrls,
  }
}

/**
 * Transform a FHIR Bundle of resources
 */
export function transformBundle<T, R>(bundle: FhirBundle, transformer: (resource: T) => R): R[] {
  return (bundle.entry || [])
    .map((entry) => {
      try {
        return transformer(entry.resource as T)
      } catch (error) {
        console.error("Error transforming resource:", error)
        return null
      }
    })
    .filter(Boolean) as R[]
}

/**
 * Build a complete patient health record from FHIR resources
 */
export async function buildPatientHealthRecord(
  patient: FhirPatient,
  observations: FhirBundle,
  conditions: FhirBundle,
  diagnosticReports: FhirBundle,
): Promise<PatientHealthRecord> {
  // Transform the patient
  const patientSummary = transformPatient(patient)

  // Transform observations
  const observationSummaries = transformBundle<FhirObservation, ObservationSummary>(observations, transformObservation)

  // Transform conditions
  const conditionSummaries = transformBundle<FhirCondition, ConditionSummary>(conditions, transformCondition)

  // Transform diagnostic reports
  const diagnosticReportSummaries = transformBundle<FhirDiagnosticReport, DiagnosticReportSummary>(
    diagnosticReports,
    transformDiagnosticReport,
  )

  // Link observations to diagnostic reports
  diagnosticReportSummaries.forEach((report) => {
    const reportObservations = (diagnosticReports.entry || [])
      .find((entry) => entry.resource.id === report.id)
      ?.resource.result?.map((ref: { reference: string }) => {
        const observationId = ref.reference.split("/").pop()
        return observationSummaries.find((obs) => obs.id === observationId)
      })
      .filter(Boolean)

    if (reportObservations) {
      report.results = reportObservations
    }
  })

  return {
    patient: patientSummary,
    observations: observationSummaries,
    conditions: conditionSummaries,
    diagnosticReports: diagnosticReportSummaries,
    medications: [], // Would be populated with medication data
    procedures: [], // Would be populated with procedure data
    immunizations: [], // Would be populated with immunization data
    allergies: [], // Would be populated with allergy data
  }
}

export default {
  transformPatient,
  transformObservation,
  transformCondition,
  transformDiagnosticReport,
  transformBundle,
  buildPatientHealthRecord,
}
