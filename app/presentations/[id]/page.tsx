import { PresentationViewer } from "@/components/presentations/presentation-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface PresentationPageProps {
  params: {
    id: string
  }
}

/**
 * Presentation View Page
 * Displays a specific presentation
 */
export default function PresentationPage({ params }: PresentationPageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/presentations">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Presentations
          </Link>
        </Button>
      </div>

      <PresentationViewer presentationId={params.id} />
    </div>
  )
}
