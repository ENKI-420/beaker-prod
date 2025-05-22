import type React from "react"
/**
 * AGENT Adaptive Presentation Service
 * Provides stakeholder-aware presentations with adaptive tone and content
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { RoleType } from "@/lib/auth/permissions"
import { logServiceUsage } from "@/lib/agent/services-registry"

// Presentation content types
export enum ContentType {
  CLINICAL = "clinical",
  TECHNICAL = "technical",
  FINANCIAL = "financial",
  REGULATORY = "regulatory",
  EDUCATIONAL = "educational",
}

// Presentation tone types
export enum ToneType {
  FORMAL = "formal",
  CONVERSATIONAL = "conversational",
  TECHNICAL = "technical",
  SIMPLIFIED = "simplified",
  PERSUASIVE = "persuasive",
}

// Detail level types
export enum DetailLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// Presentation configuration
export interface PresentationConfig {
  title: string
  description?: string
  contentTypes: ContentType[]
  toneType: ToneType
  detailLevel: DetailLevel
  includeMetrics: boolean
  includeVisuals: boolean
  includeCitations: boolean
  maxDuration?: number // in minutes
  customSections?: string[]
}

// Stakeholder profile
export interface StakeholderProfile {
  role: RoleType | string
  specialties?: string[]
  interests?: string[]
  knowledgeLevel?: "beginner" | "intermediate" | "expert"
  preferredContentTypes?: ContentType[]
  preferredToneType?: ToneType
  preferredDetailLevel?: DetailLevel
  previousInteractions?: {
    topics: string[]
    frequency: number
  }
}

// Presentation slide
export interface PresentationSlide {
  id: string
  title: string
  content: string | React.ReactNode
  contentType: ContentType
  notes?: string
  citations?: string[]
  visualAids?: {
    type: "chart" | "image" | "video" | "diagram"
    url: string
    caption?: string
  }[]
  importance: number // 1-10 scale
  duration: number // in seconds
}

// Complete presentation
export interface AdaptivePresentation {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  slides: PresentationSlide[]
  config: PresentationConfig
  targetStakeholder: StakeholderProfile
  totalDuration: number // in seconds
  metrics?: {
    engagementScore?: number
    comprehensionScore?: number
    persuasionScore?: number
  }
}

/**
 * Get default presentation configuration for a stakeholder role
 */
export function getDefaultConfigForRole(role: RoleType | string): PresentationConfig {
  switch (role) {
    case RoleType.CLINICIAN:
      return {
        title: "Clinical Genomic Analysis",
        contentTypes: [ContentType.CLINICAL, ContentType.EDUCATIONAL],
        toneType: ToneType.FORMAL,
        detailLevel: DetailLevel.HIGH,
        includeMetrics: true,
        includeVisuals: true,
        includeCitations: true,
      }
    case RoleType.RESEARCHER:
      return {
        title: "Genomic Research Findings",
        contentTypes: [ContentType.TECHNICAL, ContentType.CLINICAL],
        toneType: ToneType.TECHNICAL,
        detailLevel: DetailLevel.HIGH,
        includeMetrics: true,
        includeVisuals: true,
        includeCitations: true,
      }
    case RoleType.LAB_TECHNICIAN:
      return {
        title: "Laboratory Analysis Results",
        contentTypes: [ContentType.TECHNICAL, ContentType.EDUCATIONAL],
        toneType: ToneType.TECHNICAL,
        detailLevel: DetailLevel.MEDIUM,
        includeMetrics: true,
        includeVisuals: true,
        includeCitations: false,
      }
    case RoleType.ADMIN:
      return {
        title: "Genomic Platform Overview",
        contentTypes: [ContentType.TECHNICAL, ContentType.FINANCIAL, ContentType.REGULATORY],
        toneType: ToneType.FORMAL,
        detailLevel: DetailLevel.MEDIUM,
        includeMetrics: true,
        includeVisuals: true,
        includeCitations: false,
      }
    case "investor":
      return {
        title: "Genomic Platform Investment Opportunity",
        contentTypes: [ContentType.FINANCIAL, ContentType.REGULATORY],
        toneType: ToneType.PERSUASIVE,
        detailLevel: DetailLevel.MEDIUM,
        includeMetrics: true,
        includeVisuals: true,
        includeCitations: false,
      }
    case "patient":
      return {
        title: "Your Genomic Health Information",
        contentTypes: [ContentType.EDUCATIONAL, ContentType.CLINICAL],
        toneType: ToneType.CONVERSATIONAL,
        detailLevel: DetailLevel.LOW,
        includeMetrics: false,
        includeVisuals: true,
        includeCitations: false,
      }
    default:
      return {
        title: "Genomic Analysis Presentation",
        contentTypes: [ContentType.EDUCATIONAL, ContentType.CLINICAL],
        toneType: ToneType.CONVERSATIONAL,
        detailLevel: DetailLevel.MEDIUM,
        includeMetrics: true,
        includeVisuals: true,
        includeCitations: false,
      }
  }
}

