"use client"

import type React from "react"

import { useState, createContext, useContext } from "react"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Provider component for toast notifications
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Add a new toast
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }

  // Remove a toast by id
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

/**
 * Container component for toast notifications
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

/**
 * Individual toast notification component
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { type, title, message } = toast

  // Define styles based on toast type
  const styles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-500",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-500",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-500",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-500",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
  }

  return (
    <div
      className={`${styles[type].bg} border-l-4 ${styles[type].border} p-4 rounded-md shadow-lg animate-slide-up flex items-start`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">{styles[type].icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {message && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
      </div>
      <button
        className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
