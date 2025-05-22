/**
 * Genomic Data Enrichment Service
 * Enhances raw genomic lab data using NLP and knowledge graph inference
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { logServiceUsage } from "@/lib/agent/services-registry"
import { getCachedVariant, cacheVariant } from "@/lib/cache/variant-cache-service"
import { cacheGeneInfo } from "@/lib/cache/reference-data-cache"
import { getCachedPopulationFrequency, cachePopulationFrequency } from "@/lib/cache/reference-data-cache"

// Types for genomic variants
export interface GenomicVariant {
  id: string
  chromosome: string
  position: number
  referenceAllele: string
  alternateAllele: string
  type: "SNV" | "CNV" | "SV" | "INDEL"
  zygosity?: "heterozygous" | "homozygous"
  quality?: number
  depth?: number
  clinicalSignificance?: ClinicalSignificance
  phenotypes?: string[]
  genes?: string[]
  transcripts?: string[]
  publications?: string[]
  populationFrequency?: Record<string, number>
  predictedImpact?: PredictedImpact
  confidence?: number
}

export enum ClinicalSignificance {
  PATHOGENIC = "pathogenic",
  LIKELY_PATHOGENIC = "likely_pathogenic",
  UNCERTAIN_SIGNIFICANCE = "uncertain_significance",
  LIKELY_BENIGN = "likely_benign",
  BENIGN = "benign",
  CONFLICTING = "conflicting",
  UNKNOWN = "unknown",
}

export interface PredictedImpact {
  score: number
  method: string
  interpretation: string
  confidence: number
}

export interface EnrichmentResult {
  originalVariantCount: number
  enrichedVariantCount: number
  variants: GenomicVariant[]
  clinicalSummary: string
  confidenceScore: number
  processingTime: number
  knowledgeBaseVersion: string
  enrichmentDate: string
}

// Knowledge base sources
export enum KnowledgeSource {
  CLINVAR = "clinvar",
  GNOMAD = "gnomad",
  DBSNP = "dbsnp",
  COSMIC = "cosmic",
  OMIM = "omim",
  PHARMGKB = "pharmgkb",
  PUBMED = "pubmed",
  INTERNAL = "internal",
}

/**
 * Extract variants from raw genomic data
 */
export async function extractVariantsFromRawData(
  rawData: string,
  format: "vcf" | "beaker" | "json" = "vcf",
): Promise<GenomicVariant[]> {
  try {
    logger.info("Extracting variants from raw data", { format })

    // This is a simplified implementation
    // In a real application, you would use specialized libraries for parsing VCF files
    // or use NLP for extracting variants from unstructured text

    if (format === "vcf") {
      return extractVariantsFromVCF(rawData)
    } else if (format === "beaker") {
      return extractVariantsFromBeaker(rawData)
    } else if (format === "json") {
      return JSON.parse(rawData) as GenomicVariant[]
    }

    throw new Error(`Unsupported format: ${format}`)
  } catch (error) {
    logger.error("Failed to extract variants from raw data", {
      error: error instanceof Error ? error.message : "Unknown error",
      format,
    })
    throw error
  }
}

/**
 * Extract variants from VCF format
 */
function extractVariantsFromVCF(vcfData: string): GenomicVariant[] {
  const variants: GenomicVariant[] = []
  const lines = vcfData.split("\n")

  // Skip header lines
  const dataLines = lines.filter((line) => !line.startsWith("#") && line.trim() !== "")

  for (const line of dataLines) {
    const fields = line.split("\t")
    if (fields.length < 8) continue

    const [chromosome, position, id, ref, alt, quality, filter, info] = fields

    // Basic variant extraction
    const variant: GenomicVariant = {
      id: id === "." ? `${chromosome}-${position}-${ref}-${alt}` : id,
      chromosome,
      position: Number.parseInt(position, 10),
      referenceAllele: ref,
      alternateAllele: alt,
      type: determineVariantType(ref, alt),
      quality: quality === "." ? undefined : Number.parseFloat(quality),
    }

    // Parse INFO field for additional annotations
    if (info !== ".") {
      const infoFields = info.split(";")
      for (const field of infoFields) {
        if (field.includes("=")) {
          const [key, value] = field.split("=")
          if (key === "DP") variant.depth = Number.parseInt(value, 10)
          // Add more INFO field parsing as needed
        }
      }
    }

    variants.push(variant)
  }

  return variants
}

