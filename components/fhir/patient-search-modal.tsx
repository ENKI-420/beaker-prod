"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PatientSearch } from "@/components/fhir/patient-search"
import { Search } from "lucide-react"

interface PatientSearchModalProps {
  trigger?: React.ReactNode
  onPatientSelect?: (patientId: string) => void
  redirectToPatient?: boolean
}

export function PatientSearchModal({ trigger, onPatientSelect, redirectToPatient = false }: PatientSearchModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handlePatientSelect = (patientId: string) => {
    if (onPatientSelect) {
      onPatientSelect(patientId)
    }

    if (redirectToPatient) {
      router.push(`/patients/${patientId}`)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Find Patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Patient</DialogTitle>
        </DialogHeader>
        <PatientSearch onPatientSelect={handlePatientSelect} />
      </DialogContent>
    </Dialog>
  )
}
