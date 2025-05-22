import { genomicRedisSet, genomicRedisGet } from "../redis/genomic-redis-client"
import { runTest, generateTestKey, cleanupTestKeys } from "./redis-test-utils"

/**
 * Genomic-specific Redis tests
 * Tests Redis operations with genomic data structures
 */

interface GenomicVariant {
  gene: string
  chromosome: string
  position: number
  reference: string
  alternate: string
  clinicalSignificance?: string
  phenotypes?: string[]
  populationFrequency?: number
  impact?: string
  confidenceScore?: number
}

export async function runGenomicRedisTests() {
  const testKeys: string[] = []
  const results = []

  try {
    // Test storing and retrieving a single variant
    results.push(
      await runTest("Genomic - Store single variant", async () => {
        const key = generateTestKey("variant")
        testKeys.push(key)

        const variant: GenomicVariant = {
          gene: "BRCA1",
          chromosome: "17",
          position: 43106453,
          reference: "G",
          alternate: "A",
          clinicalSignificance: "Pathogenic",
          phenotypes: ["Hereditary Breast and Ovarian Cancer Syndrome"],
          populationFrequency: 0.0001,
          impact: "HIGH",
          confidenceScore: 0.95,
        }

        await genomicRedisSet(key, variant)
        const retrieved = await genomicRedisGet<GenomicVariant>(key)

        if (!retrieved || retrieved.gene !== variant.gene || retrieved.position !== variant.position) {
          throw new Error("Failed to store and retrieve genomic variant")
        }
      }),
    )

    // Test storing and retrieving a batch of variants
    results.push(
      await runTest("Genomic - Store variant batch", async () => {
        const key = generateTestKey("variants-batch")
        testKeys.push(key)

        const variants: GenomicVariant[] = [
          {
            gene: "EGFR",
            chromosome: "7",
            position: 55259515,
            reference: "T",
            alternate: "G",
            clinicalSignificance: "Pathogenic",
            impact: "HIGH",
            confidenceScore: 0.92,
          },
          {
            gene: "KRAS",
            chromosome: "12",
            position: 25398284,
            reference: "C",
            alternate: "A",
            clinicalSignificance: "Pathogenic",
            impact: "HIGH",
            confidenceScore: 0.89,
          },
          {
            gene: "TP53",
            chromosome: "17",
            position: 7578406,
            reference: "G",
            alternate: "T",
            clinicalSignificance: "Pathogenic",
            impact: "HIGH",
            confidenceScore: 0.97,
          },
        ]

        await genomicRedisSet(key, variants)
        const retrieved = await genomicRedisGet<GenomicVariant[]>(key)

        if (!retrieved || retrieved.length !== variants.length) {
          throw new Error("Failed to store and retrieve genomic variant batch")
        }

        // Verify each variant
        for (let i = 0; i < variants.length; i++) {
          if (retrieved[i].gene !== variants[i].gene || retrieved[i].position !== variants[i].position) {
            throw new Error(`Variant mismatch at index ${i}`)
          }
        }
      }),
    )

    // Test storing and retrieving patient genomic data
    results.push(
      await runTest("Genomic - Patient genomic data", async () => {
        const patientId = "patient-" + Date.now()
        const key = generateTestKey(`patient:${patientId}:genomic`)
        testKeys.push(key)

        const patientGenomicData = {
          patientId,
          sampleId: "S" + Date.now(),
          collectionDate: new Date().toISOString(),
          variants: [
            {
              gene: "APC",
              chromosome: "5",
              position: 112175770,
              reference: "A",
              alternate: "T",
              clinicalSignificance: "Pathogenic",
              impact: "HIGH",
              confidenceScore: 0.91,
            },
            {
              gene: "PTEN",
              chromosome: "10",
              position: 89692905,
              reference: "C",
              alternate: "G",
              clinicalSignificance: "Likely Pathogenic",
              impact: "MODERATE",
              confidenceScore: 0.85,
            },
          ],
          metadata: {
            sequencer: "Illumina NovaSeq 6000",
            coverage: 30,
            quality: "High",
            analyst: "Dr. Jane Smith",
          },
        }

        await genomicRedisSet(key, patientGenomicData)
        const retrieved = await genomicRedisGet(key)

        if (
          !retrieved ||
          retrieved.patientId !== patientGenomicData.patientId ||
          retrieved.variants.length !== patientGenomicData.variants.length
        ) {
          throw new Error("Failed to store and retrieve patient genomic data")
        }
      }),
    )

    // Test TTL for temporary genomic analysis results
    results.push(
      await runTest("Genomic - Analysis results with TTL", async () => {
        const key = generateTestKey("analysis-results")
        testKeys.push(key)

        const analysisResults = {
          id: "analysis-" + Date.now(),
          timestamp: new Date().toISOString(),
          status: "completed",
          results: {
            pathogenicCount: 3,
            vusCount: 12,
            benignCount: 485,
            topFindings: [
              { gene: "BRCA2", significance: "Pathogenic" },
              { gene: "MLH1", significance: "Likely Pathogenic" },
              { gene: "ATM", significance: "VUS" },
            ],
          },
        }

        // Store with 5 second TTL
        await genomicRedisSet(key, analysisResults, 5)

        // Verify it exists
        const immediate = await genomicRedisGet(key)
        if (!immediate) {
          throw new Error("Failed to store analysis results")
        }

        // Wait for expiration
        await new Promise((resolve) => setTimeout(resolve, 6000))

        // Verify it expired
        const afterExpiration = await genomicRedisGet(key)
        if (afterExpiration !== null) {
          throw new Error("Analysis results should have expired")
        }
      }),
    )

    // Test storing large genomic dataset
    results.push(
      await runTest("Genomic - Large variant dataset", async () => {
        const key = generateTestKey("large-dataset")
        testKeys.push(key)

        // Generate a large dataset of variants
        const largeDataset = {
          sampleId: "large-sample",
          variants: Array.from({ length: 1000 }, (_, i) => ({
            id: `var-${i}`,
            gene: `GENE${i % 100}`,
            chromosome: `${(i % 22) + 1}`,
            position: 1000000 + i,
            reference: "A",
            alternate: "G",
            confidenceScore: Math.random(),
          })),
        }

        await genomicRedisSet(key, largeDataset)
        const retrieved = await genomicRedisGet(key)

        if (!retrieved || retrieved.variants.length !== largeDataset.variants.length) {
          throw new Error("Failed to store and retrieve large genomic dataset")
        }
      }),
    )

    return {
      name: "Genomic Redis Tests",
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      skipped: 0,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      results,
    }
  } finally {
    // Clean up all test keys
    await cleanupTestKeys(testKeys)
  }
}