/**
 * Extract variants from Beaker lab report format
 */
function extractVariantsFromBeaker(beakerData: string): GenomicVariant[] {
  // This is a placeholder implementation
  // In a real application, you would use NLP to extract variant information from unstructured text

  const variants: GenomicVariant[] = []
  const lines = beakerData.split("\n")

  // Simple pattern matching for demonstration
  // In reality, this would be much more sophisticated
  for (const line of lines) {
    // Look for patterns like "c.123A>G" or "p.Gly123Arg"
    const cDnaMatch = line.match(/c\.(\d+)([ACGT])>([ACGT])/)
    const proteinMatch = line.match(/p\.([A-Za-z]{3})(\d+)([A-Za-z]{3})/)

    if (cDnaMatch) {
      const [, position, ref, alt] = cDnaMatch
      variants.push({
        id: `extracted-${variants.length + 1}`,
        chromosome: "unknown", // Would need context to determine
        position: Number.parseInt(position, 10),
        referenceAllele: ref,
        alternateAllele: alt,
        type: "SNV",
      })
    } else if (proteinMatch) {
      // For protein changes, we'd need to map back to genomic coordinates
      // This is a simplified placeholder
      variants.push({
        id: `extracted-protein-${variants.length + 1}`,
        chromosome: "unknown",
        position: 0, // Unknown without mapping
        referenceAllele: "unknown",
        alternateAllele: "unknown",
        type: "SNV",
        genes: [extractGeneFromContext(line)].filter(Boolean),
      })
    }
  }

  return variants
}

/**
 * Extract gene name from context
 */
function extractGeneFromContext(context: string): string | undefined {
  // Simple pattern matching for demonstration
  const geneMatch = context.match(/gene:?\s*([A-Z0-9]+)/i)
  return geneMatch ? geneMatch[1].toUpperCase() : undefined
}

/**
 * Determine variant type based on reference and alternate alleles
 */
function determineVariantType(ref: string, alt: string): GenomicVariant["type"] {
  if (ref.length === 1 && alt.length === 1) {
    return "SNV"
  } else if (ref.length > alt.length) {
    return "INDEL" // Deletion
  } else if (ref.length < alt.length) {
    return "INDEL" // Insertion
  } else {
    // Same length but different - substitution
    return ref.length > 10 ? "SV" : "SNV"
  }
}

/**
 * Enrich genomic variants with additional information
 */
