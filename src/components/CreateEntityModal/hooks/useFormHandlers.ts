/**
 * useFormHandlers - Form Action Handlers Hook
 *
 * Provides handlers for form actions like save, reset, and field updates.
 * Extracted from useEntityForm for better separation of concerns.
 */

import { useCallback } from 'react'
import { message } from 'antd'
import { type UseFormReturn } from 'react-hook-form'
import type { Attachment } from '../../../types/entity'
import type { TreeSelection } from '../../../types/tree'
import type { EntityFormData } from '../types/entityForm'
import { DEFAULT_ENTITY_FORM_VALUES } from '../types/entityForm'
import { createEntity } from '../../../api/client'
// TODO: replace with actual import path
import { usePath } from 'your-path-hook'

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
  const { currentPath: dashboardId } = usePath()
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
    form.handleSubmit(
      async (data: EntityFormData) => {
        const cleanedData = {
          ...data,
          links: data.links?.filter(link => link.url?.trim() || link.label?.trim()) || []
        }

        try {
          await createEntity(cleanedData, dashboardId)
          onSave?.(cleanedData)
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Failed to create entity'
          message.error(msg)
        }
      },
      (errors) => {
        console.error('Form validation failed:', errors)
      }
    )()
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
