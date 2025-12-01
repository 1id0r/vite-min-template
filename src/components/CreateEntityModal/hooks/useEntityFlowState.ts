import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { IChangeEvent } from '@rjsf/core'
import { fetchEntityConfig, fetchFormDefinition } from '../../../api/client'
import type {
  CategoryDefinition,
  EntityConfig,
  FlowDefinition,
  FormDefinition,
  StepDefinition,
  StepKey,
  SystemDefinition,
} from '../../../types/entity'
import type { AggregatedResult, FlowId, FlowOption, FormStatus } from '../types'
import type { TreeSelectionList } from '../../../types/tree'
import {
  applyFormChange,
  buildAggregateResult,
  createEmptyStepState,
  type FormDefinitionsState,
  type FormErrorState,
  type FormState,
  type FormStatusState,
  shouldApplyInitialData,
} from '../entityFormUtils'
import type { RjsfFormRef } from '../FormStepCard'
import { DISPLAY_FLOW_ID, fallbackSystemIconName } from '../iconRegistry'

type ConfigStatus = 'idle' | 'loading' | 'error' | 'success'

export interface UseEntityFlowStateResult {
  config: EntityConfig | null
  configStatus: ConfigStatus
  configError: string | null
  handleConfigRetry: () => void
  flow: FlowId
  flowOptions: FlowOption[]
  handleFlowChange: (value: string) => void
  stepKeys: StepKey[]
  activeStep: number
  activeStepKey: StepKey | null
  isCompleted: boolean
  goToPreviousStep: () => void
  handleAdvance: () => void
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  handleSystemSelect: (systemId: string) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void
  handleTreeSelection: (systemId: string, selection: TreeSelectionList) => void
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  stepDefinitions?: Record<StepKey, StepDefinition>
  flowDescription?: string
  currentFormState: Record<StepKey, unknown>
  formDefinitions: FormDefinitionsState
  formStatus: FormStatusState
  formErrors: FormErrorState
  attachFormRef: (key: StepKey, ref: RjsfFormRef | null) => void
  onFormChange: (systemId: string, key: StepKey, change: IChangeEvent) => void
  onFormSubmit: (key: StepKey, change: IChangeEvent) => void
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
  treeSelection: TreeSelectionList
  result: AggregatedResult | null
  resetFlowState: () => void
  nextButtonDisabled: boolean
}

