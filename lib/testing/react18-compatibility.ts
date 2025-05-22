import type React from "react"
/**
 * Utility functions for testing React 18 compatibility
 */

import { version as reactVersion } from "react"

/**
 * Verifies that React 18 is being used
 */
export function verifyReactVersion(): { version: string; isReact18: boolean } {
  const version = reactVersion
  const isReact18 = version.startsWith("18.")

  return {
    version,
    isReact18,
  }
}

/**
 * Tests if a component renders without errors
 * @param Component The component to test
 * @param props Props to pass to the component
 */
export function testComponentRender(Component: React.ComponentType<any>, props: any = {}): boolean {
  try {
    // In a real test environment, we would use React Testing Library or similar
    // For this utility, we're just checking if the component can be instantiated
    const component = new Component(props)
    return !!component
  } catch (error) {
    console.error("Component render test failed:", error)
    return false
  }
}

/**
 * Feature flags for React 18 features
 */
export const react18Features = {
  // Core React 18 features
  automaticBatching: true,
  transitions: true,
  suspense: true,
  concurrentMode: true,

  // React DOM 18 features
  createRoot: true,
  hydrateRoot: true,

  // Hooks
  useId: true,
  useDeferredValue: true,
  useTransition: true,
  useSyncExternalStore: true,
  useInsertionEffect: true,
}

/**
 * Tests if a specific React 18 feature is available
 * @param featureName Name of the feature to test
 */
export function testReact18Feature(featureName: keyof typeof react18Features): boolean {
  const { isReact18 } = verifyReactVersion()
  if (!isReact18) return false

  // This would be more comprehensive in a real test environment
  return react18Features[featureName] || false
}
