import type { IconType } from 'react-icons'
import type { CategoryDefinition, SystemDefinition } from '../../types/entity'

export type FlowId = string

export type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export interface FlowOption {
  label: string
  value: string
}

export type IconResolver = (name?: string) => IconType | undefined

export interface AggregatedResult {
  flow: FlowId
  systemId: string
  formData: Record<string, unknown>
}

export interface SystemSelectionPanelProps {
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  flowOptions: FlowOption[]
  activeFlow: FlowId
  onFlowChange: (value: string) => void
  flowDescription?: string
  onSystemSelect: (systemId: string) => void
  resolveIcon: IconResolver
  fallbackCategoryIcon: IconType
  fallbackSystemIcon: IconType
  prefixIcon: IconType
}
