import { logger } from "../logging/enhanced-logger"

/**
 * Error types for better error classification and handling
 */
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  DATABASE = "DATABASE_ERROR",
  NETWORK = "NETWORK_ERROR",
  RATE_LIMIT = "RATE_LIMIT_ERROR",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE_ERROR",
  INTERNAL = "INTERNAL_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

/**
 * Custom application error class with additional context
 */
export class AppError extends Error {
  type: ErrorType
  statusCode: number
  context?: Record<string, any>

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, statusCode = 500, context?: Record<string, any>) {
    super(message)
    this.name = "AppError"
    this.type = type
    this.statusCode = statusCode
    this.context = context

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * Handles errors consistently throughout the application
 * @param error - The error to handle
 * @param context - Additional context for the error
 * @returns Standardized error object
 */
export function handleError(error: unknown, context?: Record<string, any>) {
  // Determine error type and details
  let appError: AppError

  if (error instanceof AppError) {
    appError = error

    // Add additional context if provided
    if (context) {
      appError.context = { ...appError.context, ...context }
    }
  } else if (error instanceof Error) {
    appError = new AppError(error.message, ErrorType.INTERNAL, 500, {
      originalError: error.name,
      stack: error.stack,
      ...context,
    })
  } else {
    appError = new AppError("An unknown error occurred", ErrorType.UNKNOWN, 500, {
      originalError: String(error),
      ...context,
    })
  }

  // Log the error
  logger.error(`${appError.type}: ${appError.message}`, {
    type: appError.type,
    statusCode: appError.statusCode,
    context: appError.context,
    stack: appError.stack,
  })

  // Return standardized error response
  return {
    error: {
      type: appError.type,
      message: appError.message,
      statusCode: appError.statusCode,
    },
  }
}

/**
 * Creates validation error
 */
export function createValidationError(message: string, context?: Record<string, any>) {
  return new AppError(message, ErrorType.VALIDATION, 400, context)
}

/**
 * Creates authentication error
 */
export function createAuthenticationError(message: string, context?: Record<string, any>) {
  return new AppError(message, ErrorType.AUTHENTICATION, 401, context)
}

/**
 * Creates authorization error
 */
export function createAuthorizationError(message: string, context?: Record<string, any>) {
  return new AppError(message, ErrorType.AUTHORIZATION, 403, context)
}

/**
 * Creates not found error
 */
export function createNotFoundError(message: string, context?: Record<string, any>) {
  return new AppError(message, ErrorType.NOT_FOUND, 404, context)
}

/**
 * Creates database error
 */
export function createDatabaseError(message: string, context?: Record<string, any>) {
  return new AppError(message, ErrorType.DATABASE, 500, context)
}

/**
 * Creates network error
 */
export function createNetworkError(message: string, context?: Record<string, any>) {
  return new AppError(message, ErrorType.NETWORK, 503, context)
}

export default {
  AppError,
  ErrorType,
  handleError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createDatabaseError,
  createNetworkError,
}