export async function enrichVariants(
  variants: GenomicVariant[],
  sources: KnowledgeSource[] = [
    KnowledgeSource.CLINVAR,
    KnowledgeSource.GNOMAD,
    KnowledgeSource.OMIM,
    KnowledgeSource.INTERNAL,
  ],
  userId?: string,
): Promise<EnrichmentResult> {
  try {
    const startTime = Date.now()
    logger.info("Enriching genomic variants", {
      variantCount: variants.length,
      sources,
    })

    // Log service usage if userId is provided
    if (userId) {
      logServiceUsage("genomic-data-enrichment", userId, {
        variantCount: variants.length,
        sources,
      })
    }

    // Create a copy of the variants to enrich
    const enrichedVariants = [...variants]

    // Enrich each variant with additional information
    for (let i = 0; i < enrichedVariants.length; i++) {
      const variant = enrichedVariants[i]

      // Check cache first using the new caching layer
      const variantIdentifier = {
        chromosome: variant.chromosome,
        position: variant.position,
        reference: variant.referenceAllele,
        alternate: variant.alternateAllele,
      }

      const cachedVariant = await getCachedVariant(variantIdentifier)
      if (cachedVariant) {
        // Convert cached variant format to our internal format
        enrichedVariants[i] = {
          ...variant,
          clinicalSignificance: cachedVariant.clinicalSignificance as ClinicalSignificance,
          phenotypes: cachedVariant.phenotypes,
          genes: cachedVariant.gene ? [cachedVariant.gene] : variant.genes,
          populationFrequency: cachedVariant.populationFrequency as Record<string, number>,
          confidence: cachedVariant.confidence,
        }
        continue
      }

      // Enrich with ClinVar data if requested
      if (sources.includes(KnowledgeSource.CLINVAR)) {
        await enrichWithClinVar(variant)
      }

      // Enrich with gnomAD data if requested
      if (sources.includes(KnowledgeSource.GNOMAD)) {
        await enrichWithGnomAD(variant)
      }

      // Enrich with OMIM data if requested
      if (sources.includes(KnowledgeSource.OMIM)) {
        await enrichWithOMIM(variant)
      }

      // Enrich with internal knowledge base if requested
      if (sources.includes(KnowledgeSource.INTERNAL)) {
        await enrichWithInternalKnowledgeBase(variant)
      }

      // Calculate confidence score
      variant.confidence = calculateConfidenceScore(variant)

      // Cache the enriched variant using the new caching layer
      await cacheVariant({
        chromosome: variant.chromosome,
        position: variant.position,
        reference: variant.referenceAllele,
        alternate: variant.alternateAllele,
        gene: variant.genes?.[0],
        clinicalSignificance: variant.clinicalSignificance,
        phenotypes: variant.phenotypes,
        populationFrequency: variant.populationFrequency,
        impact: variant.predictedImpact?.interpretation,
        confidence: variant.confidence,
        lastUpdated: new Date().toISOString(),
      })
    }

    // Generate clinical summary
    const clinicalSummary = generateClinicalSummary(enrichedVariants)

    // Calculate overall confidence score
    const confidenceScore = calculateOverallConfidence(enrichedVariants)

    const endTime = Date.now()
    const processingTime = endTime - startTime

    logger.info("Genomic variant enrichment completed", {
      originalCount: variants.length,
      enrichedCount: enrichedVariants.length,
      processingTime,
      confidenceScore,
    })

    return {
      originalVariantCount: variants.length,
      enrichedVariantCount: enrichedVariants.length,
      variants: enrichedVariants,
      clinicalSummary,
      confidenceScore,
      processingTime,
      knowledgeBaseVersion: "2023.05",
      enrichmentDate: new Date().toISOString(),
    }
  } catch (error) {
    logger.error("Failed to enrich genomic variants", {
      error: error instanceof Error ? error.message : "Unknown error",
      variantCount: variants.length,
    })
    throw error
  }
}

/**
 * Enrich variant with ClinVar data
 */
