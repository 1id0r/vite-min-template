/**
 * useEntityForm - Unified Form Management Hook
 *
 * Composes specialized hooks for the entity creation form:
 * - useFlowState: Flow switching (monitor/display)
 * - useSystemSelection: Category/system selection
 * - useVisibilityFlags: Section visibility computation
 * - useFormHandlers: Form actions (save, reset, field updates)
 *
 * Features:
 * - Single React Hook Form instance for all fields
 * - Dynamic validation based on flow and system
 * - Validates on blur
 * - Derived state for conditional section visibility
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EntityFormSchema } from '../schemas/entityFormSchema'
import {
  DEFAULT_ENTITY_FORM_VALUES,
  type EntityFormData,
  type UseEntityFormResult,
} from '../types/entityForm'
import { useFlowState } from './useFlowState'
import { useSystemSelection } from './useSystemSelection'
import { useVisibilityFlags } from './useVisibilityFlags'
import { useFormHandlers } from './useFormHandlers'

// Re-export types for convenience
export type { FlowId, EntityFormData, UseEntityFormResult } from '../types/entityForm'

export function useEntityForm(onSave?: (data: EntityFormData) => void): UseEntityFormResult {
  // Initialize form - using 'as any' to avoid complex Zod/RHF union type incompatibilities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EntityFormData>({
    resolver: zodResolver(EntityFormSchema) as any,
    defaultValues: DEFAULT_ENTITY_FORM_VALUES,
    mode: 'onBlur',
  })

  // Compose specialized hooks
  const { flow, handleFlowChange } = useFlowState({ form })

  const {
    systemId,
    categoryId,
    categories,
    systems,
    selectedSystemConfig,
    handleCategoryChange,
    handleSystemSelect,
  } = useSystemSelection({ form })

  const {
    showSystemSelector,
    showGeneralSection,
    showIconMenu,
    showMonitorSection,
    showBindingsPanel,
  } = useVisibilityFlags({ flow, systemId })

  const {
    handleMeasurementsChange,
    handleAttachmentsChange,
    handleIconSelect,
    handleSave,
    resetForm,
  } = useFormHandlers({ form, onSave })

  return {
    form,
    flow,
    systemId,
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