export function useEntityFlowState(): UseEntityFlowStateResult {
  const [flow, setFlow] = useState<FlowId>(DISPLAY_FLOW_ID)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>({})
  const [result, setResult] = useState<AggregatedResult | null>(null)

  const [config, setConfig] = useState<EntityConfig | null>(null)
  const [configStatus, setConfigStatus] = useState<ConfigStatus>('idle')
  const [configError, setConfigError] = useState<string | null>(null)
  const [configReloadKey, setConfigReloadKey] = useState(0)

  const [formDefinitions, setFormDefinitions] = useState<FormDefinitionsState>({})
  const [formStatus, setFormStatus] = useState<FormStatusState>({})
  const [formErrors, setFormErrors] = useState<FormErrorState>({})

  const formRefs = useRef<Record<StepKey, RjsfFormRef | null>>({
    system: null,
    general: null,
    monitor: null,
    tree: null,
  })

  const handleConfigRetry = useCallback(() => {
    setConfigReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadConfig = async () => {
      setConfigStatus('loading')
      setConfigError(null)

      try {
        const data = await fetchEntityConfig()
        if (!cancelled) {
          setConfig(data)
          setConfigStatus('success')
        }
      } catch (error) {
        if (!cancelled) {
          setConfigStatus('error')
          setConfigError(error instanceof Error ? error.message : 'Failed to load configuration')
        }
      }
    }

    loadConfig()

    return () => {
      cancelled = true
    }
  }, [configReloadKey])

  useEffect(() => {
    if (!config) {
      return
    }

    if (config.flows[flow]) {
      return
    }

    const [firstFlow] = Object.values<FlowDefinition>(config.flows)
    if (firstFlow) {
      setFlow(firstFlow.id as FlowId)
      setActiveStep(0)
      setSelectedSystem(null)
    }
  }, [config, flow])

  const currentFlow = config ? config.flows[flow] ?? null : null
  const stepKeys = useMemo<StepKey[]>(() => {
    if (!currentFlow) {
      return []
    }
    if (flow === 'monitor' && selectedSystem === 'general') {
      return currentFlow.steps.filter((key) => key !== 'monitor' && key !== 'tree')
    }
    return currentFlow.steps
  }, [currentFlow, flow, selectedSystem])
  const totalSteps = stepKeys.length
  const isCompleted = currentFlow ? activeStep === totalSteps : false
  const activeStepKey = useMemo<StepKey | null>(() => {
    if (isCompleted) {
      return null
    }
    return stepKeys[activeStep] ?? null
  }, [activeStep, isCompleted, stepKeys])

  useEffect(() => {
    const stepCount = currentFlow?.steps.length ?? 0
    if (stepCount && activeStep > stepCount) {
      setActiveStep(0)
    }
  }, [currentFlow, activeStep])

  const ensureFormState = useCallback((systemId: string) => {
    setFormState((prev) => {
      if (prev[systemId]) {
        return prev
      }

      return {
        ...prev,
        [systemId]: createEmptyStepState(),
      }
    })
  }, [])

  const applyInitialData = useCallback(
    (systemId: string, stepKey: StepKey, definition: FormDefinition) => {
      const rawInitialData = definition.initialData
      const initialData =
        flow === DISPLAY_FLOW_ID && stepKey === 'general'
          ? {
              ...(rawInitialData ?? {}),
              entityType: 'תצוגה',
            }
          : rawInitialData;

      setFormState((prev) => {
        const existingSystemState = prev[systemId] ?? createEmptyStepState()
        const currentValue = existingSystemState[stepKey]

        if (!shouldApplyInitialData(currentValue, initialData)) {
          return prev
        }

        return {
          ...prev,
          [systemId]: {
            ...existingSystemState,
            [stepKey]: initialData,
          },
        }
      })
    },
    [flow]
  )

  const requestFormDefinition = useCallback(
    async (systemId: string, stepKey: StepKey) => {
      ensureFormState(systemId)

      setFormStatus((prev) => ({
        ...prev,
        [systemId]: {
          ...prev[systemId],
          [stepKey]: 'loading',
        },
      }))
      setFormErrors((prev) => ({
        ...prev,
        [systemId]: {
          ...prev[systemId],
          [stepKey]: undefined,
        },
      }))

      try {
        const definition = await fetchFormDefinition(systemId, stepKey)
        setFormDefinitions((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: definition,
          },
        }))
        setFormStatus((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: 'success',
          },
        }))
        applyInitialData(systemId, stepKey, definition)
        return definition
      } catch (error) {
        setFormStatus((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: 'error',
          },
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
    [applyInitialData, ensureFormState]
  )

  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === 'system' || activeStepKey === 'tree') {
      return
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    const status: FormStatus | undefined = formStatus[selectedSystem]?.[activeStepKey]

    if (definition || status === 'loading') {
      return
    }

    requestFormDefinition(selectedSystem, activeStepKey).catch(() => {
      // error handled via state
    })
  }, [activeStepKey, formDefinitions, formStatus, requestFormDefinition, selectedSystem])

  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === 'system' || activeStepKey === 'tree') {
      return
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    if (definition) {
      applyInitialData(selectedSystem, activeStepKey, definition)
    }
  }, [activeStepKey, applyInitialData, formDefinitions, selectedSystem])

  const goToNextStep = useCallback(() => {
    setActiveStep((step) => {
      const next = step + 1
      return Math.min(next, stepKeys.length)
    })
  }, [stepKeys.length])

  const goToPreviousStep = useCallback(() => {
    setActiveStep((step) => Math.max(step - 1, 0))
  }, [])

  const selectedSystemConfig = useMemo<SystemDefinition | null>(() => {
    if (!selectedSystem || !config) {
      return null
    }
    return config.systems[selectedSystem] ?? null
  }, [config, selectedSystem])
  const currentFormState = useMemo(() => {
    if (!selectedSystem) {
      return createEmptyStepState()
    }
    return formState[selectedSystem] ?? createEmptyStepState()
  }, [formState, selectedSystem])
  const treeSelection = useMemo<TreeSelectionList>(() => {
    if (!selectedSystem) {
      return []
    }
    const treeState = (formState[selectedSystem] ?? createEmptyStepState()).tree
    if (Array.isArray(treeState)) {
      return treeState.filter(
        (item) => item && typeof item.vid === 'string' && typeof item.displayName === 'string'
      ) as TreeSelectionList
    }
    return []
  }, [formState, selectedSystem])
  const canMoveNext = Boolean(selectedSystem)

  const aggregateResult = useCallback(() => {
    return buildAggregateResult(flow, stepKeys, currentFormState, selectedSystem)
  }, [currentFormState, flow, selectedSystem, stepKeys])

  const handleCreate = useCallback(() => {
    const aggregate = aggregateResult()
    if (!aggregate) {
      return
    }

    setResult(aggregate)
    setActiveStep(stepKeys.length)
  }, [aggregateResult, stepKeys.length])

  const handleAdvance = useCallback(() => {
    if (!stepKeys.length) {
      return
    }

    const currentKey = stepKeys[activeStep]
    if (!currentKey) {
      return
    }

    if (currentKey === 'system' && !canMoveNext) {
      return
    }

    if (currentKey === 'tree' && treeSelection.length === 0) {
      return
    }

    const formRef = formRefs.current[currentKey]

    if (formRef && typeof formRef.submit === 'function') {
      formRef.submit()
    } else if (activeStep === stepKeys.length - 1) {
      handleCreate()
    } else {
      goToNextStep()
    }
  }, [activeStep, canMoveNext, goToNextStep, handleCreate, stepKeys, treeSelection])

  const resetRefs = useCallback(() => {
    formRefs.current = {
      system: null,
      general: null,
      monitor: null,
      tree: null,
    }
  }, [])

  const resetFlowState = useCallback(() => {
    setActiveStep(0)
    setSelectedSystem(null)
    setResult(null)
    setFormState({})
    resetRefs()
  }, [resetRefs])

  const handleFlowChange = useCallback((value: string) => {
    const nextFlow = value as FlowId
    setFlow(nextFlow)
    setActiveStep(0)
    setResult(null)
    setSelectedSystem(null)
  }, [])

  const handleSystemSelect = useCallback(
    (systemId: string) => {
      setSelectedSystem(systemId)
      ensureFormState(systemId)
      setResult(null)
    },
    [ensureFormState]
  )

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
          system: {
            ...currentSystemState,
            icon: iconName ?? fallbackSystemIconName,
          },
        },
      }
    })
  }, [])

  const handleTreeSelection = useCallback(
    (systemId: string, selection: TreeSelectionList) => {
      ensureFormState(systemId)
      setFormState((prev) => {
        const existingState = prev[systemId] ?? createEmptyStepState()
        return {
          ...prev,
          [systemId]: {
            ...existingState,
            tree: selection,
          },
        }
      })
    },
    [ensureFormState]
  )

  const onFormChange = useCallback((systemId: string, key: StepKey, change: IChangeEvent) => {
    applyFormChange(setFormState, systemId, key, change)
  }, [])

  const onFormSubmit = useCallback(
    (key: StepKey, change: IChangeEvent) => {
      if (!selectedSystem) {
        return
      }

      applyFormChange(setFormState, selectedSystem, key, change)

      if (stepKeys[activeStep] === key) {
        if (activeStep === stepKeys.length - 1) {
          handleCreate()
        } else {
          goToNextStep()
        }
      }
    },
    [activeStep, goToNextStep, handleCreate, selectedSystem, stepKeys]
  )

  const attachFormRef = useCallback((key: StepKey, ref: RjsfFormRef | null) => {
    formRefs.current[key] = ref
  }, [])

  const flowOptions = useMemo<FlowOption[]>(() => {
    if (!config) {
      return []
    }

    return Object.values<FlowDefinition>(config.flows).map((item) => ({
      label: item.label,
      value: item.id,
    }))
  }, [config])

  const categories = useMemo(
    () => (config?.categories ?? []) as CategoryDefinition[],
    [config]
  )
  const systems = useMemo(
    () => (config?.systems ?? {}) as Record<string, SystemDefinition>,
    [config]
  )
  const stepDefinitions = useMemo(() => config?.steps, [config])
  const flowDescription = useMemo(() => currentFlow?.description?.trim(), [currentFlow])
  const nextButtonDisabled =
    (activeStepKey === 'system' && !canMoveNext) ||
    (activeStepKey === 'tree' && treeSelection.length === 0) ||
    (activeStepKey !== null &&
      activeStepKey !== 'system' &&
      selectedSystem !== null &&
      formStatus[selectedSystem]?.[activeStepKey] === 'loading')

  // Memoize the full controller shape to prevent unnecessary downstream re-renders
  return useMemo<UseEntityFlowStateResult>(
    () => ({
      config,
      configStatus,
      configError,
      handleConfigRetry,
      flow,
      flowOptions,
      handleFlowChange,
      stepKeys,
      activeStep,
      activeStepKey,
      isCompleted,
      goToPreviousStep,
      handleAdvance,
      selectedSystem,
      selectedSystemConfig,
      handleSystemSelect,
      annotateSystemIcon,
      handleTreeSelection,
      categories,
      systems,
      stepDefinitions,
      flowDescription,
      currentFormState,
      formDefinitions,
      formStatus,
      formErrors,
      attachFormRef,
      onFormChange,
      onFormSubmit,
      requestFormDefinition,
      treeSelection,
      result,
      resetFlowState,
      nextButtonDisabled,
    }),
    [
      config,
      configStatus,
      configError,
      handleConfigRetry,
      flow,
      flowOptions,
      handleFlowChange,
      stepKeys,
      activeStep,
      activeStepKey,
      isCompleted,
      goToPreviousStep,
      handleAdvance,
      selectedSystem,
      selectedSystemConfig,
      handleSystemSelect,
      annotateSystemIcon,
      handleTreeSelection,
      categories,
      systems,
      stepDefinitions,
      flowDescription,
      currentFormState,
      formDefinitions,
      formStatus,
      formErrors,
      attachFormRef,
      onFormChange,
      onFormSubmit,
      requestFormDefinition,
      treeSelection,
      result,
      resetFlowState,
      nextButtonDisabled,
    ]
  )
}
