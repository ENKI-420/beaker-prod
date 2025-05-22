import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientCard } from "@/components/fhir/patient-card"
import { PatientHealthRecord } from "@/components/fhir/patient-health-record"
import { Skeleton } from "@/components/ui/skeleton"

interface PatientDetailsPageProps {
  params: {
    patientId: string
  }
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  if (!params.patientId) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/patients/search">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Patient Information</h2>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <PatientCard patientId={params.patientId} />
          </Suspense>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Health Record</h2>
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <PatientHealthRecord patientId={params.patientId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
