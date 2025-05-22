"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Accessibility, ZoomIn, Type, Contrast } from "lucide-react"

/**
 * Accessibility menu component
 * Provides accessibility controls for the application
 */
export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Apply font size
  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}%`
    setFontSize(size)
  }

  // Toggle high contrast
  const toggleHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
    setHighContrast(enabled)
  }

  // Toggle reduced motion
  const toggleReducedMotion = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }
    setReducedMotion(enabled)
  }

  // Reset all settings
  const resetSettings = () => {
    applyFontSize(100)
    toggleHighContrast(false)
    toggleReducedMotion(false)
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
        <PopoverContent className="w-80" side="top">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Accessibility Options</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Font Size</span>
                </div>
                <span className="text-sm text-gray-500">{fontSize}%</span>
              </div>
              <Slider
                value={[fontSize]}
                min={75}
                max={150}
                step={5}
                onValueChange={(value) => applyFontSize(value[0])}
                aria-label="Font size"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Contrast className="h-4 w-4" />
                <span>High Contrast</span>
              </div>
              <Switch checked={highContrast} onCheckedChange={toggleHighContrast} aria-label="Toggle high contrast" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ZoomIn className="h-4 w-4" />
                <span>Reduced Motion</span>
              </div>
              <Switch
                checked={reducedMotion}
                onCheckedChange={toggleReducedMotion}
                aria-label="Toggle reduced motion"
              />
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={resetSettings}>
              Reset Settings
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
