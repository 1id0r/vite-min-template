/**
 * useFlowNavigation - Flow & Step Navigation Hook
 * 
 * Manages the active flow type, step keys, and navigation between steps.
 * Handles flow changes, step advancement, and completion state.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  EntityConfig,
  FlowDefinition,
  StepKey,
} from '../../../types/entity'
import type { FlowId, FlowOption } from '../types'
import { DISPLAY_FLOW_ID } from '../iconRegistry'

export interface UseFlowNavigationResult {
  flow: FlowId
  flowOptions: FlowOption[]
  handleFlowChange: (value: string) => void
  currentFlow: FlowDefinition | null
  flowDescription?: string
  stepKeys: StepKey[]
  activeStep: number
  activeStepKey: StepKey | null
  isCompleted: boolean
  totalSteps: number
  goToNextStep: () => void
  goToPreviousStep: () => void
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  resetNavigation: () => void
}

interface UseFlowNavigationParams {
  config: EntityConfig | null
  selectedSystem: string | null
}

export function useFlowNavigation({
  config,
  selectedSystem,
}: UseFlowNavigationParams): UseFlowNavigationResult {
  const [flow, setFlow] = useState<FlowId>('monitor')
  const [activeStep, setActiveStep] = useState(0)

  // Sync flow with config on load (fallback to first available flow)
  useEffect(() => {
    if (!config) return
    if (config.flows[flow]) return

    const [firstFlow] = Object.values<FlowDefinition>(config.flows)
    if (firstFlow) {
      setFlow(firstFlow.id as FlowId)
      setActiveStep(0)
    }
  }, [config, flow])

  const currentFlow = config ? config.flows[flow] ?? null : null

  /**
   * Derive step keys from the current flow.
   * Special case: For "monitor" flow with "general" system, skip the monitor step.
   */
  const stepKeys = useMemo<StepKey[]>(() => {
    if (!currentFlow) return []
    if (flow === 'monitor' && selectedSystem === 'general') {
      return currentFlow.steps.filter((key) => key !== 'monitor')
    }
    return currentFlow.steps
  }, [currentFlow, flow, selectedSystem])

  const totalSteps = stepKeys.length
  const isCompleted = currentFlow ? activeStep === totalSteps : false

  const activeStepKey = useMemo<StepKey | null>(() => {
    if (isCompleted) return null
    return stepKeys[activeStep] ?? null
  }, [activeStep, isCompleted, stepKeys])

  // Reset activeStep if it exceeds the step count
  useEffect(() => {
    const stepCount = currentFlow?.steps.length ?? 0
    if (stepCount && activeStep > stepCount) {
      setActiveStep(0)
    }
  }, [currentFlow, activeStep])

  /** Navigate to the next step (bounded by total steps) */
  const goToNextStep = useCallback(() => {
    setActiveStep((step) => Math.min(step + 1, stepKeys.length))
  }, [stepKeys.length])

  /** Navigate to the previous step (bounded by 0) */
  const goToPreviousStep = useCallback(() => {
    setActiveStep((step) => Math.max(step - 1, 0))
  }, [])

  /** Handle flow type change (resets navigation) */
  const handleFlowChange = useCallback((value: string) => {
    const nextFlow = value as FlowId
    setFlow(nextFlow)
    setActiveStep(0)
  }, [])

  /** Reset navigation state */
  const resetNavigation = useCallback(() => {
    setActiveStep(0)
  }, [])

  /** Available flow options for the flow selector UI */
  const flowOptions = useMemo<FlowOption[]>(() => {
    if (!config) return []
    return Object.values<FlowDefinition>(config.flows).map((item) => ({
      label: item.label,
      value: item.id,
    }))
  }, [config])

  const flowDescription = useMemo(
    () => currentFlow?.description?.trim(),
    [currentFlow]
  )

  return useMemo(
    () => ({
      flow,
      flowOptions,
      handleFlowChange,
      currentFlow,
      flowDescription,
      stepKeys,
      activeStep,
      activeStepKey,
      isCompleted,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
      setActiveStep,
      resetNavigation,
    }),
    [
      flow,
      flowOptions,
      handleFlowChange,
      currentFlow,
      flowDescription,
      stepKeys,
      activeStep,
      activeStepKey,
      isCompleted,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
      resetNavigation,
    ]
  )
}
