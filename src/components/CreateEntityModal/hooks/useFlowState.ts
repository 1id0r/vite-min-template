/**
 * useFlowState - Flow State Management Hook
 *
 * Manages the flow state (monitor/display) and provides handlers for switching flows.
 * Extracted from useEntityForm for better separation of concerns.
 */

import { useCallback } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import type { EntityFormData, FlowId } from '../types/entityForm'

interface UseFlowStateParams {
  form: UseFormReturn<EntityFormData>
}

interface UseFlowStateResult {
  flow: FlowId
  handleFlowChange: (newFlow: FlowId) => void
}

export function useFlowState({ form }: UseFlowStateParams): UseFlowStateResult {
  const watchedFlow = form.watch('flow')
  const flow = (watchedFlow || 'monitor') as FlowId

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

  return {
    flow,
    handleFlowChange,
  }
}
