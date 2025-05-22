// Clinical theme configuration with professional color palette
export const clinicalTheme = {
  colors: {
    primary: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1", // Primary indigo
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      950: "#1e1b4b",
    },
    secondary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Secondary blue
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    accent: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6", // Accent teal
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
      950: "#042f2e",
    },
    clinical: {
      success: "#10b981", // Green for positive outcomes
      warning: "#f59e0b", // Amber for warnings
      danger: "#ef4444", // Red for critical alerts
      info: "#3b82f6", // Blue for information
      neutral: "#6b7280", // Gray for neutral elements
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },
  },
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  spacing: {
    compact: {
      panel: "1rem",
      card: "0.75rem",
      input: "0.5rem",
    },
    standard: {
      panel: "1.5rem",
      card: "1rem",
      input: "0.75rem",
    },
    relaxed: {
      panel: "2rem",
      card: "1.5rem",
      input: "1rem",
    },
  },
  borderRadius: {
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  typography: {
    headings: {
      fontWeight: "600",
      lineHeight: "1.2",
      letterSpacing: "-0.025em",
    },
    body: {
      fontWeight: "400",
      lineHeight: "1.5",
      letterSpacing: "0",
    },
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    medium: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
}

// Export theme variables for use in Tailwind config
export const clinicalTailwindTheme = {
  extend: {
    colors: {
      primary: clinicalTheme.colors.primary,
      secondary: clinicalTheme.colors.secondary,
      accent: clinicalTheme.colors.accent,
      clinical: clinicalTheme.colors.clinical,
    },
    fontFamily: {
      sans: clinicalTheme.fonts.sans.split(", "),
      mono: clinicalTheme.fonts.mono.split(", "),
    },
    boxShadow: {
      clinical: "0 2px 5px 0 rgba(0, 0, 0, 0.08)",
      "clinical-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.12)",
      "clinical-card": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    animation: {
      "clinical-pulse": "clinical-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      "clinical-bounce": "clinical-bounce 1s infinite",
    },
    keyframes: {
      "clinical-pulse": {
        "0%, 100%": { opacity: 1 },
        "50%": { opacity: 0.5 },
      },
      "clinical-bounce": {
        "0%, 100%": {
          transform: "translateY(-5%)",
          animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
        },
        "50%": {
          transform: "translateY(0)",
          animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
        },
      },
    },
  },
}
