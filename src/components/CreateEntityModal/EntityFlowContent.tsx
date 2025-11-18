import { Alert, Box, Button, Center, Divider, Group, Loader, Stack, Text } from '@mantine/core'
import type { IChangeEvent } from '@rjsf/core'
import type {
  CategoryDefinition,
  EntityConfig,
  FormDefinition,
  StepDefinition,
  StepKey,
  SystemDefinition,
} from '../../types/entity'
import { FlowStepper } from './FlowStepper'
import { FormStepCard, type RjsfFormRef } from './FormStepCard'
import { ResultSummary } from './ResultSummary'
import { SystemStep } from './SystemStep'
import { DisplayIconMenu } from './DisplayIconMenu'
import { DISPLAY_FLOW_ID, DISPLAY_FLOW_SYSTEM_IDS, fallbackSystemIcon } from './iconRegistry'
import type { AggregatedResult, FlowId, FlowOption, FormStatus } from './types'

interface EntityFlowContentProps {
  configStatus: 'idle' | 'loading' | 'error' | 'success'
  configError: string | null
  config: EntityConfig | null
  handleConfigRetry: () => void
  flow: FlowId
  flowOptions: FlowOption[]
  handleFlowChange: (value: string) => void
  activeStep: number
  activeStepKey: StepKey | null
  isCompleted: boolean
  stepKeys: StepKey[]
  stepDefinitions?: Record<StepKey, StepDefinition>
  flowDescription?: string
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  nextButtonDisabled: boolean
  goToPreviousStep: () => void
  handleAdvance: () => void
  result: AggregatedResult | null
  onClose: () => void
  formDefinitions: Record<string, Partial<Record<StepKey, FormDefinition>>>
  formStatus: Record<string, Partial<Record<StepKey, FormStatus>>>
  formErrors: Record<string, Partial<Record<StepKey, string>>>
  currentFormState: Record<StepKey, unknown>
  attachFormRef: (key: StepKey, ref: RjsfFormRef | null) => void
  onFormChange: (systemId: string, key: StepKey, change: IChangeEvent) => void
  onFormSubmit: (key: StepKey, change: IChangeEvent) => void
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
  handleSystemSelect: (systemId: string) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void
}

export function EntityFlowContent({
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
  categories,
  systems,
  nextButtonDisabled,
  goToPreviousStep,
  handleAdvance,
  result,
  onClose,
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
}: EntityFlowContentProps) {
  if (configStatus === 'loading' && !config) {
    return (
      <Center py='lg'>
        <Loader />
      </Center>
    )
  }

  if (configStatus === 'error' && !config) {
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
            handleFlowChange={handleFlowChange}
            flowDescription={flowDescription}
            categories={categories}
            systems={systems}
            selectedSystem={selectedSystem}
            selectedSystemConfig={selectedSystemConfig}
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
  handleFlowChange: (value: string) => void
  flowDescription?: string
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
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

function StepContent({
  activeStepKey,
  flow,
  flowOptions,
  handleFlowChange,
  flowDescription,
  categories,
  systems,
  selectedSystem,
  selectedSystemConfig,
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
  if (!activeStepKey) {
    return null
  }

  if (activeStepKey === 'system') {
    return (
      <Stack gap='lg'>
        {flowOptions.length > 1 && (
          <Stack gap={6}>
            <Box dir='rtl'>
              <Text size='sm' fw={700} c='gray.8'>
                בחירת יישות <Text component='span' c='red.6'>*</Text>
              </Text>
            </Box>
            <FlowSelector
              flow={flow}
              flowOptions={flowOptions}
              onFlowChange={handleFlowChange}
              flowDescription={flowDescription}
            />
          </Stack>
        )}
        {flow !== DISPLAY_FLOW_ID && (
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

  const shouldShowGeneralIcons = flow === 'monitor' && selectedSystem === 'general' && activeStepKey === 'general'

  if (shouldShowGeneralIcons) {
    const currentIconName =
      typeof currentFormState.system === 'object' && currentFormState.system !== null
        ? (currentFormState.system as Record<string, unknown>).icon
        : undefined
    const selectedDisplayIconId = DISPLAY_FLOW_SYSTEM_IDS.find(
      (id) => systems[id]?.icon && systems[id]?.icon === currentIconName
    )

    return (
      <Stack gap='md'>
        {formCard}
        <DisplayIconMenu
          systems={systems}
          allowedSystemIds={DISPLAY_FLOW_SYSTEM_IDS}
          selectedSystem={selectedDisplayIconId ?? null}
          selectedIconId={selectedDisplayIconId ?? null}
          onSystemSelect={() => {}}
          onIconSelect={(iconSystemId, iconName) => {
            if (!selectedSystem) {
              return
            }
            annotateSystemIcon(selectedSystem, iconName ?? systems[iconSystemId]?.icon)
          }}
          fallbackSystemIcon={fallbackSystemIcon}
        />
      </Stack>
    )
  }

  return formCard
}

interface FlowSelectorProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
}

function FlowSelector({ flow, flowOptions, onFlowChange, flowDescription }: FlowSelectorProps) {
  // Match label to the actual flow value (no visual inversion)
  const labelTranslations: Record<string, string> = {
    monitor: 'יישות מנוטרת',
    display: 'יישות תצוגה',
  }

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
          return (
            <button
              key={option.value}
              type='button'
              onClick={() => onFlowChange(option.value)}
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
              {labelTranslations[option.value] ?? option.label}
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
}

interface ConfigErrorNoticeProps {
  message: string | null
  onRetry: () => void
}

function ConfigErrorNotice({ message, onRetry }: ConfigErrorNoticeProps) {
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
}

function SelectSystemPrompt() {
  return (
    <Alert color='blue' title='Select a system'>
      Choose one of the templates from the menu to unlock this step.
    </Alert>
  )
}
