"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface GaugeChartProps {
  value: number
  min: number
  max: number
  label: string
  suffix?: string
}

export default function GaugeChart({ value, min, max, label, suffix = "" }: GaugeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart>()

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Calculate percentage for gauge
    const percentage = ((value - min) / (max - min)) * 100
    const clampedPercentage = Math.min(100, Math.max(0, percentage))

    // Create color based on value
    let color = "rgb(34, 197, 94)" // green
    if (percentage < 50) {
      color = "rgb(234, 179, 8)" // yellow
    }
    if (percentage < 25) {
      color = "rgb(220, 38, 38)" // red
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [clampedPercentage, 100 - clampedPercentage],
            backgroundColor: [color, "rgb(229, 231, 235)"],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    } as ChartConfiguration)

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [value, min, max])

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <canvas ref={chartRef} />
      <div className="absolute flex flex-col items-center">
        <div className="text-4xl font-bold">
          {value.toFixed(1)}
          {suffix}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
