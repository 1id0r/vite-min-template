import { memo, useCallback, useMemo } from 'react'
import { Alert, Box, Button, Center, Divider, Group, Loader, Stack, Text } from '@mantine/core'
import type { IChangeEvent } from '@rjsf/core'
import type { CategoryDefinition, FormDefinition, StepKey, SystemDefinition } from '../../types/entity'
import { FlowStepper } from './FlowStepper'
import { FormStepCard, type RjsfFormRef } from './FormStepCard'
import { ResultSummary } from './ResultSummary'
import { SystemStep } from './SystemStep'
import TreeStep from './TreeStep'
import { DisplayIconMenu } from './DisplayIconMenu'
import { DISPLAY_FLOW_ID, DISPLAY_FLOW_SYSTEM_IDS, fallbackSystemIcon } from './iconRegistry'
import type { UseEntityFlowStateResult } from './hooks/useEntityFlowState'
import type { FlowId, FlowOption, FormStatus } from './types'

interface EntityFlowContentProps {
  controller: UseEntityFlowStateResult
  onClose: () => void
}

export function EntityFlowContent({ controller, onClose }: EntityFlowContentProps) {
  // Destructure everything from the controller to keep this component declarative
  const {
    configStatus,
    configError,
    config,
    handleConfigRetry,
    flow,
    flowOptions,
    handleFlowChange,
    activeStep,
    activeStepKey,
    isCompleted,
    stepKeys,
    stepDefinitions,
    flowDescription,
    selectedSystem,
    selectedSystemConfig,
    selectedTreeNode,
    handleTreeNodeSelect,
    categories,
    systems,
    nextButtonDisabled,
    goToPreviousStep,
    handleAdvance,
    result,
    formDefinitions,
    formStatus,
    formErrors,
    currentFormState,
    attachFormRef,
    onFormChange,
    onFormSubmit,
    requestFormDefinition,
    handleSystemSelect,
    annotateSystemIcon,
  } = controller
  const isInitialLoad = configStatus === 'loading' && !config
  const hasBlockingError = configStatus === 'error' && !config

  if (isInitialLoad) {
    return (
      <Center py='lg'>
        <Loader />
      </Center>
    )
  }

  if (hasBlockingError) {
    return <ConfigErrorNotice message={configError} onRetry={handleConfigRetry} />
  }

  if (!config || stepKeys.length === 0) {
    return null
  }

  return (
    <Stack
      style={{
        minHeight: 640,
        flex: 1,
        display: 'flex',
      }}
    >
      <Stack gap='md'>
        <FlowStepper stepKeys={stepKeys} activeStep={activeStep} definitions={stepDefinitions} />
        <Divider />
      </Stack>

      {!isCompleted && (
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StepContent
            activeStepKey={activeStepKey}
            flow={flow}
            flowOptions={flowOptions}
            onFlowChange={handleFlowChange}
            flowDescription={flowDescription}
            categories={categories}
            systems={systems}
            selectedSystem={selectedSystem}
            selectedSystemConfig={selectedSystemConfig}
            selectedTreeNode={selectedTreeNode}
            handleTreeNodeSelect={handleTreeNodeSelect}
            handleSystemSelect={handleSystemSelect}
            annotateSystemIcon={annotateSystemIcon}
            formDefinitions={formDefinitions}
            formStatus={formStatus}
            formErrors={formErrors}
            currentFormState={currentFormState}
            attachFormRef={attachFormRef}
            onFormChange={onFormChange}
            onFormSubmit={onFormSubmit}
            requestFormDefinition={requestFormDefinition}
          />
        </Box>
      )}

      {isCompleted && <ResultSummary result={result} onClose={onClose} />}

      {!isCompleted && (
        <>
          <Divider />
          <Group dir='rtl' justify='space-between'>
            <Button variant='default' onClick={goToPreviousStep} disabled={activeStep === 0}>
              חזור
            </Button>
            <Group>
              <Button variant='default' onClick={onClose}>
                ביטול
              </Button>
              <Button onClick={handleAdvance} disabled={nextButtonDisabled}>
                {activeStep === stepKeys.length - 1 ? ' צור יישות' : 'המשך'}
              </Button>
            </Group>
          </Group>
        </>
      )}
    </Stack>
  )
}

interface StepContentProps {
  activeStepKey: StepKey | null
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  selectedTreeNode: string | null
  handleTreeNodeSelect: (nodeId: string) => void
  handleSystemSelect: (systemId: string) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void
  formDefinitions: Record<string, Partial<Record<StepKey, FormDefinition>>>
  formStatus: Record<string, Partial<Record<StepKey, FormStatus>>>
  formErrors: Record<string, Partial<Record<StepKey, string>>>
  currentFormState: Record<StepKey, unknown>
  attachFormRef: (key: StepKey, ref: RjsfFormRef | null) => void
  onFormChange: (systemId: string, key: StepKey, change: IChangeEvent) => void
  onFormSubmit: (key: StepKey, change: IChangeEvent) => void
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
}

