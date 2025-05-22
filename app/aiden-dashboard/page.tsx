"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AidenTaskCard } from "@/components/aiden/aiden-task-card"
import { AidenRealTimeFeed } from "@/components/aiden/aiden-real-time-feed"
import { AidenTaskType } from "@/lib/aiden/aiden-client"
import { AidenWebSocketEventType } from "@/lib/aiden/aiden-websocket"
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Brain,
  Dna,
  FileText,
  Microscope,
  Pill,
  Plus,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react"

/**
 * AIDEN Dashboard Page
 * Central hub for AI orchestration and task management
 */
export default function AidenDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AIDEN AI Orchestration</h1>
            <p className="text-muted-foreground">
              Advanced Integrated Defense Execution Node - AI Orchestration Platform
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Main content tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white dark:bg-gray-800 p-1 border">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">
              <Brain className="h-4 w-4 mr-2" />
              AI Tasks
            </TabsTrigger>
            <TabsTrigger
              value="genomics"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              <Dna className="h-4 w-4 mr-2" />
              Genomics
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Active Tasks"
                value={12}
                description="AI tasks in progress"
                icon={Brain}
                trend="+5 from yesterday"
                color="indigo"
              />
              <StatsCard
                title="Genomic Analyses"
                value={34}
                description="Completed analyses"
                icon={Dna}
                trend="+8 this week"
                color="blue"
              />
              <StatsCard
                title="Anomalies Detected"
                value={3}
                description="Requiring attention"
                icon={AlertTriangle}
                trend="-2 from yesterday"
                color="amber"
              />
              <StatsCard
                title="Processing Power"
                value="87%"
                description="Current utilization"
                icon={Zap}
                trend="+12% from average"
                color="green"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Real-time feed */}
              <AidenRealTimeFeed
                subscriptions={[
                  AidenWebSocketEventType.TASK_UPDATE,
                  AidenWebSocketEventType.ANOMALY_DETECTED,
                  AidenWebSocketEventType.SYSTEM_NOTIFICATION,
                ]}
              />

              {/* Recent tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Tasks</CardTitle>
                  <CardDescription>Latest tasks submitted to AIDEN</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TaskListItem
                    title="Genomic Variant Analysis"
                    type={AidenTaskType.GENOMIC_ANALYSIS}
                    status="completed"
                    timestamp="10 minutes ago"
                    icon={Dna}
                  />
                  <TaskListItem
                    title="Treatment Recommendation"
                    type={AidenTaskType.DECISION_SUPPORT}
                    status="processing"
                    timestamp="25 minutes ago"
                    icon={Pill}
                  />
                  <TaskListItem
                    title="Compliance Verification"
                    type={AidenTaskType.COMPLIANCE_VERIFICATION}
                    status="completed"
                    timestamp="1 hour ago"
                    icon={Shield}
                  />
                  <TaskListItem
                    title="Lab Results Analysis"
                    type={AidenTaskType.DATA_ANALYSIS}
                    status="queued"
                    timestamp="2 hours ago"
                    icon={Microscope}
                  />
                  <TaskListItem
                    title="Report Generation"
                    type={AidenTaskType.REPORT_GENERATION}
                    status="failed"
                    timestamp="3 hours ago"
                    icon={FileText}
                  />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Tasks
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Genomic analysis task */}
              <AidenTaskCard
                title="Genomic Variant Analysis"
                description="Analyzing genomic variants for clinical significance"
                taskType={AidenTaskType.GENOMIC_ANALYSIS}
                taskId="task-123456"
              />

              {/* Anomaly detection task */}
              <AidenTaskCard
                title="Security Anomaly Detection"
                description="Detecting security anomalies in system access patterns"
                taskType={AidenTaskType.ANOMALY_DETECTION}
                taskId="task-789012"
              />

              {/* Report generation task */}
              <AidenTaskCard
                title="Clinical Report Generation"
                description="Generating comprehensive clinical reports from patient data"
                taskType={AidenTaskType.REPORT_GENERATION}
                taskId="task-345678"
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Task Management</CardTitle>
                <CardDescription>Submit and monitor AI tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Task management interface will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="genomics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Genomic Analysis</CardTitle>
                <CardDescription>AI-powered genomic data analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Genomic analysis interface will be implemented here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>Security monitoring and compliance verification</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Security and compliance interface will be implemented here</p>
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
  value: number | string
  description: string
  icon: React.ElementType
  trend: string
  color?: "blue" | "green" | "amber" | "red" | "indigo" | "purple" | "teal"
}

function StatsCard({ title, value, description, icon: Icon, trend, color = "blue" }: StatsCardProps) {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgClass}`}>
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center text-xs">
          <BarChart2 className="mr-1 h-3 w-3 text-green-500" />
          <span className="text-green-500">{trend}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Task list item component
interface TaskListItemProps {
  title: string
  type: AidenTaskType
  status: "queued" | "processing" | "completed" | "failed" | "cancelled"
  timestamp: string
  icon: React.ElementType
}

function TaskListItem({ title, type, status, timestamp, icon: Icon }: TaskListItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
    }
  }

  const getStatusClass = () => {
    switch (status) {
      case "queued":
        return "text-gray-500"
      case "processing":
        return "text-blue-500"
      case "completed":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      case "cancelled":
        return "text-amber-500"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div className="flex items-center">
        <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-full mr-3">
          <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`text-xs font-medium mr-2 ${getStatusClass()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {getStatusIcon()}
      </div>
    </div>
  )
}

// Missing components referenced above
function Clock(props: any) {
  return <RefreshCw {...props} />
}

function CheckCircle(props: any) {
  return <RefreshCw {...props} />
}

function XCircle(props: any) {
  return <AlertTriangle {...props} />
}
