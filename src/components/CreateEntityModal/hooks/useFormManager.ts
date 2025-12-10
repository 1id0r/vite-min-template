/**
 * useFormManager - Form State Management Hook
 * 
 * Handles all form-related state including:
 * - Form data per system/step
 * - Form definitions (schemas) loading
 * - Form status and errors
 * - Form refs for programmatic submission
 * - Tree selection state
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormDefinition, StepKey, SystemDefinition } from '../../../types/entity'
import type { TreeSelectionList } from '../../../types/tree'
import type { FlowId, FormStatus } from '../types'
import type { FormStepRef } from '../FormStepCard'
import {
  applyFormDataChange,
  createEmptyStepState,
  type FormDefinitionsState,
  type FormErrorState,
  type FormState,
  type FormStatusState,
  shouldApplyInitialData,
} from '../entityFormUtils'
import { DISPLAY_FLOW_ID, fallbackSystemIconName } from '../iconRegistry'
import { GeneralFormSchema, getMonitorSchema } from '../../../schemas/formSchemas'

export interface UseFormManagerResult {
  formState: FormState
  currentFormState: Record<StepKey, unknown>
  formDefinitions: FormDefinitionsState
  formStatus: FormStatusState
  formErrors: FormErrorState
  attachFormRef: (key: StepKey, ref: FormStepRef | null) => void
  getFormRef: (key: StepKey) => FormStepRef | null
  onFormChange: (systemId: string, key: StepKey, data: unknown) => void
  onFormSubmit: (key: StepKey, data: unknown) => void
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
  treeSelection: TreeSelectionList
  handleTreeSelection: (systemId: string, selection: TreeSelectionList) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void
  ensureFormState: (systemId: string) => void
  resetFormState: () => void
  resetFormRefs: () => void
}

interface UseFormManagerParams {
  flow: FlowId
  selectedSystem: string | null
  systems: Record<string, SystemDefinition>
  activeStepKey: StepKey | null
  stepKeys: StepKey[]
  activeStep: number
  onStepComplete: () => void
  onFinalSubmit: () => void
}

export function useFormManager({
  flow,
  selectedSystem,
  systems,
  activeStepKey,
  stepKeys,
  activeStep,
  onStepComplete,
  onFinalSubmit,
}: UseFormManagerParams): UseFormManagerResult {
  // Form data state: { systemId: { stepKey: formData } }
  const [formState, setFormState] = useState<FormState>({})

  // Form definition state (schemas loaded per step)
  const [formDefinitions, setFormDefinitions] = useState<FormDefinitionsState>({})
  const [formStatus, setFormStatus] = useState<FormStatusState>({})
  const [formErrors, setFormErrors] = useState<FormErrorState>({})

  // Form refs for programmatic submission
  const formRefs = useRef<Record<StepKey, FormStepRef | null>>({
    system: null,
    general: null,
    monitor: null,
    tree: null,
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Form State Management
  // ─────────────────────────────────────────────────────────────────────────

  /** Initialize empty form state for a system if it doesn't exist */
  const ensureFormState = useCallback((systemId: string) => {
    setFormState((prev) => {
      if (prev[systemId]) return prev
      return { ...prev, [systemId]: createEmptyStepState() }
    })
  }, [])

  /** Apply initial data from form definition to form state */
  const applyInitialData = useCallback(
    (systemId: string, stepKey: StepKey, definition: FormDefinition) => {
      const rawInitialData = definition.initialData
      const initialData =
        flow === DISPLAY_FLOW_ID && stepKey === 'general'
          ? { ...(rawInitialData ?? {}), entityType: 'תצוגה' }
          : rawInitialData

      setFormState((prev) => {
        const existingSystemState = prev[systemId] ?? createEmptyStepState()
        const currentValue = existingSystemState[stepKey]

        if (!shouldApplyInitialData(currentValue, initialData)) return prev

        return {
          ...prev,
          [systemId]: { ...existingSystemState, [stepKey]: initialData },
        }
      })
    },
    [flow]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Form Definition Loading
  // ─────────────────────────────────────────────────────────────────────────

  /** Get or create form definition with schema based on step type */
  const requestFormDefinition = useCallback(
    async (systemId: string, stepKey: StepKey) => {
      ensureFormState(systemId)

      setFormStatus((prev) => ({
        ...prev,
        [systemId]: { ...prev[systemId], [stepKey]: 'loading' },
      }))
      setFormErrors((prev) => ({
        ...prev,
        [systemId]: { ...prev[systemId], [stepKey]: undefined },
      }))

      try {
        // Create form definition with appropriate schema
        const schema = stepKey === 'general' ? GeneralFormSchema: getMonitorSchema(systemId)
        
        // Set initial data for general form
        let initialData: Record<string, unknown> = {}
        if (stepKey === 'general') {
          const systemLabel = systems[systemId]?.label ?? systemId
          initialData = {
            entityType: flow === DISPLAY_FLOW_ID ? 'תצוגה' : systemLabel
          }
        }
        
        const definition: FormDefinition = { schema, initialData }
        
        setFormDefinitions((prev) => ({
          ...prev,
          [systemId]: { ...prev[systemId], [stepKey]: definition },
        }))
        setFormStatus((prev) => ({
          ...prev,
          [systemId]: { ...prev[systemId], [stepKey]: 'success' },
        }))
        applyInitialData(systemId, stepKey, definition)
        return definition
      } catch (error) {
        setFormStatus((prev) => ({
          ...prev,
          [systemId]: { ...prev[systemId], [stepKey]: 'error' },
        }))
        setFormErrors((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: error instanceof Error ? error.message : 'Failed to load form definition',
          },
        }))
        throw error
      }
    },
    [applyInitialData, ensureFormState, flow]
  )

  // Auto-fetch form definition when step changes
  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === 'system' || activeStepKey === 'tree') {
      return
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    const status: FormStatus | undefined = formStatus[selectedSystem]?.[activeStepKey]

    if (definition || status === 'loading') return

    requestFormDefinition(selectedSystem, activeStepKey).catch(() => {
      // error handled via state
    })
  }, [activeStepKey, formDefinitions, formStatus, requestFormDefinition, selectedSystem])

  // Re-apply initial data when step changes
  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === 'system' || activeStepKey === 'tree') {
      return
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    if (definition) {
      applyInitialData(selectedSystem, activeStepKey, definition)
    }
  }, [activeStepKey, applyInitialData, formDefinitions, selectedSystem])

  // ─────────────────────────────────────────────────────────────────────────
  // Form Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /** Handle form data change */
  const onFormChange = useCallback((systemId: string, key: StepKey, data: unknown) => {
    applyFormDataChange(setFormState, systemId, key, data)
  }, [])

  /** Handle form submission */
  const onFormSubmit = useCallback(
    (key: StepKey, data: unknown) => {
      if (!selectedSystem) return

      applyFormDataChange(setFormState, selectedSystem, key, data)

      if (stepKeys[activeStep] === key) {
        if (activeStep === stepKeys.length - 1) {
          onFinalSubmit()
        } else {
          onStepComplete()
        }
      }
    },
    [activeStep, onStepComplete, onFinalSubmit, selectedSystem, stepKeys]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Form Refs
  // ─────────────────────────────────────────────────────────────────────────

  /** Attach a form ref for programmatic submission */
  const attachFormRef = useCallback((key: StepKey, ref: FormStepRef | null) => {
    formRefs.current[key] = ref
  }, [])

  /** Get form ref by step key */
  const getFormRef = useCallback((key: StepKey) => {
    return formRefs.current[key]
  }, [])

  /** Reset all form refs */
  const resetFormRefs = useCallback(() => {
    formRefs.current = {
      system: null,
      general: null,
      monitor: null,
      tree: null,
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Tree Selection
  // ─────────────────────────────────────────────────────────────────────────

  const treeSelection = useMemo<TreeSelectionList>(() => {
    if (!selectedSystem) return []
    const treeState = (formState[selectedSystem] ?? createEmptyStepState()).tree
    if (Array.isArray(treeState)) {
      return treeState.filter(
        (item) => item && typeof item.vid === 'string' && typeof item.displayName === 'string'
      ) as TreeSelectionList
    }
    return []
  }, [formState, selectedSystem])

  /** Handle tree selection change */
  const handleTreeSelection = useCallback(
    (systemId: string, selection: TreeSelectionList) => {
      ensureFormState(systemId)
      setFormState((prev) => {
        const existingState = prev[systemId] ?? createEmptyStepState()
        return {
          ...prev,
          [systemId]: { ...existingState, tree: selection },
        }
      })
    },
    [ensureFormState]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Icon Annotation
  // ─────────────────────────────────────────────────────────────────────────

  /** Annotate system with an icon */
  const annotateSystemIcon = useCallback((systemId: string, iconName?: string) => {
    setFormState((prev) => {
      const existingState = prev[systemId] ?? createEmptyStepState()
      const currentSystemState =
        typeof existingState.system === 'object' && existingState.system !== null
          ? (existingState.system as Record<string, unknown>)
          : {}

      return {
        ...prev,
        [systemId]: {
          ...existingState,
          system: { ...currentSystemState, icon: iconName ?? fallbackSystemIconName },
        },
      }
    })
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────────────────────────────────

  const currentFormState = useMemo(() => {
    if (!selectedSystem) return createEmptyStepState()
    return formState[selectedSystem] ?? createEmptyStepState()
  }, [formState, selectedSystem])

  /** Reset all form state */
  const resetFormState = useCallback(() => {
    setFormState({})
  }, [])

  return useMemo(
    () => ({
      formState,
      currentFormState,
      formDefinitions,
      formStatus,
      formErrors,
      attachFormRef,
      getFormRef,
      onFormChange,
      onFormSubmit,
      requestFormDefinition,
      treeSelection,
      handleTreeSelection,
      annotateSystemIcon,
      ensureFormState,
      resetFormState,
      resetFormRefs,
    }),
    [
      formState,
      currentFormState,
      formDefinitions,
      formStatus,
      formErrors,
      attachFormRef,
      getFormRef,
      onFormChange,
      onFormSubmit,
      requestFormDefinition,
      treeSelection,
      handleTreeSelection,
      annotateSystemIcon,
      ensureFormState,
      resetFormState,
      resetFormRefs,
    ]
  )
}
