"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  condition: string
  status: "stable" | "critical" | "improving" | "worsening"
  lastUpdated: string
  avatarUrl?: string
}

interface PatientSummaryProps {
  limit?: number
  isLoading?: boolean
}

/**
 * Patient summary component
 * Displays a list of recent patients with their status
 */
export function PatientSummary({ limit = 5, isLoading = false }: PatientSummaryProps) {
  const [patients, setPatients] = useState<Patient[]>([])

  // Simulate fetching patient data
  useEffect(() => {
    if (isLoading) return

    // Mock patient data
    const mockPatients: Patient[] = [
      {
        id: "p1",
        name: "Sarah Johnson",
        age: 42,
        gender: "Female",
        condition: "Breast Cancer",
        status: "improving",
        lastUpdated: "2 hours ago",
      },
      {
        id: "p2",
        name: "Michael Chen",
        age: 65,
        gender: "Male",
        condition: "Colorectal Cancer",
        status: "stable",
        lastUpdated: "4 hours ago",
      },
      {
        id: "p3",
        name: "Emma Rodriguez",
        age: 38,
        gender: "Female",
        condition: "Ovarian Cancer",
        status: "worsening",
        lastUpdated: "Yesterday",
      },
      {
        id: "p4",
        name: "James Wilson",
        age: 57,
        gender: "Male",
        condition: "Lung Cancer",
        status: "critical",
        lastUpdated: "Yesterday",
      },
      {
        id: "p5",
        name: "Olivia Martinez",
        age: 29,
        gender: "Female",
        condition: "Lymphoma",
        status: "improving",
        lastUpdated: "2 days ago",
      },
      {
        id: "p6",
        name: "Robert Taylor",
        age: 71,
        gender: "Male",
        condition: "Prostate Cancer",
        status: "stable",
        lastUpdated: "3 days ago",
      },
    ]

    setPatients(mockPatients.slice(0, limit))
  }, [limit, isLoading])

  // Status badge colors
  const statusColors = {
    stable: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    improving: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    worsening: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <Link
          key={patient.id}
          href={`/patients/${patient.id}`}
          className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Avatar>
            <AvatarImage src={patient.avatarUrl || "/placeholder.svg"} alt={patient.name} />
            <AvatarFallback>
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{patient.name}</p>
              <Badge className={statusColors[patient.status]} variant="outline">
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {patient.age}, {patient.gender} • {patient.condition}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Updated {patient.lastUpdated}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