async function enrichWithClinVar(variant: GenomicVariant): Promise<void> {
  // This is a placeholder implementation
  // In a real application, you would query the ClinVar API or database

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 50))

  // Simulate enrichment with mock data for demonstration
  if (variant.chromosome === "13" && variant.position >= 32889611 && variant.position <= 32973805) {
    // BRCA2 region
    variant.genes = ["BRCA2"]
    variant.clinicalSignificance =
      Math.random() > 0.7 ? ClinicalSignificance.PATHOGENIC : ClinicalSignificance.UNCERTAIN_SIGNIFICANCE
    variant.phenotypes = ["Hereditary breast and ovarian cancer syndrome"]
    variant.publications = ["PMID:28546112", "PMID:29345684"]

    // Cache gene info
    await cacheGeneInfo({
      symbol: "BRCA2",
      name: "BRCA2 DNA repair associated",
      chromosome: "13",
      start: 32889611,
      end: 32973805,
      strand: "+",
      type: "protein-coding",
      description: "Involved in double-strand break repair and/or homologous recombination.",
    })
  } else if (variant.chromosome === "17" && variant.position >= 43044295 && variant.position <= 43125483) {
    // BRCA1 region
    variant.genes = ["BRCA1"]
    variant.clinicalSignificance =
      Math.random() > 0.7 ? ClinicalSignificance.LIKELY_PATHOGENIC : ClinicalSignificance.UNCERTAIN_SIGNIFICANCE
    variant.phenotypes = ["Hereditary breast and ovarian cancer syndrome"]
    variant.publications = ["PMID:28546112", "PMID:29345684"]

    // Cache gene info
    await cacheGeneInfo({
      symbol: "BRCA1",
      name: "BRCA1 DNA repair associated",
      chromosome: "17",
      start: 43044295,
      end: 43125483,
      strand: "+",
      type: "protein-coding",
      description: "Plays a central role in DNA repair by facilitating cellular responses to DNA damage.",
    })
  } else if (variant.chromosome === "4" && variant.position >= 54954971 && variant.position <= 54989680) {
    // PDGFRA region
    variant.genes = ["PDGFRA"]
    variant.clinicalSignificance = ClinicalSignificance.UNCERTAIN_SIGNIFICANCE
    variant.phenotypes = ["Gastrointestinal stromal tumor"]
    variant.publications = ["PMID:26609489"]

    // Cache gene info
    await cacheGeneInfo({
      symbol: "PDGFRA",
      name: "Platelet derived growth factor receptor alpha",
      chromosome: "4",
      start: 54954971,
      end: 54989680,
      strand: "+",
      type: "protein-coding",
      description: "Cell surface tyrosine kinase receptor for members of the platelet-derived growth factor family.",
    })
  } else {
    // Random assignment for demonstration
    const randomGenes = ["TP53", "APC", "KRAS", "EGFR", "PTEN", "RB1", "CDKN2A", "PIK3CA"]
    const randomSignificance = [
      ClinicalSignificance.BENIGN,
      ClinicalSignificance.LIKELY_BENIGN,
      ClinicalSignificance.UNCERTAIN_SIGNIFICANCE,
      ClinicalSignificance.LIKELY_PATHOGENIC,
      ClinicalSignificance.PATHOGENIC,
    ]
    const randomPhenotypes = [
      "Hereditary cancer syndrome",
      "Cardiovascular disease",
      "Neurological disorder",
      "Metabolic disorder",
      "Immunodeficiency",
    ]

    if (Math.random() > 0.7) {
      const gene = randomGenes[Math.floor(Math.random() * randomGenes.length)]
      variant.genes = [gene]
      variant.clinicalSignificance = randomSignificance[Math.floor(Math.random() * randomSignificance.length)]
      variant.phenotypes = [randomPhenotypes[Math.floor(Math.random() * randomPhenotypes.length)]]
    }
  }
}

/**
 * Enrich variant with gnomAD data
 */
async function enrichWithGnomAD(variant: GenomicVariant): Promise<void> {
  // Check cache first
  const variantKey = `${variant.chromosome}-${variant.position}-${variant.referenceAllele}-${variant.alternateAllele}`
  const cachedFrequencies = await getCachedPopulationFrequency(variantKey)

  if (cachedFrequencies) {
    // Convert cached frequencies to our internal format
    variant.populationFrequency = cachedFrequencies.reduce(
      (acc, freq) => {
        acc[freq.population] = freq.frequency
        return acc
      },
      {} as Record<string, number>,
    )
    return
  }

  // This is a placeholder implementation
  // In a real application, you would query the gnomAD API or database

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 30))

  // Simulate population frequency data
  const frequencies = [
    { population: "gnomAD_ALL", frequency: Math.random() * 0.01, sampleSize: 141456, source: "gnomAD" },
    { population: "gnomAD_AFR", frequency: Math.random() * 0.01, sampleSize: 8128, source: "gnomAD" },
    { population: "gnomAD_AMR", frequency: Math.random() * 0.01, sampleSize: 17296, source: "gnomAD" },
    { population: "gnomAD_ASJ", frequency: Math.random() * 0.01, sampleSize: 5040, source: "gnomAD" },
    { population: "gnomAD_EAS", frequency: Math.random() * 0.01, sampleSize: 9197, source: "gnomAD" },
    { population: "gnomAD_FIN", frequency: Math.random() * 0.01, sampleSize: 12562, source: "gnomAD" },
    { population: "gnomAD_NFE", frequency: Math.random() * 0.01, sampleSize: 56885, source: "gnomAD" },
    { population: "gnomAD_OTH", frequency: Math.random() * 0.01, sampleSize: 3614, source: "gnomAD" },
    { population: "gnomAD_SAS", frequency: Math.random() * 0.01, sampleSize: 15308, source: "gnomAD" },
  ]

  // Cache the population frequencies
  await cachePopulationFrequency(variantKey, frequencies)

  // Set the frequencies on the variant
  variant.populationFrequency = frequencies.reduce(
    (acc, freq) => {
      acc[freq.population] = freq.frequency
      return acc
    },
    {} as Record<string, number>,
  )
}

