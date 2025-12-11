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
import type { Attachment, FormDefinition, StepKey, SystemDefinition } from '../../../types/entity'
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
  attachments: Attachment[]
  handleAttachmentsChange: (systemId: string, attachments: Attachment[]) => void
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
    
    // Handle legacy array state
    if (Array.isArray(treeState)) {
      return treeState.filter(
        (item) => item && typeof item.vid === 'string' && typeof item.displayName === 'string'
      ) as TreeSelectionList
    }

    // Handle new object state
    const measurements = (treeState as any)?.measurements
    if (Array.isArray(measurements)) {
      return measurements.filter(
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
        const existingSystem = prev[systemId] ?? createEmptyStepState()
        const currentTreeData = existingSystem.tree as any
        
        // Preserve existing attachments if any
        const currentAttachments = Array.isArray(currentTreeData) ? [] : (currentTreeData?.attachments ?? [])

        return {
          ...prev,
          [systemId]: { 
            ...existingSystem, 
            tree: {
              measurements: selection,
              attachments: currentAttachments
            }
          },
        }
      })
    },
    [ensureFormState]
  )
  
  // ─────────────────────────────────────────────────────────────────────────
  // Attachments (Bindings)
  // ─────────────────────────────────────────────────────────────────────────

  const attachments = useMemo<Attachment[]>(() => {
    if (!selectedSystem) return []
    // We store attachments in the 'tree' step state for now alongside tree selection, 
    // or we could add a new 'attachments' key to StepState. 
    // Let's assume we add it to the 'tree' step data object if possible, 
    // BUT the StepState type is Record<StepKey, unknown>.
    // To keep it simple without changing StepKey, we'll store it in a specific way or just misuse 'monitor' step?
    // Actually, StepKey currently includes 'tree'.
    // Let's store it in a property called 'attachments' inside the 'tree' step data object.
    
    // Wait, createEmptyStepState initializes 'tree' as [].
    // We should probably change the tree step state to be an object { selection: [], attachments: [] } 
    // OR just use a separate state in this hook if it doesn't need to persist to the same structure.
    // However, for final submission we want it in formState.
    
    // Let's pivot: We will store attachments in `formState[systemId].attachments` 
    // But StepKey is fixed. Let's add 'attachments' to StepKey type? 
    // The user didn't ask to change StepKey "tree". 
    // The requirement is "Step 4 will be called הצמדות... tab of מדידות (tree)... tab הצמדות (bindings)".
    // So conceptually they are part of Step 4.
    
    // Let's store it in `formState[systemId].tree` but we need to change what `tree` stores.
    // Currently `tree` stores `TreeSelectionList` (array).
    // We should migrate `tree` step state to be `{ treeSelection: [], attachments: [] }`.
    // But that breaks type safety of `TreeSelectionList`.
    
    // EASIER APPROACH for now: Store it in state but sync it to `formState` ad-hoc or 
    // just allow `tree` step to hold an object that HAS the selection.
    
    // Let's look at `createEmptyStepState`.
    // It returns `{ system: {}, general: {}, monitor: {}, tree: [] }`.
    
    // I will modify `handleTreeSelection` and `handleAttachmentsChange` to store data in a combined object under 'tree' key if possible,
    // OR just add a separate piece of state in this hook and merge it on submit.
    // BUT `currentFormState` returns `Record<StepKey, unknown>`.
    
    // Let's go with: Attachments are specific to Step 4.
    // I will simply add `attachments` to the return of this hook, and internally manage it.
    // To persist it, I will store it in `formState[systemId].attachments` effectively treating it as a new "virtual" step or field,
    // even if StepKey doesn't have it.
    
    // Actually, I'll just CAST the `tree` state to `any` and store `{ selection: [...], attachments: [...] }`.
    // But that breaks `treeSelection` selector above.
    
    // Revised Plan:
    // 1. Rename `treeSelection` to `measurements`.
    // 2. Update `tree` step state to be an object: `{ measurements: TreeSelectionList, attachments: Attachment[] }`.
    // 3. Update selectors to read from this object.
    
    const stepData = (formState[selectedSystem] ?? createEmptyStepState()).tree as any
    // Backwards compatibility check
    if (Array.isArray(stepData)) {
      return [] 
    }
    return stepData?.attachments ?? []
  }, [formState, selectedSystem])

  const handleAttachmentsChange = useCallback(
    (systemId: string, newAttachments: Attachment[]) => {
      ensureFormState(systemId)
      setFormState((prev) => {
        const existingSystem = prev[systemId] ?? createEmptyStepState()
        const currentTreeData = existingSystem.tree as any
        
        // Handle migration from array to object if needed
        const currentMeasurements = Array.isArray(currentTreeData) ? currentTreeData : (currentTreeData?.measurements ?? [])

        return {
          ...prev,
          [systemId]: {
            ...existingSystem,
            tree: {
              measurements: currentMeasurements,
              attachments: newAttachments
            }
          },
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
      attachments,
      handleAttachmentsChange,
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