/**
 * Generate an adaptive presentation based on stakeholder profile and content
 */
export async function generateAdaptivePresentation(
  stakeholder: StakeholderProfile,
  config?: Partial<PresentationConfig>,
  contentId?: string,
): Promise<AdaptivePresentation> {
  try {
    // Log service usage
    logServiceUsage("adaptive-presentation", stakeholder.role, {
      contentId,
      stakeholderRole: stakeholder.role,
    })

    // Get default config for role and merge with provided config
    const defaultConfig = getDefaultConfigForRole(stakeholder.role)
    const mergedConfig: PresentationConfig = {
      ...defaultConfig,
      ...config,
    }

    // In a real implementation, this would use AI to generate content
    // For now, we'll use mock data
    const presentation: AdaptivePresentation = {
      id: `pres_${Date.now()}`,
      title: mergedConfig.title,
      description: mergedConfig.description || `Presentation adapted for ${stakeholder.role} role`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: mergedConfig,
      targetStakeholder: stakeholder,
      slides: generateMockSlides(stakeholder, mergedConfig, contentId),
      totalDuration: 0, // Will be calculated below
      metrics: {
        engagementScore: Math.floor(Math.random() * 30) + 70, // 70-100
        comprehensionScore: Math.floor(Math.random() * 30) + 70, // 70-100
        persuasionScore: Math.floor(Math.random() * 30) + 70, // 70-100
      },
    }

    // Calculate total duration
    presentation.totalDuration = presentation.slides.reduce((total, slide) => total + slide.duration, 0)

    logger.info("Generated adaptive presentation", {
      presentationId: presentation.id,
      stakeholderRole: stakeholder.role,
      slideCount: presentation.slides.length,
      totalDuration: presentation.totalDuration,
    })

    return presentation
  } catch (error) {
    logger.error("Error generating adaptive presentation", {
      error: error instanceof Error ? error.message : "Unknown error",
      stakeholderRole: stakeholder.role,
    })
    throw error
  }
}

/**
 * Generate mock slides based on stakeholder profile and configuration
 * In a real implementation, this would use AI to generate content
 */
