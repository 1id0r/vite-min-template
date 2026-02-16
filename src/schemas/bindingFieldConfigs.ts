/**
 * Binding Field Configurations
 * 
 * Defines form field layouts and metadata for entity bindings.
 * Bindings connect entities to external data sources (URLs, Elastic queries, etc.)
 * 
 * STRUCTURE:
 * - BindingFieldConfigs: Form field definitions for each binding type
 * - BindingMetadata: Component behavior (array names, defaults, etc.)
 * - BINDING_DEFINITIONS: Available binding types with their metadata
 */

import type { FormFieldsConfig } from './fieldConfigs'

// ─────────────────────────────────────────────────────────────────────────────
// Binding Field Configurations
// ─────────────────────────────────────────────────────────────────────────────

export const BindingFieldConfigs: Record<string, FormFieldsConfig> = {
  url: {
    title: 'URL',
    fields: [
      { name: 'url', type: 'text', label: 'URL', placeholder: 'הזן URL', required: true },
      { name: 'timeout', type: 'number', label: 'timeout', min: 0, max: 60, suffix: 'דקות' },
    ],
  },
  elastic: {
    title: 'Elastic',
    fields: [
      { name: 'cluster', type: 'async-select', label: 'Cluster', required: true, colSpan: 4 },
      { name: 'queryName', type: 'text', label: 'שם שליפה', placeholder: 'הזן שם', required: true },
      { 
        name: 'scheduleInterval', 
        type: 'number', 
        label: 'תזמון שליפה', 
        min: 1 
      },
      { 
        name: 'scheduleUnit', 
        type: 'segmented', 
        label: '', 
        options: [
          { label: 'דקות', value: 'minutes' },
          { label: 'שעות', value: 'hours' },
        ] 
      },
      { 
        name: 'timeout', 
        type: 'segmented', 
        label: 'זמן המתנה', 
        options: [
          { label: '5', value: 5 },
          { label: '15', value: 15 },
          { label: '20', value: 20 },
        ],
        suffix: 'שניות'
      },
      { name: 'jsonQuery', type: 'json', label: 'JSON Query', placeholder: '{"query": {...}}' },
    ],
  },
}

// Helper to get binding field config
export function getBindingFieldConfig(bindingType: string): FormFieldsConfig | undefined {
  return BindingFieldConfigs[bindingType]
}

// ─────────────────────────────────────────────────────────────────────────────
// Binding Metadata Configuration (for BindingSection component)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata for binding types - defines component behavior
 * Separate from BindingFieldConfigs (which defines what fields to render)
 */
export interface BindingMetadata {
  type: string
  title: string
  fieldArrayName: string
  defaultValues: Record<string, any>
  defaultOpen?: boolean
}

export const BINDING_DEFINITIONS: BindingMetadata[] = [
  {
    type: 'url',
    title: 'URL',
    fieldArrayName: 'urls',
    defaultValues: { url: '', timeout: 1 },
  },
  {
    type: 'elastic',
    title: 'Elastic',
    fieldArrayName: 'elastic',
    defaultValues: {
      cluster: '',
      queryName: '',
      scheduleInterval: 5,
      scheduleUnit: 'minutes',
      timeout: 5,
      jsonQuery: '',
    },
  },
]
