/**
 * Entity Form Types
 * 
 * Type definitions for the entity creation form.
 * Separated from the hook for cleaner imports.
 */

import type { Attachment, CategoryDefinition, SystemDefinition } from '../../../types/entity'
import type { TreeSelection } from '../../../types/tree'

export type FlowId = 'monitor' | 'display'

/** Form data structure for entity creation */
export interface EntityFormData {
  flow: FlowId
  systemId: string
  displayName: string
  entityType: string
  description: string
  contactInfo?: string
  responsibleParty?: string
  links?: { label?: string; url?: string }[]
  icon?: string
  monitor?: Record<string, unknown>
  measurements?: TreeSelection[]
  attachments?: Attachment[]
}

export interface UseEntityFormResult {
  // Form instance - typed as any to handle dynamic schema
  form: any
  
  // Watched values for conditional rendering
  flow: FlowId
  systemId: string | null
  categoryId: string | null
  
  // Config data
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystemConfig: SystemDefinition | null
  
  // Visibility flags
  showSystemSelector: boolean
  showGeneralSection: boolean
  showIconMenu: boolean
  showMonitorSection: boolean
  showBindingsPanel: boolean
  
  // Handlers
  handleFlowChange: (newFlow: FlowId) => void
  handleCategoryChange: (categoryId: string | null) => void
  handleSystemSelect: (systemId: string | null) => void
  handleMeasurementsChange: (measurements: TreeSelection[]) => void
  handleAttachmentsChange: (attachments: Attachment[]) => void
  handleIconSelect: (systemId: string, iconName?: string) => void
  handleSave: () => void
  resetForm: () => void
}
