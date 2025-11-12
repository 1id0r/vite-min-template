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
    return (
      <ConfigErrorNotice message={configError} onRetry={handleConfigRetry} />
    )
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
      <SystemStep
        flow={flow}
        flowOptions={flowOptions}
        onFlowChange={handleFlowChange}
        flowDescription={flowDescription}
        categories={categories}
        systems={systems}
        selectedSystem={selectedSystem}
        selectedSystemConfig={selectedSystemConfig}
        onSystemSelect={handleSystemSelect}
        onIconAnnotate={annotateSystemIcon}
      />
    )
  }

  if (!selectedSystem) {
    return <SelectSystemPrompt />
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
