/**
 * Entity Flow Hooks
 * 
 * This module exports all hooks for managing the entity creation flow.
 * 
 * Main Hook:
 * - useEntityFlowState - Composes all sub-hooks into a single controller
 * 
 * Sub-Hooks (can be used independently if needed):
 * - useEntityConfig    - Configuration loading
 * - useFlowNavigation  - Flow and step navigation
 * - useSystemSelection - System/template selection
 * - useFormManager     - Form state management
 */

// Main composed hook
export { useEntityFlowState, type UseEntityFlowStateResult } from './useEntityFlowState'

// Sub-hooks (for advanced usage or testing)
export { useEntityConfig, type UseEntityConfigResult, type ConfigStatus } from './useEntityConfig'
export { useFlowNavigation, type UseFlowNavigationResult } from './useFlowNavigation'
export { useSystemSelection, type UseSystemSelectionResult } from './useSystemSelection'
export { useFormManager, type UseFormManagerResult } from './useFormManager'
