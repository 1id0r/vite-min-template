/**
 * useEntityFlowState - Central State Manager for Entity Creation Flow
 * 
 * This hook composes multiple focused hooks to manage the complete state machine
 * for the multi-step entity creation wizard.
 * 
 * COMPOSED HOOKS:
 * - useEntityConfig     - Configuration loading from API
 * - useFlowNavigation   - Flow selection and step navigation
 * - useSystemSelection  - System/template selection
 * - useFormManager      - Form state, definitions, and submission
 * 
 * @returns UseEntityFlowStateResult - Complete controller object for the flow
 * 
 * @example
 * const controller = useEntityFlowState();
 * <EntityFlowContent controller={controller} onClose={handleClose} />
 */

import { useCallback, useMemo, useState } from 'react'
import type {
  Attachment,
  CategoryDefinition,
  FormDefinition,
  StepDefinition,
  StepKey,
  SystemDefinition,
} from '../../../types/entity'
import type { TreeSelectionList } from '../../../types/tree'
import type { AggregatedResult, FlowId, FlowOption } from '../types'
import type { UseFormManagerResult } from './useFormManager'
import { buildAggregateResult, type FormDefinitionsState, type FormErrorState, type FormStatusState } from '../entityFormUtils'
import type { FormStepRef } from '../FormStepCard'

// Import sub-hooks
import { useEntityConfig, type ConfigStatus } from './useEntityConfig'
import { useFlowNavigation } from './useFlowNavigation'
import { useSystemSelection } from './useSystemSelection'
import { useFormManager } from './useFormManager'

export interface UseEntityFlowStateResult {
  // Config
  config: ReturnType<typeof useEntityConfig>['config']
  configStatus: ConfigStatus
  configError: string | null
  handleConfigRetry: () => void
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  stepDefinitions?: Record<StepKey, StepDefinition>

  // Flow & Navigation
  flow: FlowId
  flowOptions: FlowOption[]
  handleFlowChange: (value: string) => void
  stepKeys: StepKey[]
  activeStep: number
  activeStepKey: StepKey | null
  isCompleted: boolean
  goToPreviousStep: () => void
  handleAdvance: () => void
  flowDescription?: string

  // System Selection
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  handleSystemSelect: (systemId: string) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void

  // Form State
  currentFormState: ReturnType<typeof useFormManager>['currentFormState']
  formDefinitions: FormDefinitionsState
  formStatus: FormStatusState
  formErrors: FormErrorState
  attachFormRef: (key: StepKey, ref: FormStepRef | null) => void
  onFormChange: UseFormManagerResult['onFormChange']
  onFormSubmit: UseFormManagerResult['onFormSubmit']
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
  treeSelection: TreeSelectionList
  handleTreeSelection: (systemId: string, selection: TreeSelectionList) => void
  attachments: Attachment[]
  handleAttachmentsChange: (systemId: string, attachments: Attachment[]) => void

  // Result
  result: AggregatedResult | null
  resetFlowState: () => void
  nextButtonDisabled: boolean
}

