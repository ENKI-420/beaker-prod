import { PatientSearch } from "@/components/fhir/patient-search"

export const metadata = {
  title: "Patient Search | Genomic Twin Platform",
  description: "Search for patients in the Genomic Twin Platform",
}

export default function PatientSearchPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Patient Search</h1>
      <PatientSearch standalone={true} />
    </div>
  )
}
