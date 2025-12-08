/**
 * StepRenderer - Dynamic Step Component Renderer
 *
 * Uses the step registry to render the appropriate component for each step.
 * This eliminates the need for if/else chains when adding new steps.
 */

import { memo, useCallback, useMemo } from 'react'
import { Alert, Box, Stack, Text } from '@mantine/core'
import type { IChangeEvent } from '@rjsf/core'
import type { CategoryDefinition, FormDefinition, StepKey, SystemDefinition } from '../../types/entity'
import type { TreeSelectionList } from '../../types/tree'
import type { FlowId, FlowOption, FormStatus } from './types'
import type { RjsfFormRef } from './FormStepCard'
import { FormStepCard } from './FormStepCard'
import { SystemStep } from './SystemStep'
import { TreeStep } from './TreeStep'
import { DisplayIconMenu } from './DisplayIconMenu'
import { STEP_REGISTRY } from './stepRegistry'
import { DISPLAY_FLOW_ID, DISPLAY_FLOW_SYSTEM_IDS, fallbackSystemIcon } from './iconRegistry'
import { FlowSelector } from './FlowSelector'

// ─────────────────────────────────────────────────────────────────────────────
// Props Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface StepRendererProps {
  activeStepKey: StepKey | null
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  handleSystemSelect: (systemId: string) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void
  handleTreeSelection: (systemId: string, selection: TreeSelectionList) => void
  formDefinitions: Record<string, Partial<Record<StepKey, FormDefinition>>>
  formStatus: Record<string, Partial<Record<StepKey, FormStatus>>>
  formErrors: Record<string, Partial<Record<StepKey, string>>>
  currentFormState: Record<StepKey, unknown>
  attachFormRef: (key: StepKey, ref: RjsfFormRef | null) => void
  onFormChange: (systemId: string, key: StepKey, change: IChangeEvent) => void
  onFormSubmit: (key: StepKey, change: IChangeEvent) => void
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
  treeSelection: TreeSelectionList
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Renderer Component
// ─────────────────────────────────────────────────────────────────────────────

export const StepRenderer = memo(function StepRenderer(props: StepRendererProps) {
  const {
    activeStepKey,
    flow,
    flowOptions,
    onFlowChange,
    flowDescription,
    categories,
    systems,
    selectedSystem,
    selectedSystemConfig,
    handleSystemSelect,
    annotateSystemIcon,
    handleTreeSelection,
    formDefinitions,
    formStatus,
    formErrors,
    currentFormState,
    attachFormRef,
    onFormChange,
    onFormSubmit,
    requestFormDefinition,
    treeSelection,
  } = props

  // Early return if no active step
  if (!activeStepKey) {
    return null
  }

  // Get step configuration from registry
  const stepConfig = STEP_REGISTRY[activeStepKey]
  if (!stepConfig) {
    return (
      <Alert color='red' title='Unknown Step'>
        Step "{activeStepKey}" is not registered.
      </Alert>
    )
  }

  // Check if system selection is required but not done
  if (stepConfig.requiresSystem && !selectedSystem) {
    return <SelectSystemPrompt />
  }

  // Render based on step type
  switch (stepConfig.type) {
    case 'system':
      return (
        <SystemStepRenderer
          flow={flow}
          flowOptions={flowOptions}
          onFlowChange={onFlowChange}
          flowDescription={flowDescription}
          categories={categories}
          systems={systems}
          selectedSystem={selectedSystem}
          selectedSystemConfig={selectedSystemConfig}
          handleSystemSelect={handleSystemSelect}
          annotateSystemIcon={annotateSystemIcon}
        />
      )

    case 'tree':
      return (
        <TreeStep
          selection={treeSelection}
          onSelectionChange={(value) => handleTreeSelection(selectedSystem!, value)}
        />
      )

    case 'form':
      return (
        <FormStepRenderer
          activeStepKey={activeStepKey}
          flow={flow}
          selectedSystem={selectedSystem!}
          systems={systems}
          formDefinitions={formDefinitions}
          formStatus={formStatus}
          formErrors={formErrors}
          currentFormState={currentFormState}
          attachFormRef={attachFormRef}
          onFormChange={onFormChange}
          onFormSubmit={onFormSubmit}
          requestFormDefinition={requestFormDefinition}
          annotateSystemIcon={annotateSystemIcon}
        />
      )

    default:
      return (
        <Alert color='yellow' title='Step Type Not Implemented'>
          Step type "{stepConfig.type}" is not yet implemented.
        </Alert>
      )
  }
})