export function useEntityFlowState(): UseEntityFlowStateResult {
  const [result, setResult] = useState<AggregatedResult | null>(null)

  // ─────────────────────────────────────────────────────────────────────────
  // Compose Sub-Hooks
  // ─────────────────────────────────────────────────────────────────────────

  const entityConfig = useEntityConfig()

  const systemSelection = useSystemSelection({
    config: entityConfig.config,
  })

  const flowNavigation = useFlowNavigation({
    config: entityConfig.config,
    selectedSystem: systemSelection.selectedSystem,
  })

  const formManager = useFormManager({
    flow: flowNavigation.flow,
    selectedSystem: systemSelection.selectedSystem,
    systems: entityConfig.systems,
    activeStepKey: flowNavigation.activeStepKey,
    stepKeys: flowNavigation.stepKeys,
    activeStep: flowNavigation.activeStep,
    onStepComplete: flowNavigation.goToNextStep,
    onFinalSubmit: useCallback(() => {
      const aggregate = buildAggregateResult(
        flowNavigation.flow,
        flowNavigation.stepKeys,
        formManager.currentFormState,
        systemSelection.selectedSystem
      )
      if (aggregate) {
        setResult(aggregate)
        flowNavigation.setActiveStep(flowNavigation.stepKeys.length)
      }
    }, [flowNavigation.flow, flowNavigation.stepKeys, flowNavigation.setActiveStep, systemSelection.selectedSystem]),
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Coordinated Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /** Handle flow change (resets navigation and system selection) */
  const handleFlowChange = useCallback((value: string) => {
    flowNavigation.handleFlowChange(value)
    systemSelection.clearSystemSelection()
    setResult(null)
  }, [flowNavigation, systemSelection])

  /** Handle system selection (ensures form state) */
  const handleSystemSelect = useCallback((systemId: string) => {
    systemSelection.handleSystemSelect(systemId, () => {
      formManager.ensureFormState(systemId)
    })
    setResult(null)
  }, [systemSelection, formManager])

  /** Handle "Next" button click */
  const handleAdvance = useCallback(() => {
    const { stepKeys, activeStep, goToNextStep, isCompleted } = flowNavigation
    const { selectedSystem, treeSelection, getFormRef } = { 
      selectedSystem: systemSelection.selectedSystem,
      treeSelection: formManager.treeSelection,
      getFormRef: formManager.getFormRef,
    }

    if (!stepKeys.length || isCompleted) return

    const currentKey = stepKeys[activeStep]
    if (!currentKey) return

    // Validation: system step requires selection
    if (currentKey === 'system' && !selectedSystem) return

    // Validation: tree step requires at least one selection
    if (currentKey === 'tree' && treeSelection.length === 0) return

    const formRef = getFormRef(currentKey)

    // For form steps (general, monitor)
    if (currentKey === 'general' || currentKey === 'monitor') {
      if (formRef && typeof formRef.handleSubmit === 'function') {
        // Trigger React Hook Form submission with validation
        formRef.handleSubmit(
          // Success callback - only runs if validation passes
          (data) => {
            // onFormSubmit already handles step advancement, so we don't call goToNextStep here
            formManager.onFormSubmit(currentKey, data)
          },
          // Error callback - runs if validation fails
          (errors) => {
            console.log('Form validation failed:', errors)
            // Do nothing - stay on current step
          }
        )()
      } else {
        // Form ref not attached yet - don't advance
        console.warn(`Form ref not attached for step: ${currentKey}`)
      }
    } else if (activeStep === stepKeys.length - 1) {
      // Final step (tree) - trigger submission for non-form steps
      const aggregate = buildAggregateResult(
        flowNavigation.flow,
        stepKeys,
        formManager.currentFormState,
        selectedSystem
      )
      if (aggregate) {
        setResult(aggregate)
        flowNavigation.setActiveStep(stepKeys.length)
      }
    } else {
      // Non-form step (system, tree) - just advance
      goToNextStep()
    }
  }, [flowNavigation, systemSelection.selectedSystem, formManager])

  /** Reset all flow state */
  const resetFlowState = useCallback(() => {
    flowNavigation.resetNavigation()
    systemSelection.clearSystemSelection()
    formManager.resetFormState()
    formManager.resetFormRefs()
    setResult(null)
  }, [flowNavigation, systemSelection, formManager])

  // ─────────────────────────────────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────────────────────────────────

  const canMoveNext = Boolean(systemSelection.selectedSystem)

  const nextButtonDisabled =
    (flowNavigation.activeStepKey === 'system' && !canMoveNext) ||
    (flowNavigation.activeStepKey === 'tree' && formManager.treeSelection.length === 0) ||
    (flowNavigation.activeStepKey !== null &&
      flowNavigation.activeStepKey !== 'system' &&
      systemSelection.selectedSystem !== null &&
      formManager.formStatus[systemSelection.selectedSystem]?.[flowNavigation.activeStepKey] === 'loading')

  // ─────────────────────────────────────────────────────────────────────────
  // Return Controller Object
  // ─────────────────────────────────────────────────────────────────────────

  return useMemo<UseEntityFlowStateResult>(
    () => ({
      // Config
      config: entityConfig.config,
      configStatus: entityConfig.configStatus,
      configError: entityConfig.configError,
      handleConfigRetry: entityConfig.handleConfigRetry,
      categories: entityConfig.categories,
      systems: entityConfig.systems,
      stepDefinitions: entityConfig.stepDefinitions,

      // Flow & Navigation
      flow: flowNavigation.flow,
      flowOptions: flowNavigation.flowOptions,
      handleFlowChange,
      stepKeys: flowNavigation.stepKeys,
      activeStep: flowNavigation.activeStep,
      activeStepKey: flowNavigation.activeStepKey,
      isCompleted: flowNavigation.isCompleted,
      goToPreviousStep: flowNavigation.goToPreviousStep,
      handleAdvance,
      flowDescription: flowNavigation.flowDescription,

      // System Selection
      selectedSystem: systemSelection.selectedSystem,
      selectedSystemConfig: systemSelection.selectedSystemConfig,
      handleSystemSelect,
      annotateSystemIcon: formManager.annotateSystemIcon,

      // Form State
      currentFormState: formManager.currentFormState,
      formDefinitions: formManager.formDefinitions,
      formStatus: formManager.formStatus,
      formErrors: formManager.formErrors,
      attachFormRef: formManager.attachFormRef,
      onFormChange: formManager.onFormChange,
      onFormSubmit: formManager.onFormSubmit,
      requestFormDefinition: formManager.requestFormDefinition,
      treeSelection: formManager.treeSelection,
      handleTreeSelection: formManager.handleTreeSelection,
      attachments: formManager.attachments,
      handleAttachmentsChange: formManager.handleAttachmentsChange,

      // Result
      result,
      resetFlowState,
      nextButtonDisabled,
    }),
    [
      entityConfig,
      flowNavigation,
      handleFlowChange,
      handleAdvance,
      systemSelection,
      handleSystemSelect,
      formManager,
      result,
      resetFlowState,
      nextButtonDisabled,
    ]
  )
}
