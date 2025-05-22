import { PresentationsList } from "@/components/presentations/presentations-list"
import { Presentation } from "lucide-react"

/**
 * Presentations Page
 * Lists all available presentations and allows creating new ones
 */
export default function PresentationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Presentation className="mr-2 h-6 w-6 text-primary" />
          Adaptive Presentations
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create and manage stakeholder-aware presentations with adaptive content
        </p>
      </div>

      <PresentationsList
        onCreateNew={() => {
          // This is handled client-side in the component
        }}
      />
    </div>
  )
}
