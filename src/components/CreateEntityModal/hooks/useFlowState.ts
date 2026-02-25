/**
 * useFlowState - Flow State Management Hook
 *
 * Manages the flow state (monitor/display) and provides handlers for switching flows.
 * Extracted from useEntityForm for better separation of concerns.
 */

import { useCallback } from 'react'
import { Modal } from 'antd'
import { type UseFormReturn } from 'react-hook-form'
import type { EntityFormData, FlowId } from '../types/entityForm'

interface UseFlowStateParams {
  form: UseFormReturn<EntityFormData>
}

interface UseFlowStateResult {
  flow: FlowId
  handleFlowChange: (newFlow: FlowId) => Promise<boolean>
}

export function useFlowState({ form }: UseFlowStateParams): UseFlowStateResult {
  const watchedFlow = form.watch('flow')
  const flow = (watchedFlow || 'monitor') as FlowId

  const handleFlowChange = useCallback((newFlow: FlowId) => {
    return new Promise<boolean>((resolve) => {
      const currentValues = form.getValues()
    const performReset = () => {
      form.setValue('flow', newFlow)

      // Purge all fields
      form.setValue('displayName', '')
      form.setValue('description', '')
      form.setValue('links', [])
      form.setValue('entityRules', [])
      form.setValue('urls', [])
      form.setValue('elastic', [])

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
    }

    const hasData =
      (currentValues.displayName && currentValues.displayName.trim() !== '') ||
      (currentValues.description && currentValues.description.trim() !== '') ||
      (currentValues.links && currentValues.links.length > 0 && currentValues.links.some((l) => l.url || l.label)) ||
      (currentValues.entityRules && currentValues.entityRules.length > 0) ||
      (currentValues.urls && currentValues.urls.length > 0) ||
      (currentValues.elastic && currentValues.elastic.length > 0)

    if (hasData) {
      Modal.confirm({
        title: 'החלפת סוג יישות',
        content: `האם אתה בטוח שברצונך להחליף ל${newFlow === 'display' ? 'יישות תצוגה' : 'יישות ניטור'}? כל הנתונים שהזנת יימחקו.`,
        okText: 'החלף ומחק נתונים',
        cancelText: 'ביטול',
        okButtonProps: { style: { color: '#1677ff', borderColor: '#1677ff', backgroundColor: 'transparent' } },
        direction: 'rtl',
        onOk: () => {
          performReset()
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        },
      })
    } else {
      performReset()
      resolve(true)
    }
    })
  }, [form])

  return {
    flow,
    handleFlowChange,
  }
}
