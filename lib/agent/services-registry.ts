/**
 * AGENT Clinical AI Services Registry
 * Central registry for all AI services available in the platform
 */

import { logger } from "@/lib/logging/enhanced-logger"

// Service status types
export enum ServiceStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
  DEGRADED = "degraded",
  MAINTENANCE = "maintenance",
}

// Service mode types
export enum ServiceMode {
  ADAPTIVE_PRESENTATION = "Adaptive Live Presentation",
  DATA_AUGMENTATION = "Data Augmentation",
  SECURE_API_SYNC = "Secure API Sync",
  AUTO_DRIVE = "Auto-Drive",
  ROLE_BASED_VIEW = "Role-Based View",
  SECURITY_LAYER = "Security Layer",
  RISK_ASSESSMENT = "Risk Assessment",
  PITCH_KPI_MODE = "Pitch + KPI Mode",
  SESSION_RECORDER = "Session Recorder",
  PROMPT_OPTIMIZATION = "Prompt Optimization",
}

// Service interface
export interface ClinicalAIService {
  id: string
  name: string
  mode: ServiceMode
  description: string
  function: string
  trigger: string
  status: ServiceStatus
  isEnabled: boolean
  requiresAuth: boolean
  icon?: string
  documentation?: string
}

// AGENT Clinical AI Services
export const AGENT_CLINICAL_AI_SERVICES: ClinicalAIService[] = [
  {
    id: "adaptive-presentation",
    name: "AGENT One-Click Adaptive Presentation",
    mode: ServiceMode.ADAPTIVE_PRESENTATION,
    description: "Real-time, stakeholder-aware presentations with adaptive tone and content.",
    function:
      "Delivers context-aware, role-specific presentations with dynamic visuals and psychiatric tone alignment.",
    trigger: "Stakeholder login or 'Start Presentation' click.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "presentation",
    documentation: "/docs/services/adaptive-presentation",
  },
  {
    id: "genomic-data-enrichment",
    name: "Genomic Data Enrichment",
    mode: ServiceMode.DATA_AUGMENTATION,
    description: "Enhances raw genomic lab data using NLP and knowledge graph inference.",
    function:
      "Extracts SNVs, CNVs from Beaker reports, correlates with known diseases, outcomes, and therapy response.",
    trigger: "Lab file upload or integration with Epic FHIR endpoint.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "dna",
    documentation: "/docs/services/genomic-data-enrichment",
  },
  {
    id: "fhir-oauth2-sync",
    name: "FHIR OAuth2 Sandbox Sync",
    mode: ServiceMode.SECURE_API_SYNC,
    description: "OAuth 2.0-based integration with Epic's FHIR Sandbox (Patient + Provider roles).",
    function: "Authenticates with Epic's endpoints, retrieves practitioner/patient data, populates AGENT dashboard.",
    trigger: "OAuth sign-in via test user or production token.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "link",
    documentation: "/docs/services/fhir-oauth2-sync",
  },
  {
    id: "auto-advance-narrator",
    name: "Auto-Advance Narrator",
    mode: ServiceMode.AUTO_DRIVE,
    description: "Hands-free, AI-guided walkthrough of the dashboard or findings.",
    function: "Narrates role-specific insights, highlights anomalies, moves automatically to relevant sections.",
    trigger: "Presentation mode + 'Enable Narration'.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "mic",
    documentation: "/docs/services/auto-advance-narrator",
  },
  {
    id: "mentor-mode",
    name: "Mentor Mode",
    mode: ServiceMode.ROLE_BASED_VIEW,
    description: "Shows educational and advisory perspectives for mentors and protégé feedback loops.",
    function: "Enables features like mentor chat, protégé tagging, session scheduling, and mentor scoring.",
    trigger: "Role = mentor, protégé, or leadership.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "graduation-cap",
    documentation: "/docs/services/mentor-mode",
  },
  {
    id: "rbac-enforcement",
    name: "RBAC Enforcement & Audit",
    mode: ServiceMode.SECURITY_LAYER,
    description: "Access control enforcing HIPAA-aligned least privilege across all user sessions.",
    function: "Controls views, logs access, denies cross-role leakage. Generates audit logs.",
    trigger: "Any data access, role switch, or permission violation.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "shield",
    documentation: "/docs/services/rbac-enforcement",
  },
  {
    id: "clinical-confidence-scoring",
    name: "Clinical Confidence Scoring",
    mode: ServiceMode.RISK_ASSESSMENT,
    description: "Assigns a confidence score to AI-generated interpretations, visually emphasized in UI.",
    function: "Uses statistical certainty and NLM/ClinVar comparisons to assess result strength.",
    trigger: "After lab data parsing or interpretation request.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "percent",
    documentation: "/docs/services/clinical-confidence-scoring",
  },
  {
    id: "investor-mode",
    name: "Investor Mode",
    mode: ServiceMode.PITCH_KPI_MODE,
    description: "Summarizes impact metrics, business KPIs, and future roadmap in a curated view.",
    function: "Highlights market, compliance wins, patent stack, and monetization models.",
    trigger: "Role = investor or leadership.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "trending-up",
    documentation: "/docs/services/investor-mode",
  },
  {
    id: "auto-capture-presentation",
    name: "Auto-Capture Presentation Mode",
    mode: ServiceMode.SESSION_RECORDER,
    description: "Captures session with narrative, visuals, and stakeholder heatmaps.",
    function: "Auto-generates a shareable HTML/MP4 presentation, embeds stakeholder interactions.",
    trigger: "Presentation session + 'Enable Capture'.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "video",
    documentation: "/docs/services/auto-capture-presentation",
  },
  {
    id: "context-aware-prompt-sync",
    name: "Context-Aware Prompt Sync",
    mode: ServiceMode.PROMPT_OPTIMIZATION,
    description: "Injects real-time session metadata into ChatGPT prompts.",
    function:
      "Enables AIDEN to shape follow-ups, queries, and decisions based on current context and stakeholder role.",
    trigger: "Any prompt to ChatGPT within AGENT portal.",
    status: ServiceStatus.AVAILABLE,
    isEnabled: true,
    requiresAuth: true,
    icon: "message-square",
    documentation: "/docs/services/context-aware-prompt-sync",
  },
]

