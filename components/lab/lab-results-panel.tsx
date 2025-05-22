"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Printer,
  Share2,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LabTest {
  id: string
  name: string
  value: number | string
  unit: string
  referenceRange: string
  status: "normal" | "abnormal" | "critical" | "pending"
  timestamp: string
  trend?: "increasing" | "decreasing" | "stable"
  previousValue?: number | string
  notes?: string
}

interface LabPanel {
  id: string
  name: string
  category: string
  collectedAt: string
  receivedAt: string
  reportedAt: string
  status: "complete" | "partial" | "pending"
  tests: LabTest[]
  provider: string
  specimenType: string
  specimenId: string
  orderedBy: string
  notes?: string
}

interface LabResultsPanelProps {
  patientId?: string
  initialPanels?: LabPanel[]
  isLoading?: boolean
  onPanelSelect?: (panel: LabPanel) => void
}

/**
 * Professional lab results panel component
 * Displays laboratory test results with reference ranges and abnormal highlighting
 */
export function LabResultsPanel({ patientId, initialPanels, isLoading = false, onPanelSelect }: LabResultsPanelProps) {
  const [panels, setPanels] = useState<LabPanel[]>(initialPanels || [])
  const [selectedPanel, setSelectedPanel] = useState<LabPanel | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch lab panels if not provided
  useEffect(() => {
    if (initialPanels) {
      setPanels(initialPanels)
      if (initialPanels.length > 0) {
        setSelectedPanel(initialPanels[0])
      }
      return
    }

    if (isLoading) return

    // Simulate fetching lab data
    const fetchLabPanels = async () => {
      // In a real app, this would be an API call
      const mockPanels: LabPanel[] = [
        {
          id: "panel1",
          name: "Complete Blood Count (CBC)",
          category: "Hematology",
          collectedAt: "2023-05-15T09:30:00Z",
          receivedAt: "2023-05-15T10:15:00Z",
          reportedAt: "2023-05-15T14:45:00Z",
          status: "complete",
          provider: "Central Clinical Laboratory",
          specimenType: "Whole Blood",
          specimenId: "WB-2023-05-15-001",
          orderedBy: "Dr. Sarah Johnson",
          tests: [
            {
              id: "test1",
              name: "White Blood Cell Count (WBC)",
              value: 6.8,
              unit: "10^3/µL",
              referenceRange: "4.5-11.0",
              status: "normal",
              timestamp: "2023-05-15T14:30:00Z",
              trend: "stable",
              previousValue: 6.5,
            },
            {
              id: "test2",
              name: "Red Blood Cell Count (RBC)",
              value: 4.2,
              unit: "10^6/µL",
              referenceRange: "4.0-5.2",
              status: "normal",
              timestamp: "2023-05-15T14:30:00Z",
              trend: "decreasing",
              previousValue: 4.5,
            },
            {
              id: "test3",
              name: "Hemoglobin (Hgb)",
              value: 11.8,
              unit: "g/dL",
              referenceRange: "12.0-16.0",
              status: "abnormal",
              timestamp: "2023-05-15T14:30:00Z",
              trend: "decreasing",
              previousValue: 12.3,
              notes: "Mild anemia indicated",
            },
            {
              id: "test4",
              name: "Hematocrit (Hct)",
              value: 35.2,
              unit: "%",
              referenceRange: "36.0-46.0",
              status: "abnormal",
              timestamp: "2023-05-15T14:30:00Z",
              trend: "decreasing",
              previousValue: 37.1,
            },
            {
              id: "test5",
              name: "Platelet Count",
              value: 245,
              unit: "10^3/µL",
              referenceRange: "150-450",
              status: "normal",
              timestamp: "2023-05-15T14:30:00Z",
              trend: "increasing",
              previousValue: 230,
            },
          ],
        },
        {
          id: "panel2",
          name: "Comprehensive Metabolic Panel (CMP)",
          category: "Chemistry",
          collectedAt: "2023-05-15T09:30:00Z",
          receivedAt: "2023-05-15T10:15:00Z",
          reportedAt: "2023-05-15T15:30:00Z",
          status: "complete",
          provider: "Central Clinical Laboratory",
          specimenType: "Serum",
          specimenId: "SR-2023-05-15-001",
          orderedBy: "Dr. Sarah Johnson",
          tests: [
            {
              id: "test6",
              name: "Glucose",
              value: 105,
              unit: "mg/dL",
              referenceRange: "70-99",
              status: "abnormal",
              timestamp: "2023-05-15T15:15:00Z",
              trend: "increasing",
              previousValue: 98,
              notes: "Slightly elevated",
            },
            {
              id: "test7",
              name: "Blood Urea Nitrogen (BUN)",
              value: 15,
              unit: "mg/dL",
              referenceRange: "7-20",
              status: "normal",
              timestamp: "2023-05-15T15:15:00Z",
              trend: "stable",
              previousValue: 14,
            },
            {
              id: "test8",
              name: "Creatinine",
              value: 0.9,
              unit: "mg/dL",
              referenceRange: "0.6-1.2",
              status: "normal",
              timestamp: "2023-05-15T15:15:00Z",
              trend: "stable",
              previousValue: 0.9,
            },
            {
              id: "test9",
              name: "Sodium",
              value: 138,
              unit: "mmol/L",
              referenceRange: "135-145",
              status: "normal",
              timestamp: "2023-05-15T15:15:00Z",
              trend: "stable",
              previousValue: 139,
            },
            {
              id: "test10",
              name: "Potassium",
              value: 5.2,
              unit: "mmol/L",
              referenceRange: "3.5-5.0",
              status: "abnormal",
              timestamp: "2023-05-15T15:15:00Z",
              trend: "increasing",
              previousValue: 4.8,
              notes: "Slightly elevated",
            },
          ],
        },
        {
          id: "panel3",
          name: "Lipid Panel",
          category: "Chemistry",
          collectedAt: "2023-05-15T09:30:00Z",
          receivedAt: "2023-05-15T10:15:00Z",
          reportedAt: "2023-05-15T16:00:00Z",
          status: "complete",
          provider: "Central Clinical Laboratory",
          specimenType: "Serum",
          specimenId: "SR-2023-05-15-002",
          orderedBy: "Dr. Sarah Johnson",
          tests: [
            {
              id: "test11",
              name: "Total Cholesterol",
              value: 210,
              unit: "mg/dL",
              referenceRange: "<200",
              status: "abnormal",
              timestamp: "2023-05-15T15:45:00Z",
              trend: "increasing",
              previousValue: 195,
              notes: "Elevated",
            },
            {
              id: "test12",
              name: "HDL Cholesterol",
              value: 45,
              unit: "mg/dL",
              referenceRange: ">40",
              status: "normal",
              timestamp: "2023-05-15T15:45:00Z",
              trend: "stable",
              previousValue: 46,
            },
            {
              id: "test13",
              name: "LDL Cholesterol",
              value: 135,
              unit: "mg/dL",
              referenceRange: "<100",
              status: "abnormal",
              timestamp: "2023-05-15T15:45:00Z",
              trend: "increasing",
              previousValue: 120,
              notes: "Elevated",
            },
            {
              id: "test14",
              name: "Triglycerides",
              value: 180,
              unit: "mg/dL",
              referenceRange: "<150",
              status: "abnormal",
              timestamp: "2023-05-15T15:45:00Z",
              trend: "increasing",
              previousValue: 160,
              notes: "Elevated",
            },
          ],
        },
        {
          id: "panel4",
          name: "Thyroid Function Panel",
          category: "Endocrinology",
          collectedAt: "2023-05-15T09:30:00Z",
          receivedAt: "2023-05-15T10:15:00Z",
          reportedAt: "",
          status: "pending",
          provider: "Central Clinical Laboratory",
          specimenType: "Serum",
          specimenId: "SR-2023-05-15-003",
          orderedBy: "Dr. Sarah Johnson",
          tests: [
            {
              id: "test15",
              name: "Thyroid Stimulating Hormone (TSH)",
              value: "Pending",
              unit: "µIU/mL",
              referenceRange: "0.4-4.0",
              status: "pending",
              timestamp: "2023-05-15T10:15:00Z",
            },
            {
              id: "test16",
              name: "Free T4",
              value: "Pending",
              unit: "ng/dL",
              referenceRange: "0.8-1.8",
              status: "pending",
              timestamp: "2023-05-15T10:15:00Z",
            },
            {
              id: "test17",
              name: "Free T3",
              value: "Pending",
              unit: "pg/mL",
              referenceRange: "2.3-4.2",
              status: "pending",
              timestamp: "2023-05-15T10:15:00Z",
            },
          ],
        },
      ]

      setPanels(mockPanels)
      setSelectedPanel(mockPanels[0])
    }

    fetchLabPanels()
  }, [initialPanels, isLoading, patientId])

  // Handle panel selection
  const handlePanelSelect = (panel: LabPanel) => {
    setSelectedPanel(panel)
    if (onPanelSelect) {
      onPanelSelect(panel)
    }
  }

  // Filter panels based on active tab
  const filteredPanels = panels.filter((panel) => {
    if (activeTab === "all") return true
    if (activeTab === "abnormal")
      return panel.tests.some((test) => test.status === "abnormal" || test.status === "critical")
    if (activeTab === "pending") return panel.status === "pending"
    return panel.category.toLowerCase() === activeTab.toLowerCase()
  })

  // Get unique categories for tabs
  const categories = Array.from(new Set(panels.map((panel) => panel.category)))

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Normal
          </Badge>
        )
      case "abnormal":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Abnormal
          </Badge>
        )
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  // Trend indicator
  const getTrendIndicator = (trend?: string) => {
    if (!trend) return null

    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      case "stable":
        return <span className="h-4 w-4 inline-block text-center text-gray-500">―</span>
      default:
        return null
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Pending"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Laboratory Results</CardTitle>
            <CardDescription>View and analyze patient laboratory test results</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print lab results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export as PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share with colleagues</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent py-3 px-4"
              >
                All Panels
              </TabsTrigger>
              <TabsTrigger
                value="abnormal"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent py-3 px-4"
              >
                Abnormal Results
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent py-3 px-4"
              >
                Pending
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category.toLowerCase()}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent py-3 px-4"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 h-full">
              {/* Panel list */}
              <div className="border-r md:max-h-[600px] overflow-y-auto">
                {filteredPanels.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No lab panels found</div>
                ) : (
                  <div className="divide-y">
                    {filteredPanels.map((panel) => (
                      <div
                        key={panel.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedPanel?.id === panel.id ? "bg-gray-100 dark:bg-gray-800" : ""
                        }`}
                        onClick={() => handlePanelSelect(panel)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{panel.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{panel.category}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              panel.status === "complete"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : panel.status === "partial"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {panel.status.charAt(0).toUpperCase() + panel.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {panel.status === "pending" ? "Collected: " : "Reported: "}
                              {formatDate(panel.status === "pending" ? panel.collectedAt : panel.reportedAt)}
                            </span>
                          </div>
                        </div>
                        {panel.tests.some((test) => test.status === "abnormal" || test.status === "critical") && (
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            >
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Abnormal Results
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel details */}
              <div className="col-span-2 md:max-h-[600px] overflow-y-auto">
                {selectedPanel ? (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedPanel.name}</h2>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Specimen:</span> {selectedPanel.specimenType} (
                            {selectedPanel.specimenId})
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Provider:</span> {selectedPanel.provider}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Ordered by:</span> {selectedPanel.orderedBy}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Collected:</span> {formatDate(selectedPanel.collectedAt)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Received:</span> {formatDate(selectedPanel.receivedAt)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Reported:</span> {formatDate(selectedPanel.reportedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Test</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Result</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                              Reference Range
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedPanel.tests.map((test) => (
                            <tr
                              key={test.id}
                              className={`${
                                test.status === "abnormal"
                                  ? "bg-amber-50 dark:bg-amber-900/10"
                                  : test.status === "critical"
                                    ? "bg-red-50 dark:bg-red-900/10"
                                    : ""
                              }`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{test.name}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {test.value} {test.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                {test.referenceRange}
                              </td>
                              <td className="px-4 py-3">{getStatusBadge(test.status)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {getTrendIndicator(test.trend)}
                                  {test.previousValue && (
                                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                      {typeof test.previousValue === "number" ? test.previousValue : test.previousValue}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {selectedPanel.notes && (
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Notes
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedPanel.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-center text-gray-500">
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>Select a lab panel to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t p-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
          <span>
            Results should be interpreted by a healthcare professional in the context of clinical findings and patient
            history.
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
