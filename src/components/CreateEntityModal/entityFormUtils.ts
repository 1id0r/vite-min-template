import type React from 'react'
import type { IChangeEvent } from '@rjsf/core'
import type { FormDefinition, StepKey } from '../../types/entity'
import type { AggregatedResult, FlowId, FormStatus } from './types'

export type StepState = Record<StepKey, unknown>
export type FormState = Record<string, StepState>
export type FormDefinitionsState = Record<string, Partial<Record<StepKey, FormDefinition>>>
export type FormStatusState = Record<string, Partial<Record<StepKey, FormStatus>>>
export type FormErrorState = Record<string, Partial<Record<StepKey, string>>>

export const createEmptyStepState = (): StepState => ({
  system: {},
  general: {},
  monitor: {},
  tree: {},
})

export const buildAggregateResult = (
  flow: FlowId,
  stepKeys: StepKey[],
  currentFormState: StepState,
  selectedSystem: string | null,
  selectedTreeNode: string | null
): AggregatedResult | null => {
  if (!selectedSystem) {
    return null
  }

  const data = stepKeys.reduce<Record<StepKey, unknown>>((acc, key) => {
    acc[key] = currentFormState[key]
    return acc
  }, {} as Record<StepKey, unknown>)

  if (data.monitor && typeof data.monitor === 'object' && data.monitor !== null) {
    data.monitor = {
      type: selectedSystem,
      details: data.monitor,
    }
  }
    
  if (selectedTreeNode) {
    data.tree = {
        selectedNode: selectedTreeNode
    }
  }

  return {
    flow,
    systemId: selectedSystem,
    formData: data,
  }
}

export const applyFormChange = (
  setFormState: React.Dispatch<React.SetStateAction<FormState>>,
  systemId: string,
  key: StepKey,
  change: IChangeEvent
) => {
  setFormState((prev) => ({
    ...prev,
    [systemId]: {
      ...(prev[systemId] ?? {}),
      [key]: change.formData,
    },
  }))
}

export const shouldApplyInitialData = (currentValue: unknown, initialData?: Record<string, unknown>) => {
  if (!initialData) {
    return false
  }

  if (currentValue === undefined) {
    return true
  }

  if (typeof currentValue === 'object' && currentValue !== null) {
    return Object.keys(currentValue as Record<string, unknown>).length === 0
  }

  return false
}
