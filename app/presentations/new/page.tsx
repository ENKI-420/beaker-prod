import { PresentationCreator } from "@/components/presentations/presentation-creator"
import { Presentation } from "lucide-react"

/**
 * New Presentation Page
 * Allows creating a new adaptive presentation
 */
export default function NewPresentationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Presentation className="mr-2 h-6 w-6 text-primary" />
          Create New Presentation
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create a stakeholder-aware presentation with adaptive content tailored to your audience
        </p>
      </div>

      <PresentationCreator />
    </div>
  )
}