/**
 * Enrich variant with OMIM data
 */
async function enrichWithOMIM(variant: GenomicVariant): Promise<void> {
  // This is a placeholder implementation
  // In a real application, you would query the OMIM API or database

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 40))

  // Only add OMIM data if we have genes
  if (!variant.genes || variant.genes.length === 0) {
    return
  }

  // Simulate OMIM phenotype data for known genes
  const omimData: Record<string, string[]> = {
    BRCA1: ["Breast-ovarian cancer, familial, susceptibility to, 1", "Pancreatic cancer, susceptibility to, 4"],
    BRCA2: ["Breast-ovarian cancer, familial, susceptibility to, 2", "Fanconi anemia, complementation group D1"],
    TP53: ["Li-Fraumeni syndrome 1", "Colorectal cancer"],
    APC: ["Adenomatous polyposis coli", "Gardner syndrome"],
    KRAS: ["Noonan syndrome 3", "Cardiofaciocutaneous syndrome 2"],
    EGFR: ["Lung cancer", "Glioblastoma multiforme"],
    PTEN: ["Cowden syndrome 1", "Macrocephaly/autism syndrome"],
    RB1: ["Retinoblastoma", "Osteogenic sarcoma"],
    CDKN2A: ["Melanoma, cutaneous malignant, 2", "Pancreatic cancer"],
    PIK3CA: ["Megalencephaly-capillary malformation syndrome", "Cowden syndrome 5"],
    PDGFRA: ["Gastrointestinal stromal tumor", "Hypereosinophilic syndrome, idiopathic"],
  }

  // Add OMIM phenotypes if available
  for (const gene of variant.genes) {
    if (omimData[gene]) {
      variant.phenotypes = [...(variant.phenotypes || []), ...omimData[gene]]
    }
  }
}

/**
 * Enrich variant with internal knowledge base
 */
async function enrichWithInternalKnowledgeBase(variant: GenomicVariant): Promise<void> {
  // This is a placeholder implementation
  // In a real application, you would query your internal knowledge base

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 20))

  // Add predicted impact
  variant.predictedImpact = {
    score: Math.random(),
    method: "Internal ML model v2.1",
    interpretation: Math.random() > 0.7 ? "High impact" : Math.random() > 0.4 ? "Moderate impact" : "Low impact",
    confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
  }
}

/**
 * Calculate confidence score for a variant
 */
