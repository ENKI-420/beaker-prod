/**
 * API Route: /api/genomics/enrich
 * Enriches genomic data with additional information
 */

import { type NextRequest, NextResponse } from "next/server"
import { extractVariantsFromRawData, enrichVariants, KnowledgeSource } from "@/lib/agent/services/genomic-enrichment"
import { logger } from "@/lib/logging/enhanced-logger"
import { handleError } from "@/lib/error/error-handler"

/**
 * POST /api/genomics/enrich
 * Enriches genomic data with additional information
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { data, format = "vcf", sources = Object.values(KnowledgeSource), userId } = body

    if (!data) {
      return NextResponse.json(
        {
          error: {
            message: "Missing required parameter: data",
            statusCode: 400,
          },
        },
        { status: 400 },
      )
    }

    // Extract variants from raw data
    const variants = await extractVariantsFromRawData(data, format)

    // Enrich variants
    const enrichmentResult = await enrichVariants(variants, sources, userId)

    logger.info("Genomic data enrichment completed", {
      format,
      variantCount: variants.length,
      enrichedCount: enrichmentResult.enrichedVariantCount,
      userId: userId || "anonymous",
    })

    return NextResponse.json(enrichmentResult)
  } catch (error) {
    const errorResponse = handleError(error, { route: "/api/genomics/enrich" })
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 })
  }
}
