"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface ValidationRules {
  [key: string]: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any, formValues: FormValues) => boolean
    errorMessage?: string
  }
}

interface FormErrors {
  [key: string]: string
}

interface FormValues {
  [key: string]: any
}

/**
 * Custom hook for form validation
 * @param initialValues - Initial form values
 * @param validationRules - Rules for form validation
 * @returns Form state and validation functions
 */
export function useFormValidation(initialValues: FormValues, validationRules: ValidationRules) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target

      // Handle different input types
      let processedValue = value
      if (type === "number") {
        processedValue = value === "" ? "" : Number(value)
      } else if (type === "checkbox") {
        processedValue = (e.target as HTMLInputElement).checked
      }

      setValues((prev) => ({
        ...prev,
        [name]: processedValue,
      }))

      // Mark field as touched
      if (!touched[name]) {
        setTouched((prev) => ({
          ...prev,
          [name]: true,
        }))
      }
    },
    [touched],
  )

  // Handle blur event
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      // Validate field on blur
      validateField(name, values[name])
    },
    [values],
  )

  // Validate a single field
  const validateField = useCallback(
    (name: string, value: any) => {
      const rules = validationRules[name]
      if (!rules) return true

      let isValid = true
      let errorMessage = ""

      // Check required
      if (rules.required && (value === "" || value === null || value === undefined)) {
        isValid = false
        errorMessage = rules.errorMessage || "This field is required"
      }

      // Check min length
      else if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
        isValid = false
        errorMessage = rules.errorMessage || `Minimum length is ${rules.minLength} characters`
      }

      // Check max length
      else if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
        isValid = false
        errorMessage = rules.errorMessage || `Maximum length is ${rules.maxLength} characters`
      }

      // Check pattern
      else if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
        isValid = false
        errorMessage = rules.errorMessage || "Invalid format"
      }

      // Check custom validation
      else if (rules.custom && !rules.custom(value, values)) {
        isValid = false
        errorMessage = rules.errorMessage || "Invalid value"
      }

      // Update errors state
      setErrors((prev) => {
        if (isValid) {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        } else {
          return {
            ...prev,
            [name]: errorMessage,
          }
        }
      })

      return isValid
    },
    [validationRules, values],
  )

  // Validate all fields
  const validateForm = useCallback(() => {
    let isValid = true
    const newErrors: FormErrors = {}
    const newTouched: Record<string, boolean> = {}

    // Validate each field
    Object.keys(validationRules).forEach((name) => {
      newTouched[name] = true

      const fieldIsValid = validateField(name, values[name])
      if (!fieldIsValid) {
        isValid = false
      }
    })

    // Mark all fields as touched
    setTouched(newTouched)

    return isValid
  }, [validateField, validationRules, values])

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (values: FormValues) => void) => {
      return async (e: React.FormEvent) => {
        e.preventDefault()

        setIsSubmitting(true)

        // Validate all fields
        const isValid = validateForm()

        if (isValid) {
          await onSubmit(values)
        }

        setIsSubmitting(false)
      }
    },
    [validateForm, values],
  )

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  }
}
