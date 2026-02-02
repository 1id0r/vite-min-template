/**
 * useSystemSelection - System/Category Selection Hook
 *
 * Manages category and system selection state and handlers.
 * Extracted from useEntityForm for better separation of concerns.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { STATIC_CONFIG } from '../../../schemas/fieldConfigs'
import type { EntityFormData } from '../types/entityForm'
import type { SystemDefinition } from '../../../types/entity'

interface UseSystemSelectionParams {
  form: UseFormReturn<EntityFormData>
}

interface UseSystemSelectionResult {
  systemId: string | null
  categoryId: string | null
  categories: typeof STATIC_CONFIG.categories
  systems: typeof STATIC_CONFIG.systems
  selectedSystemConfig: SystemDefinition | null
  handleCategoryChange: (categoryId: string | null) => void
  handleSystemSelect: (systemId: string | null) => void
}

export function useSystemSelection({ form }: UseSystemSelectionParams): UseSystemSelectionResult {
  const watchedSystemId = form.watch('systemId')
  const systemId = watchedSystemId as string

  // Category state (UI only, not in form)
  const [categoryId, setCategoryId] = useState<string | null>(null)

  // Static config
  const categories = STATIC_CONFIG.categories
  const systems = STATIC_CONFIG.systems

  // Get selected system config
  const selectedSystemConfig = useMemo(() => {
    if (!systemId) return null
    return systems[systemId] ?? null
  }, [systemId, systems])

  // Update entityType when system changes
  useEffect(() => {
    if (selectedSystemConfig) {
      form.setValue('entityType', selectedSystemConfig.label)
    }
  }, [selectedSystemConfig, form])

  const handleCategoryChange = useCallback((newCategoryId: string | null) => {
    setCategoryId(newCategoryId)
    // Clear system when category changes
    form.setValue('systemId', '')
    form.setValue('measurements', [])
    form.setValue('attachments', [])
    form.setValue('monitor', {})
  }, [form])

  const handleSystemSelect = useCallback((newSystemId: string | null) => {
    form.setValue('systemId', newSystemId || '')
    // Clear bindings when system changes
    form.setValue('measurements', [])
    form.setValue('attachments', [])
    form.setValue('monitor', {})
    // Set entity type
    if (newSystemId) {
      const system = systems[newSystemId]
      if (system) {
        form.setValue('entityType', system.label)
      }
    }
  }, [form, systems])

  return {
    systemId: systemId || null,
    categoryId,
    categories,
    systems,
    selectedSystemConfig,
    handleCategoryChange,
    handleSystemSelect,
  }
}
