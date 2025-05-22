"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accessibility, ZoomIn, Type, Contrast, Eye, MousePointer, Monitor } from "lucide-react"

/**
 * Enhanced accessibility menu for clinical environments
 * Provides comprehensive accessibility controls for healthcare professionals
 */
export function ClinicalAccessibility() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [contrast, setContrast] = useState("normal")
  const [reducedMotion, setReducedMotion] = useState(false)
  const [largePointer, setLargePointer] = useState(false)
  const [dyslexicFont, setDyslexicFont] = useState(false)
  const [colorBlindMode, setColorBlindMode] = useState("none")
  const [screenReaderMode, setScreenReaderMode] = useState(false)

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
  }, [fontSize])

  // Apply contrast
  useEffect(() => {
    document.documentElement.classList.remove("high-contrast", "low-contrast")
    if (contrast !== "normal") {
      document.documentElement.classList.add(contrast)
    }
  }, [contrast])

  // Apply reduced motion
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }
  }, [reducedMotion])

  // Apply large pointer
  useEffect(() => {
    if (largePointer) {
      document.documentElement.classList.add("large-pointer")

      // Add custom cursor styles
      const style = document.createElement("style")
      style.id = "large-pointer-style"
      style.innerHTML = `
        .large-pointer, .large-pointer * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='black' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z'/%3E%3Cpath d='m13 13 6 6'/%3E%3C/svg%3E") 0 0, auto !important;
        }
      `
      document.head.appendChild(style)
    } else {
      document.documentElement.classList.remove("large-pointer")
      const existingStyle = document.getElementById("large-pointer-style")
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [largePointer])

  // Apply dyslexic font
  useEffect(() => {
    if (dyslexicFont) {
      document.documentElement.classList.add("dyslexic-font")

      // Add custom font styles
      const style = document.createElement("style")
      style.id = "dyslexic-font-style"
      style.innerHTML = `
        .dyslexic-font, .dyslexic-font * {
          font-family: 'Open Dyslexic', 'Comic Sans MS', sans-serif !important;
          letter-spacing: 0.05em;
          word-spacing: 0.1em;
          line-height: 1.5;
        }
      `
      document.head.appendChild(style)
    } else {
      document.documentElement.classList.remove("dyslexic-font")
      const existingStyle = document.getElementById("dyslexic-font-style")
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [dyslexicFont])

  // Apply color blind mode
  useEffect(() => {
    document.documentElement.classList.remove("protanopia", "deuteranopia", "tritanopia", "achromatopsia")
    if (colorBlindMode !== "none") {
      document.documentElement.classList.add(colorBlindMode)

      // Add color filters
      const style = document.createElement("style")
      style.id = "color-blind-style"

      let filterValue = ""
      switch (colorBlindMode) {
        case "protanopia":
          filterValue = "url('#protanopia-filter')"
          break
        case "deuteranopia":
          filterValue = "url('#deuteranopia-filter')"
          break
        case "tritanopia":
          filterValue = "url('#tritanopia-filter')"
          break
        case "achromatopsia":
          filterValue = "grayscale(100%)"
          break
      }

      style.innerHTML = `
        .${colorBlindMode} body {
          filter: ${filterValue};
        }
      `

      // Add SVG filters to the document
      const svgFilters = document.getElementById("accessibility-svg-filters")
      if (!svgFilters) {
        const filtersSvg = document.createElement("div")
        filtersSvg.innerHTML = `
          <svg id="accessibility-svg-filters" style="position: absolute; height: 0; width: 0;">
            <filter id="protanopia-filter">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="deuteranopia-filter">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="tritanopia-filter">
              <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
          </svg>
        `
        document.body.appendChild(filtersSvg)
      }

      document.head.appendChild(style)
    } else {
      const existingStyle = document.getElementById("color-blind-style")
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [colorBlindMode])

  // Apply screen reader mode
  useEffect(() => {
    if (screenReaderMode) {
      document.documentElement.classList.add("screen-reader-mode")

      // Add screen reader enhancements
      const style = document.createElement("style")
      style.id = "screen-reader-style"
      style.innerHTML = `
        .screen-reader-mode:focus-within {
          outline: 3px solid #4f46e5 !important;
        }
        
        .screen-reader-mode a:focus,
        .screen-reader-mode button:focus,
        .screen-reader-mode input:focus,
        .screen-reader-mode select:focus,
        .screen-reader-mode textarea:focus {
          outline: 3px solid #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.4) !important;
        }
        
        .screen-reader-mode .sr-only {
          position: static !important;
          width: auto !important;
          height: auto !important;
          padding: 0.5rem !important;
          margin: 0.5rem 0 !important;
          overflow: visible !important;
          clip: auto !important;
          white-space: normal !important;
          border: 1px dashed #4f46e5 !important;
          background-color: #eff6ff !important;
          color: #1e293b !important;
        }
      `
      document.head.appendChild(style)
    } else {
      document.documentElement.classList.remove("screen-reader-mode")
      const existingStyle = document.getElementById("screen-reader-style")
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [screenReaderMode])

  // Reset all settings
  const resetSettings = () => {
    setFontSize(100)
    setContrast("normal")
    setReducedMotion(false)
    setLargePointer(false)
    setDyslexicFont(false)
    setColorBlindMode("none")
    setScreenReaderMode(false)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white dark:bg-gray-800 shadow-md"
            aria-label="Accessibility options"
          >
            <Accessibility className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" side="top">
          <Tabs defaultValue="visual" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Clinical Accessibility</h3>
              <Button variant="ghost" size="sm" onClick={resetSettings}>
                Reset All
              </Button>
            </div>

            <TabsList className="w-full">
              <TabsTrigger value="visual" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="motion" className="flex-1">
                <MousePointer className="h-4 w-4 mr-2" />
                Motion
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex-1">
                <Type className="h-4 w-4 mr-2" />
                Reading
              </TabsTrigger>
              <TabsTrigger value="color" className="flex-1">
                <Contrast className="h-4 w-4 mr-2" />
                Color
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ZoomIn className="h-4 w-4" />
                    <span>Font Size</span>
                  </div>
                  <span className="text-sm text-gray-500">{fontSize}%</span>
                </div>
                <Slider
                  value={[fontSize]}
                  min={75}
                  max={200}
                  step={5}
                  onValueChange={(value) => setFontSize(value[0])}
                  aria-label="Font size"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Screen Reader Mode</span>
                </div>
                <Switch
                  checked={screenReaderMode}
                  onCheckedChange={setScreenReaderMode}
                  aria-label="Toggle screen reader mode"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Large Pointer</span>
                </div>
                <Switch checked={largePointer} onCheckedChange={setLargePointer} aria-label="Toggle large pointer" />
              </div>
            </TabsContent>

            <TabsContent value="motion" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-4 w-4" />
                  <span>Reduced Motion</span>
                </div>
                <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} aria-label="Toggle reduced motion" />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                <p>Reduced motion minimizes animations and transitions throughout the interface.</p>
              </div>
            </TabsContent>

            <TabsContent value="reading" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Dyslexia-Friendly Font</span>
                </div>
                <Switch
                  checked={dyslexicFont}
                  onCheckedChange={setDyslexicFont}
                  aria-label="Toggle dyslexia-friendly font"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                <p>Dyslexia-friendly font improves readability for users with dyslexia.</p>
              </div>
            </TabsContent>

            <TabsContent value="color" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Contrast className="h-4 w-4" />
                    <span>Contrast</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={contrast === "normal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContrast("normal")}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={contrast === "high-contrast" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContrast("high-contrast")}
                  >
                    High
                  </Button>
                  <Button
                    variant={contrast === "low-contrast" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContrast("low-contrast")}
                  >
                    Low
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Color Blind Mode</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={colorBlindMode === "none" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorBlindMode("none")}
                  >
                    None
                  </Button>
                  <Button
                    variant={colorBlindMode === "protanopia" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorBlindMode("protanopia")}
                  >
                    Protanopia
                  </Button>
                  <Button
                    variant={colorBlindMode === "deuteranopia" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorBlindMode("deuteranopia")}
                  >
                    Deuteranopia
                  </Button>
                  <Button
                    variant={colorBlindMode === "tritanopia" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorBlindMode("tritanopia")}
                  >
                    Tritanopia
                  </Button>
                  <Button
                    variant={colorBlindMode === "achromatopsia" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorBlindMode("achromatopsia")}
                    className="col-span-2"
                  >
                    Grayscale
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  )
}
