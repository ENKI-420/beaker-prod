"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast-provider"
import { RoleType } from "@/lib/auth/permissions"
import {
  ContentType,
  ToneType,
  DetailLevel,
  type StakeholderProfile,
  type PresentationConfig,
} from "@/lib/agent/services/adaptive-presentation"
import { Loader2, Presentation, Users, FileText } from "lucide-react"

interface PresentationCreatorProps {
  defaultRole?: RoleType | string
  contentId?: string
  onCreated?: (presentationId: string) => void
}

/**
 * Presentation Creator Component
 * Allows users to create adaptive presentations for different stakeholders
 */
export function PresentationCreator({
  defaultRole = RoleType.CLINICIAN,
  contentId,
  onCreated,
}: PresentationCreatorProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("stakeholder")

  // Stakeholder profile state
  const [stakeholder, setStakeholder] = useState<StakeholderProfile>({
    role: defaultRole,
    specialties: [],
    interests: [],
    knowledgeLevel: "intermediate",
  })

  // Presentation config state
  const [config, setConfig] = useState<Partial<PresentationConfig>>({
    title: "",
    description: "",
    contentTypes: [ContentType.CLINICAL, ContentType.EDUCATIONAL],
    toneType: ToneType.CONVERSATIONAL,
    detailLevel: DetailLevel.MEDIUM,
    includeMetrics: true,
    includeVisuals: true,
    includeCitations: false,
  })

  // Handle stakeholder role change
  const handleRoleChange = (role: RoleType | string) => {
    setStakeholder((prev) => ({ ...prev, role }))
  }

  // Handle knowledge level change
  const handleKnowledgeLevelChange = (level: "beginner" | "intermediate" | "expert") => {
    setStakeholder((prev) => ({ ...prev, knowledgeLevel: level }))
  }

  // Handle content type toggle
  const handleContentTypeToggle = (type: ContentType, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      contentTypes: checked
        ? [...(prev.contentTypes || []), type]
        : (prev.contentTypes || []).filter((t) => t !== type),
    }))
  }

  // Handle tone type change
  const handleToneChange = (tone: ToneType) => {
    setConfig((prev) => ({ ...prev, toneType: tone }))
  }

  // Handle detail level change
  const handleDetailLevelChange = (level: DetailLevel) => {
    setConfig((prev) => ({ ...prev, detailLevel: level }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (field: "includeMetrics" | "includeVisuals" | "includeCitations", checked: boolean) => {
    setConfig((prev) => ({ ...prev, [field]: checked }))
  }

  // Handle next tab
  const handleNextTab = () => {
    if (activeTab === "stakeholder") {
      setActiveTab("content")
    } else if (activeTab === "content") {
      handleCreatePresentation()
    }
  }

  // Handle previous tab
  const handlePreviousTab = () => {
    if (activeTab === "content") {
      setActiveTab("stakeholder")
    }
  }

  // Handle create presentation
  const handleCreatePresentation = async () => {
    try {
      setIsLoading(true)

      // Validate stakeholder
      if (!stakeholder.role) {
        addToast({
          type: "error",
          title: "Validation Error",
          message: "Stakeholder role is required",
        })
        return
      }

      // Validate content types
      if (!config.contentTypes || config.contentTypes.length === 0) {
        addToast({
          type: "error",
          title: "Validation Error",
          message: "At least one content type is required",
        })
        return
      }

      // Create presentation
      const response = await fetch("/api/presentations/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeholder,
          config,
          contentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create presentation")
      }

      const data = await response.json()
      const presentationId = data.presentation.id

      // Show success toast
      addToast({
        type: "success",
        title: "Presentation Created",
        message: "Your adaptive presentation has been created successfully",
      })

      // Navigate to presentation or call onCreated callback
      if (onCreated) {
        onCreated(presentationId)
      } else {
        router.push(`/presentations/${presentationId}`)
      }
    } catch (error) {
      console.error("Error creating presentation:", error)
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create presentation",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Presentation className="mr-2 h-5 w-5 text-primary" />
          Create Adaptive Presentation
        </CardTitle>
        <CardDescription>
          Generate a stakeholder-aware presentation with content tailored to your audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stakeholder" disabled={isLoading}>
              <Users className="mr-2 h-4 w-4" />
              Stakeholder Profile
            </TabsTrigger>
            <TabsTrigger value="content" disabled={isLoading}>
              <FileText className="mr-2 h-4 w-4" />
              Content Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stakeholder" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Stakeholder Role</Label>
                <Select value={stakeholder.role} onValueChange={handleRoleChange} disabled={isLoading}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RoleType.CLINICIAN}>Clinician</SelectItem>
                    <SelectItem value={RoleType.RESEARCHER}>Researcher</SelectItem>
                    <SelectItem value={RoleType.LAB_TECHNICIAN}>Lab Technician</SelectItem>
                    <SelectItem value={RoleType.ADMIN}>Administrator</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="knowledge-level">Knowledge Level</Label>
                <Select
                  value={stakeholder.knowledgeLevel}
                  onValueChange={handleKnowledgeLevelChange as (value: string) => void}
                  disabled={isLoading}
                >
                  <SelectTrigger id="knowledge-level">
                    <SelectValue placeholder="Select knowledge level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialties">Specialties (comma separated)</Label>
                <Input
                  id="specialties"
                  placeholder="e.g., Oncology, Cardiology, Pediatrics"
                  disabled={isLoading}
                  value={stakeholder.specialties?.join(", ") || ""}
                  onChange={(e) =>
                    setStakeholder((prev) => ({
                      ...prev,
                      specialties: e.target.value.split(",").map((s) => s.trim()),
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input
                  id="interests"
                  placeholder="e.g., Genomics, Precision Medicine, Clinical Trials"
                  disabled={isLoading}
                  value={stakeholder.interests?.join(", ") || ""}
                  onChange={(e) =>
                    setStakeholder((prev) => ({
                      ...prev,
                      interests: e.target.value.split(",").map((s) => s.trim()),
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Presentation Title</Label>
                <Input
                  id="title"
                  placeholder="Enter presentation title"
                  disabled={isLoading}
                  value={config.title || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter presentation description"
                  disabled={isLoading}
                  value={config.description || ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label className="block mb-2">Content Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content-clinical"
                      checked={config.contentTypes?.includes(ContentType.CLINICAL)}
                      onCheckedChange={(checked) => handleContentTypeToggle(ContentType.CLINICAL, checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="content-clinical" className="cursor-pointer">
                      Clinical
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content-technical"
                      checked={config.contentTypes?.includes(ContentType.TECHNICAL)}
                      onCheckedChange={(checked) => handleContentTypeToggle(ContentType.TECHNICAL, checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="content-technical" className="cursor-pointer">
                      Technical
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content-financial"
                      checked={config.contentTypes?.includes(ContentType.FINANCIAL)}
                      onCheckedChange={(checked) => handleContentTypeToggle(ContentType.FINANCIAL, checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="content-financial" className="cursor-pointer">
                      Financial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content-regulatory"
                      checked={config.contentTypes?.includes(ContentType.REGULATORY)}
                      onCheckedChange={(checked) => handleContentTypeToggle(ContentType.REGULATORY, checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="content-regulatory" className="cursor-pointer">
                      Regulatory
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="content-educational"
                      checked={config.contentTypes?.includes(ContentType.EDUCATIONAL)}
                      onCheckedChange={(checked) =>
                        handleContentTypeToggle(ContentType.EDUCATIONAL, checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="content-educational" className="cursor-pointer">
                      Educational
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={config.toneType}
                  onValueChange={handleToneChange as (value: string) => void}
                  disabled={isLoading}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ToneType.FORMAL}>Formal</SelectItem>
                    <SelectItem value={ToneType.CONVERSATIONAL}>Conversational</SelectItem>
                    <SelectItem value={ToneType.TECHNICAL}>Technical</SelectItem>
                    <SelectItem value={ToneType.SIMPLIFIED}>Simplified</SelectItem>
                    <SelectItem value={ToneType.PERSUASIVE}>Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="detail-level">Detail Level</Label>
                <Select
                  value={config.detailLevel}
                  onValueChange={handleDetailLevelChange as (value: string) => void}
                  disabled={isLoading}
                >
                  <SelectTrigger id="detail-level">
                    <SelectValue placeholder="Select detail level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DetailLevel.HIGH}>High</SelectItem>
                    <SelectItem value={DetailLevel.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={DetailLevel.LOW}>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metrics"
                    checked={config.includeMetrics}
                    onCheckedChange={(checked) => handleCheckboxChange("includeMetrics", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="include-metrics" className="cursor-pointer">
                    Include Metrics
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-visuals"
                    checked={config.includeVisuals}
                    onCheckedChange={(checked) => handleCheckboxChange("includeVisuals", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="include-visuals" className="cursor-pointer">
                    Include Visuals
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-citations"
                    checked={config.includeCitations}
                    onCheckedChange={(checked) => handleCheckboxChange("includeCitations", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="include-citations" className="cursor-pointer">
                    Include Citations
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {activeTab === "stakeholder" ? (
          <div></div>
        ) : (
          <Button variant="outline" onClick={handlePreviousTab} disabled={isLoading}>
            Previous
          </Button>
        )}
        <Button onClick={handleNextTab} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {activeTab === "stakeholder" ? "Next" : "Create Presentation"}
        </Button>
      </CardFooter>
    </Card>
  )
}
