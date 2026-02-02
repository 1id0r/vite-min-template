/**
 * useFormHandlers - Form Action Handlers Hook
 *
 * Provides handlers for form actions like save, reset, and field updates.
 * Extracted from useEntityForm for better separation of concerns.
 */

import { useCallback } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import type { Attachment } from '../../../types/entity'
import type { TreeSelection } from '../../../types/tree'
import type { EntityFormData } from '../types/entityForm'
import { DEFAULT_ENTITY_FORM_VALUES } from '../types/entityForm'

interface UseFormHandlersParams {
  form: UseFormReturn<EntityFormData>
  onSave?: (data: EntityFormData) => void
}

interface UseFormHandlersResult {
  handleMeasurementsChange: (measurements: TreeSelection[]) => void
  handleAttachmentsChange: (attachments: Attachment[]) => void
  handleIconSelect: (systemId: string, iconName?: string) => void
  handleSave: () => void
  resetForm: () => void
}

export function useFormHandlers({ form, onSave }: UseFormHandlersParams): UseFormHandlersResult {
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
    form.reset(DEFAULT_ENTITY_FORM_VALUES)
  }, [form])

  return {
    handleMeasurementsChange,
    handleAttachmentsChange,
    handleIconSelect,
    handleSave,
    resetForm,
  }
}
