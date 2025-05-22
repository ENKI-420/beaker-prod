import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  text?: string
  size?: "sm" | "md" | "lg"
  fullPage?: boolean
  className?: string
}

/**
 * Reusable loading state component
 */
export function LoadingState({
  text = "Loading...",
  size = "md",
  fullPage = false,
  className = "",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
      {text && <p className={`mt-2 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        {content}
      </div>
    )
  }

  return content
}
