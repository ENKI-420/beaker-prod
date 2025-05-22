"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, X, ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { FhirPatient } from "@/lib/fhir/fhir-client"
import { debounce } from "@/lib/utils"

interface PatientSearchProps {
  onPatientSelect?: (patientId: string) => void
  standalone?: boolean
}

interface SearchParams {
  name?: string
  identifier?: string
  gender?: string
  birthDate?: string
  phone?: string
  email?: string
  address?: string
  _count?: string
  _page?: string
}

export function PatientSearch({ onPatientSelect, standalone = false }: PatientSearchProps) {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<SearchParams>({
    _count: "10",
    _page: "1",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    entry?: Array<{ resource: FhirPatient }>
    total?: number
  }>({})
  const [error, setError] = useState<string | null>(null)

  // Calculate pagination info
  const currentPage = Number.parseInt(searchParams._page || "1")
  const pageSize = Number.parseInt(searchParams._count || "10")
  const totalPages = results.total ? Math.ceil(results.total / pageSize) : 0
  const hasResults = results.entry && results.entry.length > 0

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (params: SearchParams) => {
      setIsLoading(true)
      setError(null)

      try {
        // Build query string
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })

        // Execute search
        const response = await fetch(`/api/fhir/patients?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`)
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed")
        setResults({})
      } finally {
        setIsLoading(false)
      }
    }, 500),
    [],
  )

  // Handle input changes
  const handleInputChange = (key: keyof SearchParams, value: string) => {
    const newParams = { ...searchParams, [key]: value }
    setSearchParams(newParams)

    // Reset to page 1 when search criteria change (except when changing page)
    if (key !== "_page") {
      newParams._page = "1"
    }

    debouncedSearch(newParams)
  }

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    if (onPatientSelect) {
      onPatientSelect(patientId)
    } else if (standalone) {
      router.push(`/patients/${patientId}`)
    }
  }

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    handleInputChange("_page", page.toString())
  }

  // Format patient name
  const formatPatientName = (patient: FhirPatient) => {
    if (!patient.name || patient.name.length === 0) return "Unknown Name"

    const name = patient.name[0]
    const given = name.given?.join(" ") || ""
    const family = name.family || ""

    return `${given} ${family}`.trim() || "Unknown Name"
  }

  // Format patient identifier
  const formatPatientIdentifier = (patient: FhirPatient) => {
    if (!patient.identifier || patient.identifier.length === 0) return "No ID"

    // Try to find MRN or other primary identifier
    const mrn = patient.identifier.find((id) =>
      id.type?.coding?.some((coding) => coding.code === "MR" || coding.display?.includes("Medical Record")),
    )

    return mrn?.value || patient.identifier[0].value || "No ID"
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({
      _count: "10",
      _page: "1",
    })
    debouncedSearch({
      _count: "10",
      _page: "1",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Patient Search</span>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Main search input */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by patient name"
              className="pl-8"
              value={searchParams.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <Button variant="default" onClick={() => debouncedSearch(searchParams)} disabled={isLoading}>
            Search
          </Button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-muted/20 rounded-md">
            <div>
              <label className="text-sm font-medium mb-1 block">Patient ID</label>
              <Input
                type="text"
                placeholder="Enter ID"
                value={searchParams.identifier || ""}
                onChange={(e) => handleInputChange("identifier", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Gender</label>
              <Select
                value={searchParams.gender || "any"}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Birth Date</label>
              <Input
                type="date"
                value={searchParams.birthDate || ""}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                type="tel"
                placeholder="Phone number"
                value={searchParams.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="Email address"
                value={searchParams.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Input
                type="text"
                placeholder="Address"
                value={searchParams.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md">{error}</div>}

        {/* Results */}
        <div className="space-y-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center p-3 border rounded-md">
                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : hasResults ? (
            // Results list
            results.entry?.map(({ resource: patient }) => (
              <div
                key={patient.id}
                className="flex items-center p-3 border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handlePatientSelect(patient.id)}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="font-medium">{formatPatientName(patient)}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>ID: {formatPatientIdentifier(patient)}</span>
                    {patient.gender && (
                      <Badge variant="outline" className="capitalize">
                        {patient.gender}
                      </Badge>
                    )}
                    {patient.birthDate && <span>DOB: {patient.birthDate}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : searchParams.name || searchParams.identifier ? (
            // No results
            <div className="p-4 text-center text-muted-foreground">
              No patients found matching your search criteria.
            </div>
          ) : (
            // Initial state
            <div className="p-4 text-center text-muted-foreground">Enter search criteria to find patients.</div>
          )}
        </div>
      </CardContent>

      {/* Pagination */}
      {hasResults && totalPages > 1 && (
        <CardFooter className="flex justify-between items-center border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, results.total || 0)} of{" "}
            {results.total}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm mx-2">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
