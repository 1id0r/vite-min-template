/**
 * EntityFlowContent - Main Content Container for Entity Creation Flow
 *
 * This component renders the multi-step entity creation wizard.
 * Step rendering is delegated to StepRenderer which uses the step registry.
 */

import { memo } from 'react'
import { Alert, Box, Button, Center, Divider, Group, Loader, Stack, Text } from '@mantine/core'
import { FlowStepper } from './FlowStepper'
import { ResultSummary } from './ResultSummary'
import { StepRenderer } from './StepRenderer'
import type { UseEntityFlowStateResult } from './hooks/useEntityFlowState'

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface EntityFlowContentProps {
  controller: UseEntityFlowStateResult
  onClose: () => void
}

export function EntityFlowContent({ controller, onClose }: EntityFlowContentProps) {
  const {
    configStatus,
    configError,
    config,
    handleConfigRetry,
    activeStep,
    activeStepKey,
    isCompleted,
    stepKeys,
    stepDefinitions,
    nextButtonDisabled,
    goToPreviousStep,
    handleAdvance,
    result,
    // Props passed to StepRenderer
    flow,
    flowOptions,
    handleFlowChange,
    selectedSystem,
    selectedSystemConfig,
    categories,
    systems,
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
    handleTreeSelection,
    treeSelection,
    attachments,
    handleAttachmentsChange,
  } = controller

  const isInitialLoad = configStatus === 'loading' && !config
  const hasBlockingError = configStatus === 'error' && !config

  // Loading state
  if (isInitialLoad) {
    return (
      <Center py='lg'>
        <Loader />
      </Center>
    )
  }

  // Error state
  if (hasBlockingError) {
    return <ConfigErrorNotice message={configError} onRetry={handleConfigRetry} />
  }

  // No config or steps
  if (!config || stepKeys.length === 0) {
    return null
  }

  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Fixed header with stepper */}
      <Stack gap='md' style={{ flexShrink: 0 }}>
        <FlowStepper stepKeys={stepKeys} activeStep={activeStep} definitions={stepDefinitions} />
        <Divider />
      </Stack>

      {/* Scrollable content area */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}
      >
        {!isCompleted && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 0',
            }}
          >
            <StepRenderer
              activeStepKey={activeStepKey}
              flow={flow}
              flowOptions={flowOptions}
              onFlowChange={handleFlowChange}
              categories={categories}
              systems={systems}
              selectedSystem={selectedSystem}
              selectedSystemConfig={selectedSystemConfig}
              handleSystemSelect={handleSystemSelect}
              annotateSystemIcon={annotateSystemIcon}
              handleTreeSelection={handleTreeSelection}
              formDefinitions={formDefinitions}
              formStatus={formStatus}
              formErrors={formErrors}
              currentFormState={currentFormState}
              attachFormRef={attachFormRef}
              onFormChange={onFormChange}
              onFormSubmit={onFormSubmit}
              requestFormDefinition={requestFormDefinition}
              treeSelection={treeSelection}
              attachments={attachments}
              handleAttachmentsChange={handleAttachmentsChange}
            />
          </Box>
        )}

        {isCompleted && <ResultSummary result={result} onClose={onClose} />}
      </Box>

      {/* Fixed footer with buttons */}
      {!isCompleted && (
        <Box style={{ flexShrink: 0 }}>
          <Divider />
          <Group justify='space-between' style={{ paddingTop: 16 }}>
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
        </Box>
      )}
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

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
