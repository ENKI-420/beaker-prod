import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllServices, ServiceStatus } from "@/lib/agent/services-registry"
import { FhirAuthButton } from "@/components/fhir/fhir-auth-button"
import {
  Activity,
  Dna,
  FileText,
  Layers,
  Link,
  MessageSquare,
  Mic,
  Percent,
  Play,
  Settings,
  Shield,
  TrendingUp,
  Video,
} from "lucide-react"

/**
 * AGENT Clinical AI Services Dashboard
 */
export default function ServicesPage() {
  const services = getAllServices()

  // Map service IDs to icons
  const serviceIcons: Record<string, React.ReactNode> = {
    "adaptive-presentation": <Layers className="h-5 w-5" />,
    "genomic-data-enrichment": <Dna className="h-5 w-5" />,
    "fhir-oauth2-sync": <Link className="h-5 w-5" />,
    "auto-advance-narrator": <Mic className="h-5 w-5" />,
    "mentor-mode": <FileText className="h-5 w-5" />,
    "rbac-enforcement": <Shield className="h-5 w-5" />,
    "clinical-confidence-scoring": <Percent className="h-5 w-5" />,
    "investor-mode": <TrendingUp className="h-5 w-5" />,
    "auto-capture-presentation": <Video className="h-5 w-5" />,
    "context-aware-prompt-sync": <MessageSquare className="h-5 w-5" />,
  }

  // Map status to badge variant
  const statusBadgeVariant: Record<ServiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
    [ServiceStatus.AVAILABLE]: "default",
    [ServiceStatus.UNAVAILABLE]: "destructive",
    [ServiceStatus.DEGRADED]: "secondary",
    [ServiceStatus.MAINTENANCE]: "outline",
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AGENT Clinical AI Services</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Access and manage AI-powered clinical services for genomic analysis and healthcare workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-md bg-primary/10">
                    {serviceIcons[service.id] || <Activity className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{service.mode}</CardDescription>
                  </div>
                </div>
                <Badge variant={statusBadgeVariant[service.status]}>
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{service.description}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>
                  <span className="font-medium">Function:</span> {service.function}
                </div>
                <div>
                  <span className="font-medium">Trigger:</span> {service.trigger}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              {service.id === "fhir-oauth2-sync" ? (
                <FhirAuthButton variant="default" size="sm">
                  Connect to Epic FHIR
                </FhirAuthButton>
              ) : (
                <Button variant="default" size="sm" disabled={service.status !== ServiceStatus.AVAILABLE}>
                  <Play className="mr-2 h-4 w-4" />
                  Launch Service
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