StepRenderer.displayName = 'StepRenderer'

// ─────────────────────────────────────────────────────────────────────────────
// System Step Renderer
// ─────────────────────────────────────────────────────────────────────────────

interface SystemStepRendererProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  handleSystemSelect: (systemId: string) => void
  annotateSystemIcon: (systemId: string, iconName?: string) => void
}

const SystemStepRenderer = memo(function SystemStepRenderer(props: SystemStepRendererProps) {
  const {
    flow,
    flowOptions,
    onFlowChange,
    flowDescription,
    categories,
    systems,
    selectedSystem,
    selectedSystemConfig,
    handleSystemSelect,
    annotateSystemIcon,
  } = props

  const showFlowSelector = flowOptions.length > 1
  const showEntityTypeLabel = flow !== DISPLAY_FLOW_ID

  return (
    <Stack gap='lg'>
      {showFlowSelector && (
        <Stack gap={6}>
          <Box dir='rtl'>
            <Text size='sm' fw={700} c='gray.8'>
              בחירת יישות{' '}
              <Text component='span' c='red.6'>
                *
              </Text>
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
            סוג יישות{' '}
            <Text component='span' c='red.6'>
              *
            </Text>
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
})

SystemStepRenderer.displayName = 'SystemStepRenderer'

// ─────────────────────────────────────────────────────────────────────────────
// Form Step Renderer
// ─────────────────────────────────────────────────────────────────────────────

interface FormStepRendererProps {
  activeStepKey: StepKey
  flow: FlowId
  selectedSystem: string
  systems: Record<string, SystemDefinition>
  formDefinitions: Record<string, Partial<Record<StepKey, FormDefinition>>>
  formStatus: Record<string, Partial<Record<StepKey, FormStatus>>>
  formErrors: Record<string, Partial<Record<StepKey, string>>>
  currentFormState: Record<StepKey, unknown>
  attachFormRef: (key: StepKey, ref: RjsfFormRef | null) => void
  onFormChange: (systemId: string, key: StepKey, change: IChangeEvent) => void
  onFormSubmit: (key: StepKey, change: IChangeEvent) => void
  requestFormDefinition: (systemId: string, stepKey: StepKey) => Promise<FormDefinition>
  annotateSystemIcon: (systemId: string, iconName?: string) => void
}

const FormStepRenderer = memo(function FormStepRenderer(props: FormStepRendererProps) {
  const {
    activeStepKey,
    flow,
    selectedSystem,
    systems,
    formDefinitions,
    formStatus,
    formErrors,
    currentFormState,
    attachFormRef,
    onFormChange,
    onFormSubmit,
    requestFormDefinition,
    annotateSystemIcon,
  } = props

  // Check if we should show the icon picker (for general step in monitor flow with general system)
  const shouldShowGeneralIcons = useMemo(
    () => flow === 'monitor' && selectedSystem === 'general' && activeStepKey === 'general',
    [flow, selectedSystem, activeStepKey]
  )

  const selectedDisplayIconId = useMemo(() => {
    if (!shouldShowGeneralIcons) return null
    const systemState = currentFormState.system
    if (typeof systemState !== 'object' || !systemState) return null
    const currentIconName = (systemState as Record<string, unknown>).icon
    if (typeof currentIconName !== 'string') return null
    return DISPLAY_FLOW_SYSTEM_IDS.find((id) => systems[id]?.icon === currentIconName) ?? null
  }, [currentFormState, shouldShowGeneralIcons, systems])

  const handleGeneralIconSelect = useCallback(
    (iconSystemId: string, iconName?: string) => {
      annotateSystemIcon(selectedSystem, iconName ?? systems[iconSystemId]?.icon)
    },
    [annotateSystemIcon, selectedSystem, systems]
  )

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

FormStepRenderer.displayName = 'FormStepRenderer'

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

const SelectSystemPrompt = memo(function SelectSystemPrompt() {
  return (
    <Alert color='blue' title='Select a system'>
      Choose one of the templates from the menu to unlock this step.
    </Alert>
  )
})

SelectSystemPrompt.displayName = 'SelectSystemPrompt'