/**
 * Get all available AGENT Clinical AI Services
 */
export function getAllServices(): ClinicalAIService[] {
  return AGENT_CLINICAL_AI_SERVICES
}

/**
 * Get a specific AGENT Clinical AI Service by ID
 */
export function getServiceById(id: string): ClinicalAIService | undefined {
  return AGENT_CLINICAL_AI_SERVICES.find((service) => service.id === id)
}

/**
 * Get all enabled AGENT Clinical AI Services
 */
export function getEnabledServices(): ClinicalAIService[] {
  return AGENT_CLINICAL_AI_SERVICES.filter((service) => service.isEnabled)
}

/**
 * Get all services available for a specific role
 */
export function getServicesForRole(role: string): ClinicalAIService[] {
  // This is a simplified implementation
  // In a real application, you would check role permissions against service requirements

  // For demonstration purposes:
  if (role === "admin") {
    return AGENT_CLINICAL_AI_SERVICES
  } else if (role === "clinician") {
    return AGENT_CLINICAL_AI_SERVICES.filter(
      (service) => service.id !== "investor-mode" && service.id !== "auto-capture-presentation",
    )
  } else if (role === "researcher") {
    return AGENT_CLINICAL_AI_SERVICES.filter(
      (service) => service.id !== "investor-mode" && service.id !== "mentor-mode",
    )
  } else if (role === "investor") {
    return AGENT_CLINICAL_AI_SERVICES.filter(
      (service) => service.id === "investor-mode" || service.id === "adaptive-presentation",
    )
  }

  // Default: return only basic services
  return AGENT_CLINICAL_AI_SERVICES.filter(
    (service) => service.id === "fhir-oauth2-sync" || service.id === "genomic-data-enrichment",
  )
}

/**
 * Log service usage
 */
export function logServiceUsage(serviceId: string, userId: string, context: Record<string, any> = {}): void {
  const service = getServiceById(serviceId)

  if (!service) {
    logger.error("Attempted to log usage for unknown service", { serviceId, userId })
    return
  }

  logger.info("Service usage logged", {
    service_id: serviceId,
    service_name: service.name,
    user_id: userId,
    timestamp: new Date().toISOString(),
    context,
  })

  // In a real application, you would also store this in a database
}

export default {
  getAllServices,
  getServiceById,
  getEnabledServices,
  getServicesForRole,
  logServiceUsage,
  ServiceStatus,
  ServiceMode,
}
