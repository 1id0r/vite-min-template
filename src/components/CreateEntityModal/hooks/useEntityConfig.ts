/**
 * useEntityConfig - Configuration Loading Hook
 * 
 * Handles fetching and caching the EntityConfig from the API.
 * Provides retry functionality and loading/error states.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchEntityConfig } from '../../../api/client'
import type {
  CategoryDefinition,
  EntityConfig,
  StepDefinition,
  StepKey,
  SystemDefinition,
} from '../../../types/entity'

export type ConfigStatus = 'idle' | 'loading' | 'error' | 'success'

export interface UseEntityConfigResult {
  config: EntityConfig | null
  configStatus: ConfigStatus
  configError: string | null
  handleConfigRetry: () => void
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  stepDefinitions?: Record<StepKey, StepDefinition>
}

export function useEntityConfig(): UseEntityConfigResult {
  const [config, setConfig] = useState<EntityConfig | null>(null)
  const [configStatus, setConfigStatus] = useState<ConfigStatus>('idle')
  const [configError, setConfigError] = useState<string | null>(null)
  const [configReloadKey, setConfigReloadKey] = useState(0)

  /** Retry loading configuration after an error */
  const handleConfigRetry = useCallback(() => {
    setConfigReloadKey((key) => key + 1)
  }, [])

  /**
   * Effect: Load configuration from API
   * Triggered on mount and when configReloadKey changes (retry scenario)
   */
  useEffect(() => {
    let cancelled = false

    const loadConfig = async () => {
      setConfigStatus('loading')
      setConfigError(null)

      try {
        const data = await fetchEntityConfig()
        if (!cancelled) {
          setConfig(data)
          setConfigStatus('success')
        }
      } catch (error) {
        if (!cancelled) {
          setConfigStatus('error')
          setConfigError(error instanceof Error ? error.message : 'Failed to load configuration')
        }
      }
    }

    loadConfig()

    return () => {
      cancelled = true
    }
  }, [configReloadKey])

  // Derived values from config
  const categories = useMemo(
    () => (config?.categories ?? []) as CategoryDefinition[],
    [config]
  )
  
  const systems = useMemo(
    () => (config?.systems ?? {}) as Record<string, SystemDefinition>,
    [config]
  )
  
  const stepDefinitions = useMemo(() => config?.steps, [config])

  return useMemo(
    () => ({
      config,
      configStatus,
      configError,
      handleConfigRetry,
      categories,
      systems,
      stepDefinitions,
    }),
    [config, configStatus, configError, handleConfigRetry, categories, systems, stepDefinitions]
  )
}
