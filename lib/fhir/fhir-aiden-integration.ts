/**
 * FHIR-AIDEN Integration Module
 * Connects FHIR patient data with the AIDEN AI orchestration engine
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { submitAidenTask, AidenTaskType, AidenTaskPriority } from "@/lib/aiden/aiden-client"
import { submitDataFusion, DataSourceType } from "@/lib/aiden/data-integration"
import fhirClient from "@/lib/fhir/fhir-client"
import fhirTransformer, { type PatientHealthRecord } from "@/lib/fhir/fhir-transformer"

/**
 * FHIR-AIDEN analysis types
 */
export enum FhirAnalysisType {
  CLINICAL_SUMMARY = "clinical_summary",
  RISK_ASSESSMENT = "risk_assessment",
  MEDICATION_REVIEW = "medication_review",
  LAB_TREND_ANALYSIS = "lab_trend_analysis",
  GENOMIC_CORRELATION = "genomic_correlation",
  TREATMENT_RECOMMENDATION = "treatment_recommendation",
  CLINICAL_TRIAL_MATCHING = "clinical_trial_matching",
}

/**
 * Fetch complete patient health record from FHIR
 */
export async function fetchPatientHealthRecord(patientId: string): Promise<PatientHealthRecord> {
  logger.info("Fetching patient health record", { patientId })

  try {
    // Fetch patient data
    const patient = await fhirClient.getPatient(patientId)

    // Fetch related resources
    const [observations, conditions, diagnosticReports] = await Promise.all([
      fhirClient.getPatientObservations(patientId, { _count: 100 }),
      fhirClient.getPatientConditions(patientId, { _count: 100 }),
      fhirClient.getPatientDiagnosticReports(patientId, { _count: 100 }),
    ])

    // Build the complete health record
    const healthRecord = await fhirTransformer.buildPatientHealthRecord(
      patient,
      observations,
      conditions,
      diagnosticReports,
    )

    logger.info("Patient health record fetched successfully", {
      patientId,
      observationCount: healthRecord.observations.length,
      conditionCount: healthRecord.conditions.length,
      reportCount: healthRecord.diagnosticReports.length,
    })

    return healthRecord
  } catch (error) {
    logger.error("Failed to fetch patient health record", {
      patientId,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Submit patient data to AIDEN for analysis
 */
export async function submitPatientDataForAnalysis(
  patientId: string,
  analysisType: FhirAnalysisType,
  options: {
    includeGenomicData?: boolean
    includeMedications?: boolean
    includeAllergies?: boolean
    timeframe?: {
      start: string
      end?: string
    }
    priority?: AidenTaskPriority
  } = {},
) {
  logger.info("Submitting patient data for AIDEN analysis", { patientId, analysisType })

  try {
    // Fetch patient health record
    const healthRecord = await fetchPatientHealthRecord(patientId)

    // Prepare payload for AIDEN
    const payload = {
      patient_id: patientId,
      analysis_type: analysisType,
      patient_summary: healthRecord.patient,
      conditions: healthRecord.conditions,
      observations: healthRecord.observations,
      diagnostic_reports: healthRecord.diagnosticReports,
      options: {
        ...options,
      },
    }

    // Submit to AIDEN for processing
    const result = await submitAidenTask({
      task_type: AidenTaskType.DATA_ANALYSIS,
      priority: options.priority || AidenTaskPriority.MEDIUM,
      payload,
      metadata: {
        source_system: "FHIR_CONNECTOR",
        user_id: "system", // Would be replaced with actual user ID in production
        context: {
          patient_id: patientId,
          analysis_type: analysisType,
        },
      },
    })

    logger.info("Patient data submitted to AIDEN successfully", {
      patientId,
      analysisType,
      taskId: result.task_id,
    })

    return result
  } catch (error) {
    logger.error("Failed to submit patient data to AIDEN", {
      patientId,
      analysisType,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Correlate FHIR data with genomic data
 */
export async function correlateFhirWithGenomicData(
  patientId: string,
  genomicData: any,
  options: {
    includeConditions?: boolean
    includeObservations?: boolean
    includeMedications?: boolean
    timeframe?: {
      start: string
      end?: string
    }
  } = {},
) {
  logger.info("Correlating FHIR data with genomic data", { patientId })

  try {
    // Fetch patient health record
    const healthRecord = await fetchPatientHealthRecord(patientId)

    // Prepare FHIR data for correlation
    const fhirData = {
      patient: healthRecord.patient,
      conditions: options.includeConditions !== false ? healthRecord.conditions : [],
      observations: options.includeObservations !== false ? healthRecord.observations : [],
      medications: options.includeMedications ? healthRecord.medications : [],
    }

    // Submit for data fusion
    const result = await submitDataFusion({
      sources: [
        {
          type: DataSourceType.FHIR,
          data: fhirData,
        },
        {
          type: DataSourceType.GENOMIC,
          data: genomicData,
        },
      ],
      fusion_type: "correlation",
      parameters: {
        correlation_level: "deep",
        include_clinical_significance: true,
        include_pathways: true,
        timeframe: options.timeframe,
      },
    })

    logger.info("FHIR-genomic correlation submitted successfully", {
      patientId,
      fusionId: result.fusion_id,
    })

    return result
  } catch (error) {
    logger.error("Failed to correlate FHIR with genomic data", {
      patientId,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Generate clinical summary from FHIR data
 */
export async function generateClinicalSummary(patientId: string) {
  return submitPatientDataForAnalysis(patientId, FhirAnalysisType.CLINICAL_SUMMARY)
}

/**
 * Generate risk assessment from FHIR data
 */
export async function generateRiskAssessment(patientId: string) {
  return submitPatientDataForAnalysis(patientId, FhirAnalysisType.RISK_ASSESSMENT)
}

/**
 * Generate medication review from FHIR data
 */
export async function generateMedicationReview(patientId: string) {
  return submitPatientDataForAnalysis(patientId, FhirAnalysisType.MEDICATION_REVIEW, {
    includeMedications: true,
    includeAllergies: true,
  })
}

/**
 * Match patient to clinical trials based on FHIR data
 */
export async function matchClinicalTrials(patientId: string) {
  return submitPatientDataForAnalysis(patientId, FhirAnalysisType.CLINICAL_TRIAL_MATCHING, {
    includeGenomicData: true,
    priority: AidenTaskPriority.HIGH,
  })
}

export default {
  fetchPatientHealthRecord,
  submitPatientDataForAnalysis,
  correlateFhirWithGenomicData,
  generateClinicalSummary,
  generateRiskAssessment,
  generateMedicationReview,
  matchClinicalTrials,
  FhirAnalysisType,
}
