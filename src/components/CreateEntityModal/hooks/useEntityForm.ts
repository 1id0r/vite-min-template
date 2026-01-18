/**
 * useEntityForm - Unified Form Management Hook
 * 
 * Single hook that manages the entire entity creation form state.
 * Replaces: useFlowNavigation, useFormManager, useSystemSelection
 * 
 * Features:
 * - Single React Hook Form instance for all fields
 * - Dynamic validation based on flow and system
 * - Validates on blur
 * - Derived state for conditional section visibility
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LinkSchema, TreeSelectionSchema } from '../../../schemas/formSchemas'
import type { Attachment } from '../../../types/entity'
import type { TreeSelection } from '../../../types/tree'
import { STATIC_CONFIG } from '../../../schemas/fieldConfigs'
import type { FlowId, EntityFormData, UseEntityFormResult } from '../types/entityForm'

// Re-export types for convenience
export type { FlowId, EntityFormData, UseEntityFormResult } from '../types/entityForm'

const DEFAULT_VALUES: EntityFormData = {
  flow: 'monitor',
  systemId: '',
  displayName: '',
  entityType: '',
  description: '',
  contactInfo: '',
  responsibleParty: '',
  links: [{ url: '', label: '' }],
  measurements: [],
  attachments: [],
  entityRules: [],
  urls: [],
  elastic: {},
}

/** Build validation schema */
const EntitySchema = z.object({
  flow: z.enum(['monitor', 'display']),
  systemId: z.string().optional(), // Optional - display flow doesn't require system
  displayName: z.string().min(1, 'שם תצוגה הוא שדה חובה').max(50, 'שם תצוגה חייב להיות עד 50 תווים'),
  entityType: z.string(),
  description: z.string().min(1, 'תיאור הוא שדה חובה').max(200, 'תיאור חייב להיות עד 200 תווים'),
  contactInfo: z.string().regex(/^[0-9\-+() ]*$/, 'פרטי התקשרות יכולים להכיל רק מספרים ותווי פיסוק').optional().or(z.literal('')),
  responsibleParty: z.string().max(50, 'גורם אחראי חייב להיות עד 50 תווים').optional(),
  links: z.array(LinkSchema).optional(),
  icon: z.string().optional(),
  monitor: z.record(z.string(), z.unknown()).optional(),
  measurements: z.array(TreeSelectionSchema).optional(),
  attachments: z.array(z.any()).optional(), // Using any to avoid complex union type issues
  
  // Step 2 Fields
  entityRules: z.array(z.object({
     ruleKey: z.string(),
     ruleLabel: z.string(),
     enabled: z.boolean(),
     data: z.record(z.string(), z.any())
  })).optional(),
  
  urls: z.array(z.object({
     url: z.string(),
     timeout: z.number().optional()
  })).optional(),
  
  elastic: z.record(z.string(), z.any()).optional(),
})

export function useEntityForm(onSave?: (data: EntityFormData) => void): UseEntityFormResult {
  // Initialize form - using 'as any' to avoid complex Zod/RHF union type incompatibilities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EntityFormData>({
    resolver: zodResolver(EntitySchema) as any,
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  })

  // Watch key fields for conditional rendering
  const watchedFlow = form.watch('flow')
  const watchedSystemId = form.watch('systemId')
  const flow = (watchedFlow || 'monitor') as FlowId
  const systemId = watchedSystemId as string
  
  // Category state (not in form, just UI state)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  
  // Config from static config
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

  // ─────────────────────────────────────────────────────────────────────────
  // Visibility Flags
  // ─────────────────────────────────────────────────────────────────────────

  // Display flow: no system selection needed, show general + icons directly
  // Monitor flow: require system selection first
  const showSystemSelector = flow === 'monitor'
  const showGeneralSection = flow === 'display' || Boolean(systemId)
  const showIconMenu = flow === 'display' || (flow === 'monitor' && systemId === 'general')
  const showMonitorSection = flow === 'monitor' && Boolean(systemId) && systemId !== 'general'
  const showBindingsPanel = flow === 'monitor' && Boolean(systemId)

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleFlowChange = useCallback((newFlow: FlowId) => {
    form.setValue('flow', newFlow)
    // Reset system selection when flow changes
    form.setValue('systemId', '')
    form.setValue('measurements', [])
    form.setValue('attachments', [])
    // Set entityType based on flow
    if (newFlow === 'display') {
      form.setValue('entityType', 'תצוגה')
    } else {
      form.setValue('entityType', '')
    }
    form.clearErrors()
  }, [form])

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

  const handleMeasurementsChange = useCallback((measurements: TreeSelection[]) => {
    form.setValue('measurements', measurements)
  }, [form])

  const handleAttachmentsChange = useCallback((attachments: Attachment[]) => {
    form.setValue('attachments', attachments)
  }, [form])

  const handleIconSelect = useCallback((systemId: string, iconName?: string) => {
    form.setValue('icon', iconName || systemId)
  }, [form])

  const handleSave = useCallback(() => {
    form.handleSubmit((data: EntityFormData) => {
      console.log('Entity form submitted:', data)
      onSave?.(data)
    })()
  }, [form, onSave])

  const resetForm = useCallback(() => {
    form.reset(DEFAULT_VALUES)
  }, [form])

  return {
    form,
    flow,
    systemId: systemId || null,
    categoryId,
    categories,
    systems,
    selectedSystemConfig,
    showSystemSelector,
    showGeneralSection,
    showIconMenu,
    showMonitorSection,
    showBindingsPanel,
    handleFlowChange,
    handleCategoryChange,
    handleSystemSelect,
    handleMeasurementsChange,
    handleAttachmentsChange,
    handleIconSelect,
    handleSave,
    resetForm,
  }
}


