/**
 * useSystemSelection - System Selection Hook
 * 
 * Manages the selected system/template and provides
 * the system configuration for the selected item.
 */

import { useCallback, useMemo, useState } from 'react'
import type { EntityConfig, SystemDefinition } from '../../../types/entity'

export interface UseSystemSelectionResult {
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  handleSystemSelect: (systemId: string, onSelect?: () => void) => void
  clearSystemSelection: () => void
}

interface UseSystemSelectionParams {
  config: EntityConfig | null
}

export function useSystemSelection({
  config,
}: UseSystemSelectionParams): UseSystemSelectionResult {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)

  const selectedSystemConfig = useMemo<SystemDefinition | null>(() => {
    if (!selectedSystem || !config) return null
    return config.systems[selectedSystem] ?? null
  }, [config, selectedSystem])

  /** Handle system/template selection */
  const handleSystemSelect = useCallback(
    (systemId: string, onSelect?: () => void) => {
      setSelectedSystem(systemId)
      onSelect?.()
    },
    []
  )

  /** Clear the selected system */
  const clearSystemSelection = useCallback(() => {
    setSelectedSystem(null)
  }, [])

  return useMemo(
    () => ({
      selectedSystem,
      selectedSystemConfig,
      handleSystemSelect,
      clearSystemSelection,
    }),
    [selectedSystem, selectedSystemConfig, handleSystemSelect, clearSystemSelection]
  )
}
