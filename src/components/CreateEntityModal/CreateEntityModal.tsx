import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
} from '@mantine/core'
import type { IChangeEvent } from '@rjsf/core'
import type { IconType } from 'react-icons'
import * as FiIcons from 'react-icons/fi'
import { fetchEntityConfig, fetchFormDefinition } from '../../api/client'
import type {
  CategoryDefinition,
  EntityConfig,
  FlowDefinition,
  FormDefinition,
  StepKey,
  SystemDefinition,
} from '../../types/entity'
import { FlowStepper } from './FlowStepper'
import { FormStepCard, type RjsfFormRef } from './FormStepCard'
import { ResultSummary } from './ResultSummary'
import { SystemSelectionPanel } from './SystemSelectionPanel'
import type {
  AggregatedResult,
  FlowId,
  FlowOption,
  FormStatus,
  IconResolver,
} from './types'

const createEmptyStepState = (): Record<StepKey, unknown> => ({
  system: {},
  general: {},
  monitor: {},
})

const iconRegistry = FiIcons as Record<string, IconType>

const resolveIcon: IconResolver = (name) => {
  if (!name) {
    return undefined
  }

  return iconRegistry[name]
}

const fallbackCategoryIcon = resolveIcon('FiLayers')!
const fallbackSystemIcon = resolveIcon('FiBox')!
const categoryPrefixIcon = resolveIcon('FiArrowLeft') ?? fallbackCategoryIcon

type RjsfFormRefs = Record<StepKey, RjsfFormRef | null>

interface FormState {
  [key: string]: Record<StepKey, unknown>
}

type FormDefinitionsState = Record<string, Partial<Record<StepKey, FormDefinition>>>
type FormStatusState = Record<string, Partial<Record<StepKey, FormStatus>>>
type FormErrorState = Record<string, Partial<Record<StepKey, string>>>

