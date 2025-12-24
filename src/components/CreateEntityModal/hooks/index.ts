/**
 * Entity Flow Hooks
 * 
 * This module exports all hooks for managing the entity creation flow.
 * 
 * Hooks:
 * - useEntityForm   - Main unified form hook (replaces old split hooks)
 * - useEntityConfig - Configuration loading
 */

// Main form hook
export { useEntityForm, type UseEntityFormResult, type EntityFormData, type FlowId } from './useEntityForm'

// Config hook
export { useEntityConfig, type UseEntityConfigResult, type ConfigStatus } from './useEntityConfig'

