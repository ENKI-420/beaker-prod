"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientSummary } from "@/components/patients/patient-summary"
import { RecentAlerts } from "@/components/alerts/recent-alerts"
import { TaskQueue } from "@/components/tasks/task-queue"
import { EpicStatusIndicator } from "@/components/epic/epic-status-indicator"
import { ClinicalDashboard } from "@/components/dashboard/clinical-dashboard"
import {
  Users,
  FileText,
  AlertTriangle,
  Activity,
  BarChart2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react"

/**
 * Enhanced dashboard page with improved layout and visual hierarchy
 */
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    patients: 0,
    reports: 0,
    alerts: 0,
    tasks: 0,
  })

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        patients: 128,
        reports: 47,
        alerts: 5,
        tasks: 12,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clinical Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive view of genomic and clinical data</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <EpicStatusIndicator />
            <Button asChild>
              <Link href="/patients">View All Patients</Link>
            </Button>
          </div>
        </div>

        {/* Clinical Dashboard Component */}
        <ClinicalDashboard />

        {/* Stats overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Patients"
            value={stats.patients}
            description="Active patient records"
            icon={Users}
            trend="+12% from last month"
            isLoading={isLoading}
            href="/patients"
          />
          <StatsCard
            title="Medical Reports"
            value={stats.reports}
            description="Available medical reports"
            icon={FileText}
            trend="+8% from last month"
            isLoading={isLoading}
            href="/reports"
          />
          <StatsCard
            title="Active Alerts"
            value={stats.alerts}
            description="Requiring attention"
            icon={AlertTriangle}
            trend="-2 from yesterday"
            isLoading={isLoading}
            color="amber"
            href="/alerts"
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.tasks}
            description="Tasks in your queue"
            icon={Clock}
            trend="+3 new tasks"
            isLoading={isLoading}
            color="blue"
            href="/tasks"
          />
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Recent Patients</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Recent activity card */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your recent genomic platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline isLoading={isLoading} />
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
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <QuickActionButton icon={Users} label="Add New Patient" href="/patients/new" />
                  <QuickActionButton icon={FileText} label="Upload Report" href="/reports/upload" />
                  <QuickActionButton icon={BarChart2} label="View Genomic Data" href="/genetic-variants" />
                  <QuickActionButton icon={Calendar} label="Schedule Appointment" href="/appointments/new" />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Patient summary card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Recent Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientSummary limit={5} isLoading={isLoading} />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild className="ml-auto">
                    <Link href="/patients">View All Patients</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Alerts card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentAlerts limit={5} isLoading={isLoading} />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Alerts
                  </Button>
                </CardFooter>
              </Card>

              {/* Tasks card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-600" />
                    Task Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskQueue limit={5} isLoading={isLoading} />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Tasks
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Patients you've recently interacted with</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientSummary limit={10} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Alerts requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAlerts limit={10} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Queue</CardTitle>
                <CardDescription>Your pending tasks and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskQueue limit={10} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
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
  color?: "blue" | "green" | "amber" | "red"
  href?: string
}

function StatsCard({ title, value, description, icon: Icon, trend, isLoading, color = "green", href }: StatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }

  const iconClass = colorClasses[color]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClass}`} />
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
          <Link href={href} className="text-xs text-blue-600 hover:underline w-full text-right">
            View details →
          </Link>
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
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}

// Activity timeline component
function ActivityTimeline({ isLoading }: { isLoading: boolean }) {
  const activities = [
    {
      id: 1,
      action: "Uploaded new genomic data",
      patient: "Sarah Johnson",
      time: "2 hours ago",
      icon: FileText,
    },
    {
      id: 2,
      action: "Reviewed lab results",
      patient: "Michael Chen",
      time: "4 hours ago",
      icon: CheckCircle2,
    },
    {
      id: 3,
      action: "Added new patient",
      patient: "Emma Rodriguez",
      time: "Yesterday",
      icon: Users,
    },
    {
      id: 4,
      action: "Updated treatment plan",
      patient: "James Wilson",
      time: "Yesterday",
      icon: Activity,
    },
    {
      id: 5,
      action: "Analyzed variant evolution",
      patient: "Olivia Martinez",
      time: "2 days ago",
      icon: BarChart2,
    },
  ]

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

        return (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {activity.action} -{" "}
                <Link href={`/patients/${activity.id}`} className="text-blue-600 hover:underline">
                  {activity.patient}
                </Link>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
