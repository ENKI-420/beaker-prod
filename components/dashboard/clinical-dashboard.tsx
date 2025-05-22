"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GenomicVariantViewer } from "@/components/genomics/genomic-variant-viewer"
import { LabResultsPanel } from "@/components/lab/lab-results-panel"
import { PatientSummary } from "@/components/patients/patient-summary"
import {
  Users,
  FileText,
  AlertTriangle,
  Activity,
  Calendar,
  TrendingUp,
  Clock,
  Dna,
  Microscope,
  Pill,
  Clipboard,
  Beaker,
  HeartPulse,
  Brain,
  Stethoscope,
} from "lucide-react"

interface ClinicalDashboardProps {
  isLoading?: boolean
}

/**
 * Enhanced clinical dashboard component
 * Provides a comprehensive view of clinical data for healthcare professionals
 */
export function ClinicalDashboard({ isLoading = false }: ClinicalDashboardProps) {
  const [stats, setStats] = useState({
    patients: 0,
    reports: 0,
    alerts: 0,
    tasks: 0,
    genomicTests: 0,
    labResults: 0,
  })

  // Simulate data loading
  useEffect(() => {
    if (isLoading) return

    const timer = setTimeout(() => {
      setStats({
        patients: 128,
        reports: 47,
        alerts: 5,
        tasks: 12,
        genomicTests: 34,
        labResults: 89,
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [isLoading])

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Patients"
          value={stats.patients}
          description="Active patients"
          icon={Users}
          trend="+12% from last month"
          isLoading={isLoading}
          href="/patients"
        />
        <StatsCard
          title="Genomic Tests"
          value={stats.genomicTests}
          description="Completed tests"
          icon={Dna}
          trend="+8% from last month"
          isLoading={isLoading}
          color="indigo"
          href="/genomic-tests"
        />
        <StatsCard
          title="Lab Results"
          value={stats.labResults}
          description="Available results"
          icon={Beaker}
          trend="+15% from last month"
          isLoading={isLoading}
          color="blue"
          href="/lab-results"
        />
        <StatsCard
          title="Reports"
          value={stats.reports}
          description="Medical reports"
          icon={FileText}
          trend="+5% from last month"
          isLoading={isLoading}
          color="teal"
          href="/reports"
        />
        <StatsCard
          title="Alerts"
          value={stats.alerts}
          description="Requiring attention"
          icon={AlertTriangle}
          trend="-2 from yesterday"
          isLoading={isLoading}
          color="amber"
          href="/alerts"
        />
        <StatsCard
          title="Tasks"
          value={stats.tasks}
          description="Pending tasks"
          icon={Clock}
          trend="+3 new tasks"
          isLoading={isLoading}
          color="purple"
          href="/tasks"
        />
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-800 p-1 border">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="genomics"
            className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
          >
            <Dna className="h-4 w-4 mr-2" />
            Genomics
          </TabsTrigger>
          <TabsTrigger value="lab" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">
            <Microscope className="h-4 w-4 mr-2" />
            Laboratory
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Patients
          </TabsTrigger>
          <TabsTrigger
            value="clinical"
            className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Clinical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent activity card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Clinical Activity
                </CardTitle>
                <CardDescription>Recent clinical and laboratory activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ClinicalActivityTimeline isLoading={isLoading} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>

            {/* Quick actions card */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Actions</CardTitle>
                <CardDescription>Common clinical tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickActionButton icon={Microscope} label="Order Lab Test" href="/lab/order" />
                <QuickActionButton icon={Dna} label="Request Genomic Analysis" href="/genomics/request" />
                <QuickActionButton icon={Pill} label="Review Medications" href="/medications" />
                <QuickActionButton icon={Clipboard} label="Create Clinical Note" href="/notes/new" />
                <QuickActionButton icon={Calendar} label="Schedule Appointment" href="/appointments/new" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Genomic variants preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dna className="mr-2 h-5 w-5 text-indigo-600" />
                  Recent Genomic Findings
                </CardTitle>
                <CardDescription>Latest genomic variants of interest</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <GenomicVariantViewer height={300} isLoading={isLoading} showControls={false} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  View Full Genomic Dashboard
                </Button>
              </CardFooter>
            </Card>

            {/* Lab results preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Beaker className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Laboratory Results
                </CardTitle>
                <CardDescription>Latest laboratory test results</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LabResultsPanel isLoading={isLoading} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  View All Lab Results
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="genomics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genomic Analysis Dashboard</CardTitle>
              <CardDescription>Comprehensive view of genomic variants and interpretations</CardDescription>
            </CardHeader>
            <CardContent>
              <GenomicVariantViewer height={500} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Results Dashboard</CardTitle>
              <CardDescription>Comprehensive view of laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <LabResultsPanel isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>View and manage patient records</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientSummary limit={10} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Decision Support</CardTitle>
              <CardDescription>AI-powered clinical decision support tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ClinicalDecisionCard
                  title="Treatment Recommendations"
                  description="AI-generated treatment recommendations based on genomic profile"
                  icon={Pill}
                  isLoading={isLoading}
                />
                <ClinicalDecisionCard
                  title="Disease Risk Assessment"
                  description="Personalized disease risk assessment based on genetic variants"
                  icon={HeartPulse}
                  isLoading={isLoading}
                />
                <ClinicalDecisionCard
                  title="Pharmacogenomics"
                  description="Medication response predictions based on genetic profile"
                  icon={Brain}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Stats card component
interface StatsCardProps {
  title: string
  value: number
  description: string
  icon: React.ElementType
  trend: string
  isLoading: boolean
  color?: "blue" | "green" | "amber" | "red" | "indigo" | "purple" | "teal"
  href?: string
}

function StatsCard({ title, value, description, icon: Icon, trend, isLoading, color = "green", href }: StatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    purple: "text-purple-600 dark:text-purple-400",
    teal: "text-teal-600 dark:text-teal-400",
  }

  const bgColorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
    teal: "bg-teal-50 dark:bg-teal-900/20",
  }

  const iconClass = colorClasses[color]
  const bgClass = bgColorClasses[color]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgClass}`}>
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center text-xs">
          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
          <span className="text-green-500">{trend}</span>
        </div>
      </CardContent>
      {href && (
        <CardFooter className="p-2">
          <a href={href} className="text-xs text-blue-600 hover:underline w-full text-right">
            View details →
          </a>
        </CardFooter>
      )}
    </Card>
  )
}

// Quick action button component
interface QuickActionButtonProps {
  icon: React.ElementType
  label: string
  href: string
}

function QuickActionButton({ icon: Icon, label, href }: QuickActionButtonProps) {
  return (
    <Button variant="outline" className="w-full justify-start" asChild>
      <a href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  )
}

// Clinical activity timeline component
function ClinicalActivityTimeline({ isLoading }: { isLoading: boolean }) {
  const activities = [
    {
      id: 1,
      action: "Genomic variant analysis completed",
      patient: "Sarah Johnson",
      time: "2 hours ago",
      icon: Dna,
      color: "indigo",
    },
    {
      id: 2,
      action: "Lab results received",
      patient: "Michael Chen",
      time: "4 hours ago",
      icon: Beaker,
      color: "blue",
    },
    {
      id: 3,
      action: "Treatment plan updated",
      patient: "Emma Rodriguez",
      time: "Yesterday",
      icon: Clipboard,
      color: "teal",
    },
    {
      id: 4,
      action: "Medication prescribed",
      patient: "James Wilson",
      time: "Yesterday",
      icon: Pill,
      color: "purple",
    },
    {
      id: 5,
      action: "Clinical note added",
      patient: "Olivia Martinez",
      time: "2 days ago",
      icon: FileText,
      color: "gray",
    },
  ]

  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
    amber: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20",
    red: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
    indigo: "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20",
    purple: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20",
    teal: "text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/20",
    gray: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20",
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start space-x-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon
        const colorClass = colorClasses[activity.color as keyof typeof colorClasses] || colorClasses.gray

        return (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className={`p-2 rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {activity.action} -{" "}
                <a href={`/patients/${activity.id}`} className="text-blue-600 hover:underline">
                  {activity.patient}
                </a>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Clinical decision card component
interface ClinicalDecisionCardProps {
  title: string
  description: string
  icon: React.ElementType
  isLoading: boolean
}

function ClinicalDecisionCard({ title, description, icon: Icon, isLoading }: ClinicalDecisionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
            <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            <div className="mt-4">
              <Button size="sm">View Recommendations</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
