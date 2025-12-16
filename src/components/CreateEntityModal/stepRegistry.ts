/**
 * Step Registry - Centralized Step Configuration
 * 
 * This registry defines all available steps in the entity creation flow.
 * To add a new step:
 * 1. Add a new entry to STEP_REGISTRY
 * 2. Create the step component
 * 3. Add the step key to the flow configuration in the backend
 * 
 * That's it! No need to modify StepContent or other components.
 */

import type { ComponentType } from 'react'
import type { StepKey, FormDefinition, CategoryDefinition, SystemDefinition } from '../../types/entity'
import type { TreeSelectionList } from '../../types/tree'
import type { FlowId, FlowOption, FormStatus } from './types'
import type { FormStepRef } from './FormStepCard'

// ─────────────────────────────────────────────────────────────────────────────
// Step Props Interfaces
// ─────────────────────────────────────────────────────────────────────────────

/** Common props passed to all step components */
export interface BaseStepProps {
  stepKey: StepKey
  selectedSystem: string | null
}

/** Props for the system selection step */
export interface SystemStepProps extends BaseStepProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystemConfig: SystemDefinition | null
  onSystemSelect: (systemId: string) => void
  onIconAnnotate: (systemId: string, iconName?: string) => void
}

/** Props for form-based steps (general, monitor, etc.) */
export interface FormStepProps extends BaseStepProps {
  definition?: FormDefinition
  status?: FormStatus
  error?: string
  formData: unknown
  attachRef: (ref: FormStepRef | null) => void
  onChange: (data: unknown) => void
  onRetry: () => void
}

/** Props for the tree selection step */
export interface TreeStepProps extends BaseStepProps {
  selection: TreeSelectionList
  onSelectionChange: (selection: TreeSelectionList) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Configuration
// ─────────────────────────────────────────────────────────────────────────────

export type StepType = 'system' | 'form' | 'tree' | 'custom'

export interface StepConfig {
  /** Unique step identifier */
  key: StepKey
  /** Type of step - determines which props are passed */
  type: StepType
  /** Whether the step requires a system to be selected first */
  requiresSystem: boolean
  /** Whether the step needs to fetch a form definition from the API */
  requiresFormFetch: boolean
  /** Optional custom component (for 'custom' type steps) */
  component?: ComponentType<BaseStepProps>
}

/**
 * STEP_REGISTRY - Central configuration for all steps
 * 
 * To add a new step:
 * 1. Add an entry here with the step key and configuration
 * 2. If it's a form step, the FormStepCard will handle it automatically
 * 3. If it's a custom step, provide a component
 */
export const STEP_REGISTRY: Record<StepKey, StepConfig> = {
  system: {
    key: 'system',
    type: 'system',
    requiresSystem: false,
    requiresFormFetch: false,
  },
  general: {
    key: 'general',
    type: 'form',
    requiresSystem: true,
    requiresFormFetch: true,
  },
  monitor: {
    key: 'monitor',
    type: 'form',
    requiresSystem: true,
    requiresFormFetch: true,
  },
  tree: {
    key: 'tree',
    type: 'tree',
    requiresSystem: true,
    requiresFormFetch: false,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Get step configuration by key */
export function getStepConfig(stepKey: StepKey): StepConfig | undefined {
  return STEP_REGISTRY[stepKey]
}

/** Check if a step requires system selection */
export function stepRequiresSystem(stepKey: StepKey): boolean {
  return STEP_REGISTRY[stepKey]?.requiresSystem ?? true
}

/** Check if a step needs form definition fetch */
export function stepRequiresFormFetch(stepKey: StepKey): boolean {
  return STEP_REGISTRY[stepKey]?.requiresFormFetch ?? false
}

/** Get all form-type steps */
export function getFormSteps(): StepKey[] {
  return Object.values(STEP_REGISTRY)
    .filter((config) => config.type === 'form')
    .map((config) => config.key)
}

/**
 * Check if a step should skip form fetching
 * Used in useFormManager to determine when to skip API calls
 */
export function shouldSkipFormFetch(stepKey: StepKey | null): boolean {
  if (!stepKey) return true
  const config = STEP_REGISTRY[stepKey]
  return !config?.requiresFormFetch
}