const StepContent = memo(function StepContent({
  activeStepKey,
  flow,
  flowOptions,
  onFlowChange,
  flowDescription,
  categories,
  systems,
  selectedSystem,
  selectedSystemConfig,
  selectedTreeNode,
  handleTreeNodeSelect,
  handleSystemSelect,
  annotateSystemIcon,
  formDefinitions,
  formStatus,
  formErrors,
  currentFormState,
  attachFormRef,
  onFormChange,
  onFormSubmit,
  requestFormDefinition,
}: StepContentProps) {
  const shouldShowGeneralIcons = useMemo(
    () => flow === 'monitor' && selectedSystem === 'general' && activeStepKey === 'general',
    [flow, selectedSystem, activeStepKey]
  )

  const selectedDisplayIconId = useMemo(() => {
    if (!shouldShowGeneralIcons) {
      return null
    }
    const systemState = currentFormState.system
    if (typeof systemState !== 'object' || !systemState) {
      return null
    }
    const currentIconName = (systemState as Record<string, unknown>).icon
    if (typeof currentIconName !== 'string') {
      return null
    }
    return (
      DISPLAY_FLOW_SYSTEM_IDS.find((id) => systems[id]?.icon && systems[id]?.icon === currentIconName) ?? null
    )
  }, [currentFormState, shouldShowGeneralIcons, systems])

  const handleGeneralIconSelect = useCallback(
    (iconSystemId: string, iconName?: string) => {
      if (!selectedSystem) {
        return
      }
      annotateSystemIcon(selectedSystem, iconName ?? systems[iconSystemId]?.icon)
    },
    [annotateSystemIcon, selectedSystem, systems]
  )

  if (!activeStepKey) {
    return null
  }

  if (activeStepKey === 'system') {
    const showFlowSelector = flowOptions.length > 1
    const showEntityTypeLabel = flow !== DISPLAY_FLOW_ID
    return (
      <Stack gap='lg'>
        {showFlowSelector && (
          <Stack gap={6}>
            <Box dir='rtl'>
              <Text size='sm' fw={700} c='gray.8'>
                בחירת יישות <Text component='span' c='red.6'>*</Text>
              </Text>
            </Box>
            <FlowSelector
              flow={flow}
              flowOptions={flowOptions}
              onFlowChange={onFlowChange}
              flowDescription={flowDescription}
            />
          </Stack>
        )}
        {showEntityTypeLabel && (
          <Box dir='rtl'>
            <Text size='sm' fw={700} c='gray.8'>
              סוג יישות <Text component='span' c='red.6'>*</Text>
            </Text>
          </Box>
        )}
        <SystemStep
          flow={flow}
          categories={categories}
          systems={systems}
          selectedSystem={selectedSystem}
          selectedSystemConfig={selectedSystemConfig}
          onSystemSelect={handleSystemSelect}
          onIconAnnotate={annotateSystemIcon}
        />
      </Stack>
    )
  }
    
  if (activeStepKey === 'tree') {
    return <TreeStep onSelectNode={handleTreeNodeSelect} selectedNode={selectedTreeNode} />
  }

  if (!selectedSystem) {
    return <SelectSystemPrompt />
  }

  const definition = formDefinitions[selectedSystem]?.[activeStepKey]
  const status = formStatus[selectedSystem]?.[activeStepKey]
  const error = formErrors[selectedSystem]?.[activeStepKey]

  const formCard = (
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

  if (shouldShowGeneralIcons) {
    return (
      <Stack gap='md'>
        {formCard}
        <DisplayIconMenu
          systems={systems}
          allowedSystemIds={DISPLAY_FLOW_SYSTEM_IDS}
          selectedSystem={selectedDisplayIconId}
          selectedIconId={selectedDisplayIconId}
          onIconSelect={handleGeneralIconSelect}
          fallbackSystemIcon={fallbackSystemIcon}
        />
      </Stack>
    )
  }

  return formCard
})

StepContent.displayName = 'StepContent'

interface FlowSelectorProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
}

const FLOW_LABELS: Partial<Record<FlowId, string>> = {
  monitor: 'יישות מנוטרת',
  display: 'יישות תצוגה',
  general: 'ישות כללית',
}

const FlowSelector = memo(function FlowSelector({
  flow,
  flowOptions,
  onFlowChange,
  flowDescription,
}: FlowSelectorProps) {
  const getButtonHandler = useCallback(
    (value: string) => () => onFlowChange(value),
    [onFlowChange]
  )

  return (
    <Stack gap={4} align='flex-end'>
      <Box
        dir='rtl'
        style={{
          display: 'flex',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {flowOptions.map((option, index) => {
          const isActive = option.value === flow
          const isLast = index === flowOptions.length - 1
          const translatedLabel = FLOW_LABELS[option.value as FlowId] ?? option.label
          const handleClick = getButtonHandler(option.value)

          return (
            <button
              key={option.value}
              type='button'
              onClick={handleClick}
              style={{
                padding: '6px 20px',
                border: 'none',
                borderLeft: isLast ? 'none' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#0B5FFF' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#111827',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              {translatedLabel}
            </button>
          )
        })}
      </Box>
      {flowDescription && (
        <Text size='xs' c='dimmed'>
          {flowDescription}
        </Text>
      )}
    </Stack>
  )
})

FlowSelector.displayName = 'FlowSelector'

interface ConfigErrorNoticeProps {
  message: string | null
  onRetry: () => void
}

const ConfigErrorNotice = memo(function ConfigErrorNotice({ message, onRetry }: ConfigErrorNoticeProps) {
  return (
    <Alert color='red' title='Unable to load configuration'>
      <Stack gap='sm'>
        <Text size='sm'>{message ?? 'Check that the API is running on port 8000 and retry.'}</Text>
        <Group justify='flex-end'>
          <Button size='xs' variant='light' onClick={onRetry}>
            נסה שוב
          </Button>
        </Group>
      </Stack>
    </Alert>
  )
})

ConfigErrorNotice.displayName = 'ConfigErrorNotice'

const SelectSystemPrompt = memo(function SelectSystemPrompt() {
  return (
    <Alert color='blue' title='Select a system'>
      Choose one of the templates from the menu to unlock this step.
    </Alert>
  )
})

SelectSystemPrompt.displayName = 'SelectSystemPrompt'