function generateMockSlides(
  stakeholder: StakeholderProfile,
  config: PresentationConfig,
  contentId?: string,
): PresentationSlide[] {
  const slides: PresentationSlide[] = []

  // Title slide
  slides.push({
    id: `slide_${Date.now()}_0`,
    title: config.title,
    content: config.description || `Presentation adapted for ${stakeholder.role} role`,
    contentType: ContentType.EDUCATIONAL,
    importance: 10,
    duration: 30,
  })

  // Generate content based on stakeholder role and content types
  if (stakeholder.role === RoleType.CLINICIAN || stakeholder.role === "patient") {
    // Clinical content
    if (config.contentTypes.includes(ContentType.CLINICAL)) {
      slides.push({
        id: `slide_${Date.now()}_1`,
        title: "Clinical Significance",
        content:
          "Analysis of genomic variants reveals several clinically significant findings that may impact patient care and treatment decisions.",
        contentType: ContentType.CLINICAL,
        importance: 9,
        duration: 60,
        visualAids: [
          {
            type: "chart",
            url: "/clinical-significance-pathogenic-variants.png",
            caption: "Distribution of variant clinical significance",
          },
        ],
        citations: ["PMID: 34567890", "PMID: 23456789"],
      })

      slides.push({
        id: `slide_${Date.now()}_2`,
        title: "Treatment Implications",
        content:
          "Based on the genomic profile, several targeted therapies may be effective. Response to standard treatments may be altered based on specific variants.",
        contentType: ContentType.CLINICAL,
        importance: 8,
        duration: 90,
        visualAids: [
          {
            type: "diagram",
            url: "/placeholder-7s5mf.png",
            caption: "Treatment decision pathway based on genomic profile",
          },
        ],
      })
    }
  }

  if (stakeholder.role === RoleType.RESEARCHER || stakeholder.role === RoleType.LAB_TECHNICIAN) {
    // Technical content
    if (config.contentTypes.includes(ContentType.TECHNICAL)) {
      slides.push({
        id: `slide_${Date.now()}_3`,
        title: "Variant Analysis Methodology",
        content:
          "Sequencing was performed using Illumina NovaSeq with 150bp paired-end reads. Variants were called using GATK HaplotypeCaller and annotated with VEP.",
        contentType: ContentType.TECHNICAL,
        importance: 7,
        duration: 120,
        visualAids: [
          {
            type: "diagram",
            url: "/genomic-analysis-pipeline.png",
            caption: "Genomic analysis pipeline workflow",
          },
        ],
        citations: ["PMID: 12345678", "PMID: 23456789", "PMID: 34567890"],
      })

      slides.push({
        id: `slide_${Date.now()}_4`,
        title: "Statistical Significance",
        content:
          "Variant calling achieved 99.7% sensitivity and 99.9% specificity. Quality metrics include mean coverage of 30x with 95% of target regions covered at >20x.",
        contentType: ContentType.TECHNICAL,
        importance: 6,
        duration: 90,
        visualAids: [
          {
            type: "chart",
            url: "/placeholder.svg?height=300&width=500&query=statistical metrics chart for genomic sequencing",
            caption: "Quality metrics for sequencing and variant calling",
          },
        ],
      })
    }
  }

  if (stakeholder.role === "investor" || stakeholder.role === RoleType.ADMIN) {
    // Financial content
    if (config.contentTypes.includes(ContentType.FINANCIAL)) {
      slides.push({
        id: `slide_${Date.now()}_5`,
        title: "Market Opportunity",
        content:
          "The genomic testing market is projected to grow at 15% CAGR over the next 5 years, reaching $25B by 2028. Our platform addresses key pain points in clinical interpretation.",
        contentType: ContentType.FINANCIAL,
        importance: 9,
        duration: 120,
        visualAids: [
          {
            type: "chart",
            url: "/placeholder.svg?height=300&width=500&query=market growth projection chart for genomics",
            caption: "Genomic testing market growth projection",
          },
        ],
      })

      slides.push({
        id: `slide_${Date.now()}_6`,
        title: "ROI Analysis",
        content:
          "Implementation of our genomic platform reduces interpretation time by 60% and increases diagnostic yield by 25%, resulting in estimated annual savings of $2.5M for a typical hospital system.",
        contentType: ContentType.FINANCIAL,
        importance: 8,
        duration: 90,
        visualAids: [
          {
            type: "chart",
            url: "/placeholder.svg?height=300&width=500&query=ROI analysis chart for genomic platform",
            caption: "Return on investment analysis",
          },
        ],
      })
    }

    // Regulatory content
    if (config.contentTypes.includes(ContentType.REGULATORY)) {
      slides.push({
        id: `slide_${Date.now()}_7`,
        title: "Regulatory Compliance",
        content:
          "Our platform is HIPAA compliant and follows all relevant FDA guidelines for genomic data handling. We maintain SOC 2 Type II certification and CLIA compliance.",
        contentType: ContentType.REGULATORY,
        importance: 7,
        duration: 60,
        visualAids: [
          {
            type: "image",
            url: "/placeholder.svg?height=300&width=500&query=regulatory compliance certifications",
            caption: "Regulatory certifications and compliance",
          },
        ],
      })
    }
  }

  // Educational content for all roles
  if (config.contentTypes.includes(ContentType.EDUCATIONAL)) {
    slides.push({
      id: `slide_${Date.now()}_8`,
      title: "Understanding Genomic Variants",
      content:
        "Genomic variants are classified based on their clinical significance, from benign to pathogenic. This classification guides clinical decision-making and research priorities.",
      contentType: ContentType.EDUCATIONAL,
      importance: 5,
      duration: 120,
      visualAids: [
        {
          type: "diagram",
          url: "/placeholder.svg?height=300&width=500&query=genomic variant classification diagram",
          caption: "Classification system for genomic variants",
        },
      ],
    })
  }

  // Summary slide for all presentations
  slides.push({
    id: `slide_${Date.now()}_9`,
    title: "Summary and Next Steps",
    content: generateSummaryContent(stakeholder.role),
    contentType: ContentType.EDUCATIONAL,
    importance: 10,
    duration: 60,
  })

  return slides
}

/**
 * Generate role-specific summary content
 */
function generateSummaryContent(role: RoleType | string): string {
  switch (role) {
    case RoleType.CLINICIAN:
      return "Clinical findings suggest several actionable variants that may impact patient care. Consider genetic counseling referral and targeted therapy options based on these results."
    case RoleType.RESEARCHER:
      return "Research findings indicate novel associations between variants and phenotypes. Further validation studies are recommended to confirm these associations."
    case RoleType.LAB_TECHNICIAN:
      return "Quality metrics for this analysis meet all laboratory standards. Additional testing may be warranted for variants of uncertain significance."
    case RoleType.ADMIN:
      return "Platform performance metrics demonstrate significant improvements in efficiency and accuracy. Consider expanding access to additional departments."
    case "investor":
      return "Market opportunity and ROI analysis support the value proposition of our genomic platform. Next steps include expansion into new markets and development of additional features."
    case "patient":
      return "Your genomic results provide important information about your health. Please discuss these findings with your healthcare provider to understand what they mean for you."
    default:
      return "Thank you for reviewing this presentation. Please reach out with any questions or for additional information."
  }
}

export default {
  generateAdaptivePresentation,
  getDefaultConfigForRole,
  ContentType,
  ToneType,
  DetailLevel,
}
