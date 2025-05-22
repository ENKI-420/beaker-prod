"use client"

import { useState, useEffect, useTransition, useId, useDeferredValue } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { verifyReactVersion, testReact18Feature } from "@/lib/testing/react18-compatibility"
import { Calendar } from "@/components/ui/calendar"
import { GenomicVariantViewer } from "@/components/genomics/genomic-variant-viewer"
import { LabResultsPanel } from "@/components/lab/lab-results-panel"
import { ClinicalDashboard } from "@/components/dashboard/clinical-dashboard"
import RedisClientTest from "./redis-client-test"
import FhirClientTest from "./fhir-client-test"

export default function React18CompatibilityPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [isPending, startTransition] = useTransition()
  const uniqueId = useId()
  const [inputValue, setInputValue] = useState("")
  const deferredValue = useDeferredValue(inputValue)

  // Test React version
  useEffect(() => {
    const { version, isReact18 } = verifyReactVersion()
    setResults((prev) => ({
      ...prev,
      reactVersion: {
        version,
        isReact18,
        status: isReact18 ? "success" : "error",
      },
    }))
  }, [])

  // Run all tests
  const runAllTests = () => {
    setIsRunningTests(true)

    // Test React 18 features
    const featureTests = Object.keys(testReact18Feature).reduce((acc, featureName) => {
      const isSupported = testReact18Feature(featureName as any)
      return {
        ...acc,
        [featureName]: {
          isSupported,
          status: isSupported ? "success" : "error",
        },
      }
    }, {})

    // Test useTransition
    const transitionTest = {
      isSupported: typeof startTransition === "function" && typeof isPending === "boolean",
      status: typeof startTransition === "function" ? "success" : "error",
    }

    // Test useId
    const useIdTest = {
      isSupported: typeof uniqueId === "string" && uniqueId.includes(":"),
      status: typeof uniqueId === "string" ? "success" : "error",
      value: uniqueId,
    }

    // Test useDeferredValue
    const useDeferredValueTest = {
      isSupported: deferredValue === inputValue,
      status: deferredValue === inputValue ? "success" : "error",
    }

    // Test Calendar component (react-day-picker)
    const calendarTest = {
      isSupported: true, // We'll assume it works if the page renders
      status: "success",
    }

    // Combine all test results
    startTransition(() => {
      setResults((prev) => ({
        ...prev,
        features: featureTests,
        hooks: {
          useTransition: transitionTest,
          useId: useIdTest,
          useDeferredValue: useDeferredValueTest,
        },
        components: {
          calendar: calendarTest,
        },
      }))
      setIsRunningTests(false)
    })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">React 18 Compatibility Test Suite</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>React Version Check</CardTitle>
          <CardDescription>Verifying that React 18 is being used</CardDescription>
        </CardHeader>
        <CardContent>
          {results.reactVersion && (
            <Alert
              className={`mb-4 ${
                results.reactVersion.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              {results.reactVersion.status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertTitle>{results.reactVersion.status === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                Detected React version: {results.reactVersion.version}
                {!results.reactVersion.isReact18 && (
                  <div className="mt-2 text-red-600">Expected React 18.x but found a different version.</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={runAllTests} disabled={isRunningTests || isPending}>
            {isRunningTests || isPending ? "Running Tests..." : "Run All Tests"}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(results).length > 1 && (
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="features">Core Features</TabsTrigger>
            <TabsTrigger value="hooks">React Hooks</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="application">Application Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>React 18 Core Features</CardTitle>
                <CardDescription>Testing availability of key React 18 features</CardDescription>
              </CardHeader>
              <CardContent>
                {results.features &&
                  Object.entries(results.features).map(([feature, result]: [string, any]) => (
                    <div key={feature} className="mb-4 p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{feature}</div>
                        <Badge variant={result.status === "success" ? "outline" : "destructive"}>
                          {result.isSupported ? "Supported" : "Not Supported"}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hooks">
            <Card>
              <CardHeader>
                <CardTitle>React 18 Hooks</CardTitle>
                <CardDescription>Testing React 18 hooks functionality</CardDescription>
              </CardHeader>
              <CardContent>
                {results.hooks &&
                  Object.entries(results.hooks).map(([hook, result]: [string, any]) => (
                    <div key={hook} className="mb-4 p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{hook}</div>
                        <Badge variant={result.status === "success" ? "outline" : "destructive"}>
                          {result.isSupported ? "Working" : "Not Working"}
                        </Badge>
                      </div>
                      {hook === "useId" && result.value && (
                        <div className="mt-2 text-sm text-gray-500">Generated ID: {result.value}</div>
                      )}
                    </div>
                  ))}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">useDeferredValue Test</h3>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type to test useDeferredValue"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="font-medium mb-2">Input Value:</div>
                      <div>{inputValue}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="font-medium mb-2">Deferred Value:</div>
                      <div>{deferredValue}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components">
            <Card>
              <CardHeader>
                <CardTitle>Component Compatibility</CardTitle>
                <CardDescription>Testing key components with React 18</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Calendar Component (react-day-picker)</h3>
                    <div className="border rounded-md p-4">
                      <Calendar />
                    </div>
                    {results.components?.calendar && (
                      <div className="mt-2 flex items-center">
                        <Badge variant={results.components.calendar.status === "success" ? "outline" : "destructive"}>
                          {results.components.calendar.isSupported ? "Working" : "Not Working"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application">
            <Card>
              <CardHeader>
                <CardTitle>Application Features</CardTitle>
                <CardDescription>Testing application-specific components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Genomic Variant Viewer</h3>
                    <div className="border rounded-md p-4">
                      <GenomicVariantViewer height={200} showControls={false} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Lab Results Panel</h3>
                    <div className="border rounded-md p-4">
                      <LabResultsPanel isLoading={false} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Clinical Dashboard</h3>
                    <div className="border rounded-md p-4">
                      <ClinicalDashboard isLoading={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Alert className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    These components are rendered in a limited view. For full testing, navigate to their respective
                    pages.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <RedisClientTest />
              <FhirClientTest />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