function calculateConfidenceScore(variant: GenomicVariant): number {
  // This is a simplified implementation
  // In a real application, you would use a more sophisticated algorithm

  let score = 0.5 // Base score

  // Adjust based on clinical significance
  if (variant.clinicalSignificance) {
    switch (variant.clinicalSignificance) {
      case ClinicalSignificance.PATHOGENIC:
      case ClinicalSignificance.BENIGN:
        score += 0.3
        break
      case ClinicalSignificance.LIKELY_PATHOGENIC:
      case ClinicalSignificance.LIKELY_BENIGN:
        score += 0.2
        break
      case ClinicalSignificance.UNCERTAIN_SIGNIFICANCE:
        score += 0.1
        break
      case ClinicalSignificance.CONFLICTING:
        score -= 0.1
        break
    }
  }

  // Adjust based on population frequency
  if (variant.populationFrequency && variant.populationFrequency.gnomAD_ALL !== undefined) {
    if (variant.populationFrequency.gnomAD_ALL < 0.0001) {
      score += 0.1 // Very rare variant
    } else if (variant.populationFrequency.gnomAD_ALL > 0.01) {
      score += 0.05 // Common variant
    }
  }

  // Adjust based on predicted impact
  if (variant.predictedImpact) {
    score += variant.predictedImpact.confidence * 0.2
  }

  // Adjust based on publications
  if (variant.publications && variant.publications.length > 0) {
    score += Math.min(variant.publications.length * 0.05, 0.2)
  }

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score))
}

/**
 * Calculate overall confidence score for a set of variants
 */
function calculateOverallConfidence(variants: GenomicVariant[]): number {
  if (variants.length === 0) {
    return 0
  }

  // Calculate weighted average of variant confidence scores
  const totalConfidence = variants.reduce((sum, variant) => sum + (variant.confidence || 0), 0)
  return totalConfidence / variants.length
}

/**
 * Generate clinical summary for a set of variants
 */
function generateClinicalSummary(variants: GenomicVariant[]): string {
  // This is a simplified implementation
  // In a real application, you would use NLG techniques

  if (variants.length === 0) {
    return "No variants detected."
  }

  // Count variants by clinical significance
  const significanceCounts: Record<string, number> = {}
  for (const variant of variants) {
    if (variant.clinicalSignificance) {
      significanceCounts[variant.clinicalSignificance] = (significanceCounts[variant.clinicalSignificance] || 0) + 1
    }
  }

  // Count variants by gene
  const geneCounts: Record<string, number> = {}
  for (const variant of variants) {
    if (variant.genes) {
      for (const gene of variant.genes) {
        geneCounts[gene] = (geneCounts[gene] || 0) + 1
      }
    }
  }

  // Generate summary
  let summary = `Analysis identified ${variants.length} variants. `

  // Add clinical significance summary
  const significanceEntries = Object.entries(significanceCounts)
  if (significanceEntries.length > 0) {
    summary += "Clinical significance: "
    summary += significanceEntries
      .map(([significance, count]) => `${count} ${significance.replace("_", " ")}`)
      .join(", ")
    summary += ". "
  }

  // Add gene summary
  const geneEntries = Object.entries(geneCounts).sort((a, b) => b[1] - a[1])
  if (geneEntries.length > 0) {
    const topGenes = geneEntries.slice(0, 5)
    summary += "Top affected genes: "
    summary += topGenes.map(([gene, count]) => `${gene} (${count})`).join(", ")
    if (geneEntries.length > 5) {
      summary += `, and ${geneEntries.length - 5} more`
    }
    summary += ". "
  }

  // Add pathogenic variant details
  const pathogenicVariants = variants.filter(
    (v) =>
      v.clinicalSignificance === ClinicalSignificance.PATHOGENIC ||
      v.clinicalSignificance === ClinicalSignificance.LIKELY_PATHOGENIC,
  )
  if (pathogenicVariants.length > 0) {
    summary += `${pathogenicVariants.length} pathogenic or likely pathogenic variants detected. `
    if (pathogenicVariants.length <= 3) {
      summary += "Details: "
      summary += pathogenicVariants
        .map((v) => {
          const geneInfo = v.genes ? v.genes.join(",") : "unknown gene"
          return `${geneInfo} ${v.chromosome}:${v.position} ${v.referenceAllele}>${v.alternateAllele}`
        })
        .join("; ")
      summary += ". "
    }
  }

  return summary
}

export default {
  extractVariantsFromRawData,
  enrichVariants,
  ClinicalSignificance,
  KnowledgeSource,
}