export function CreateEntityModal() {
  const [opened, setOpened] = useState(false)
  const [flow, setFlow] = useState<FlowId>('display')
  const [activeStep, setActiveStep] = useState(0)
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>({})
  const [result, setResult] = useState<AggregatedResult | null>(null)
  const [config, setConfig] = useState<EntityConfig | null>(null)
  const [configStatus, setConfigStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [configError, setConfigError] = useState<string | null>(null)
  const [configReloadKey, setConfigReloadKey] = useState(0)
  const [formDefinitions, setFormDefinitions] = useState<FormDefinitionsState>({})
  const [formStatus, setFormStatus] = useState<FormStatusState>({})
  const [formErrors, setFormErrors] = useState<FormErrorState>({})
  const formRefs = useRef<RjsfFormRefs>({
    system: null,
    general: null,
    monitor: null,
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
      setFlow(firstFlow.id)
      setActiveStep(0)
      setSelectedSystem(null)
    }
  }, [config, flow])

  const currentFlow = config ? config.flows[flow] ?? null : null

  useEffect(() => {
    if (!currentFlow) {
      return
    }

    if (activeStep > currentFlow.steps.length) {
      setActiveStep(0)
    }
  }, [currentFlow, activeStep])

  const stepKeys: StepKey[] = currentFlow?.steps ?? []
  const isCompleted = currentFlow ? activeStep === stepKeys.length : false
  const activeStepKey = !isCompleted ? stepKeys[activeStep] ?? null : null

  const applyInitialData = useCallback((systemId: string, stepKey: StepKey, definition: FormDefinition) => {
    const { initialData } = definition
    setFormState((prev) => {
      const existingSystemState = prev[systemId] ?? createEmptyStepState()
      const currentValue = existingSystemState[stepKey]

      const shouldApplyInitial =
        initialData !== undefined &&
        (currentValue === undefined ||
          (typeof currentValue === 'object' &&
            currentValue !== null &&
            Object.keys(currentValue as Record<string, unknown>).length === 0))

      if (!prev[systemId] || shouldApplyInitial) {
        return {
          ...prev,
          [systemId]: {
            ...existingSystemState,
            ...(shouldApplyInitial ? { [stepKey]: initialData } : {}),
          },
        }
      }

      return prev
    })
  }, [])

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
    if (!selectedSystem || !activeStepKey || activeStepKey === 'system') {
      return
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    const status = formStatus[selectedSystem]?.[activeStepKey]

    if (definition || status === 'loading') {
      return
    }

    requestFormDefinition(selectedSystem, activeStepKey).catch(() => {
      // error state handled via formStatus/formErrors
    })
  }, [activeStepKey, formDefinitions, formStatus, requestFormDefinition, selectedSystem])

  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === 'system') {
      return
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    if (definition) {
      applyInitialData(selectedSystem, activeStepKey, definition)
    }
  }, [activeStepKey, applyInitialData, formDefinitions, selectedSystem])

  const selectedSystemConfig = selectedSystem && config ? config.systems[selectedSystem] ?? null : null

  const currentFormState = selectedSystem ? formState[selectedSystem] ?? createEmptyStepState() : createEmptyStepState()

  const canMoveNext = Boolean(selectedSystem)

  const goToNextStep = useCallback(() => {
    setActiveStep((step) => {
      const next = step + 1
      return Math.min(next, stepKeys.length)
    })
  }, [stepKeys.length])

  const goToPreviousStep = useCallback(() => {
    setActiveStep((step) => Math.max(step - 1, 0))
  }, [])

  const aggregateResult = useCallback(() => {
    if (!selectedSystem) {
      return null
    }

    const data = stepKeys.reduce<Record<StepKey, unknown>>((acc, key) => {
      acc[key] = currentFormState[key]
      return acc
    }, {} as Record<StepKey, unknown>)

    return {
      flow,
      systemId: selectedSystem,
      formData: data,
    }
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

    const formRef = formRefs.current[currentKey]

    if (formRef && typeof formRef.submit === 'function') {
      formRef.submit()
    } else if (activeStep === stepKeys.length - 1) {
      handleCreate()
    } else {
      goToNextStep()
    }
  }, [activeStep, canMoveNext, goToNextStep, handleCreate, stepKeys])

  const handleOpen = useCallback(() => {
    setOpened(true)
  }, [])

  const resetRefs = useCallback(() => {
    formRefs.current = {
      system: null,
      general: null,
      monitor: null,
    }
  }, [])

  const resetState = useCallback(() => {
    setActiveStep(0)
    setSelectedSystem(null)
    setResult(null)
    setFormState({})
    resetRefs()
  }, [resetRefs])

  const handleClose = useCallback(() => {
    setOpened(false)
    resetState()
  }, [resetState])

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

  const onFormChange = useCallback((systemId: string, key: StepKey, change: IChangeEvent) => {
    setFormState((prev) => ({
      ...prev,
      [systemId]: {
        ...(prev[systemId] ?? {}),
        [key]: change.formData,
      },
    }))
  }, [])

  const onFormSubmit = useCallback(
    (key: StepKey, change: IChangeEvent) => {
      if (!selectedSystem) {
        return
      }

      setFormState((prev) => ({
        ...prev,
        [selectedSystem]: {
          ...(prev[selectedSystem] ?? {}),
          [key]: change.formData,
        },
      }))

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

  const categories = (config?.categories ?? []) as CategoryDefinition[]
  const systems = (config?.systems ?? {}) as Record<string, SystemDefinition>
  const stepDefinitions = config?.steps
  const flowDescription = currentFlow?.description?.trim()
  const nextButtonDisabled =
    (activeStepKey === 'system' && !canMoveNext) ||
    (activeStepKey !== null &&
      activeStepKey !== 'system' &&
      selectedSystem !== null &&
      formStatus[selectedSystem]?.[activeStepKey] === 'loading')

  const renderStepContent = () => {
    if (!activeStepKey) {
      return null
    }

    if (activeStepKey === 'system') {
      return (
        <Paper withBorder p='lg' shadow='xs'>
          <SystemSelectionPanel
            categories={categories}
            systems={systems}
            selectedSystem={selectedSystem}
            selectedSystemConfig={selectedSystemConfig ?? null}
            flowOptions={flowOptions}
            activeFlow={flow}
            onFlowChange={handleFlowChange}
            flowDescription={flowDescription}
            onSystemSelect={handleSystemSelect}
            resolveIcon={resolveIcon}
            fallbackCategoryIcon={fallbackCategoryIcon}
            fallbackSystemIcon={fallbackSystemIcon}
            prefixIcon={categoryPrefixIcon}
          />
        </Paper>
      )
    }

    if (!selectedSystem) {
      return (
        <Alert color='blue' title='Select a system'>
          Choose one of the templates from the menu to unlock this step.
        </Alert>
      )
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey]
    const status = formStatus[selectedSystem]?.[activeStepKey]
    const error = formErrors[selectedSystem]?.[activeStepKey]

    return (
      <FormStepCard
        status={status}
        definition={definition}
        error={error}
        formData={currentFormState[activeStepKey]}
        attachRef={(ref) => attachFormRef(activeStepKey, ref)}
        onChange={(change) => onFormChange(selectedSystem, activeStepKey, change)}
        onSubmit={(change) => onFormSubmit(activeStepKey, change)}
        onRetry={() => requestFormDefinition(selectedSystem, activeStepKey)}
        fullHeight
      />
    )
  }

  return (
    <>
      <Button onClick={handleOpen}>Create entity</Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title='Create new entity'
        size='xl'
        radius='md'
        styles={{
          body: {
            minHeight: 640,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          style={{
            minHeight: 640,
            flex: 1,
            display: 'flex',
          }}
        >
          {configStatus === 'loading' && !config && (
            <Center py='lg'>
              <Loader />
            </Center>
          )}

          {configStatus === 'error' && !config && (
            <Alert color='red' title='Unable to load configuration'>
              <Stack gap='sm'>
                <Text size='sm'>{configError ?? 'Check that the API is running on port 8000 and retry.'}</Text>
                <Group justify='flex-end'>
                  <Button size='xs' variant='light' onClick={handleConfigRetry}>
                    Retry
                  </Button>
                </Group>
              </Stack>
            </Alert>
          )}

          {config && currentFlow && (
            <>
              <FlowStepper stepKeys={stepKeys} activeStep={activeStep} definitions={stepDefinitions} />

              {!isCompleted && (
                <Box
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {renderStepContent()}
                </Box>
              )}

              {isCompleted && <ResultSummary result={result} onClose={handleClose} />}

              {!isCompleted && (
                <>
                  <Divider />
                  <Group justify='space-between'>
                    <Button variant='default' onClick={goToPreviousStep} disabled={activeStep === 0}>
                      Back
                    </Button>
                    <Group>
                      <Button variant='default' onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button onClick={handleAdvance} disabled={nextButtonDisabled}>
                        {activeStep === stepKeys.length - 1 ? 'Create entity' : 'Next'}
                      </Button>
                    </Group>
                  </Group>
                </>
              )}
            </>
          )}
        </Stack>
      </Modal>
    </>
  )
}
