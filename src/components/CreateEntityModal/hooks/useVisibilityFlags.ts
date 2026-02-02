/**
 * useVisibilityFlags - Section Visibility Computation Hook
 *
 * Computes which sections should be visible based on flow and system state.
 * Extracted from useEntityForm for better separation of concerns.
 */

import { useMemo } from 'react'
import { getMonitorFieldConfig } from '../../../schemas/fieldConfigs'
import type { FlowId } from '../types/entityForm'

interface UseVisibilityFlagsParams {
  flow: FlowId
  systemId: string | null
}

interface UseVisibilityFlagsResult {
  showSystemSelector: boolean
  showGeneralSection: boolean
  showIconMenu: boolean
  showMonitorSection: boolean
  showBindingsPanel: boolean
}

export function useVisibilityFlags({ flow, systemId }: UseVisibilityFlagsParams): UseVisibilityFlagsResult {
  // Display flow: no system selection needed, show general + icons directly
  // Monitor flow: require system selection first
  const showSystemSelector = flow === 'monitor'
  const showGeneralSection = flow === 'display' || Boolean(systemId)
  const showIconMenu = flow === 'display' || (flow === 'monitor' && systemId === 'general')

  const showMonitorSection = useMemo(() => {
    if (flow !== 'monitor' || !systemId || systemId === 'general') return false
    const config = getMonitorFieldConfig(systemId)
    return config.fields.length > 0
  }, [flow, systemId])

  const showBindingsPanel = flow === 'monitor' && Boolean(systemId)

  return {
    showSystemSelector,
    showGeneralSection,
    showIconMenu,
    showMonitorSection,
    showBindingsPanel,
  }
}
