// Field configuration for dynamic form rendering
/**
 * Field Configurations - UI Layout for Forms
 * 
 * Defines how form fields should be rendered (labels, types, layout).
 * Works in tandem with formSchemas.ts (which defines validation).
 * 
 * STRUCTURE:
 * - FieldConfig: Individual field configuration
 * - FormFieldsConfig: Complete form configuration with title + fields
 * - GeneralFieldConfig: Layout for Step 2 (general form)
 * - MonitorFieldConfigs: Layouts for Step 3 (per system)
 * 
 * FIELD TYPES:
 * - 'text': Text input
 * - 'textarea': Multi-line text
 * - 'number': Number input
 * - 'boolean': Checkbox
 * - 'select': Dropdown (requires options)
 * - 'async-select': Async dropdown (requires apiEndpoint)
 * - 'links-array': Custom links array field
 * 
 * ADDING A NEW MONITOR FORM UI:
 * 1. Add to MonitorFieldConfigs object
 * 2. System ID must match the one in formSchemas.ts
 * 3. Field names must match schema properties
 * 
 * NOTE: Consider auto-generating this from schemas in the future
 */

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────
export interface FieldConfig {
  name: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'async-select' | 'links-array' | 'segmented' | 'json' | 'severity' | 'time'
  label: string
  labelHe?: string // Hebrew label for RTL display
  placeholder?: string
  required?: boolean
  colSpan?: number // For grid layout (1-12)
  disabled?: boolean
  options?: { label: string; value: string | number }[] // For select/segmented fields
  asyncOptions?: {
    path: string
    placeholder?: string
  }
  suffix?: string // Text to show after the input (e.g., "שניות")
  min?: number // For number inputs
  max?: number
}

export interface FormFieldsConfig {
  title?: string
  fields: FieldConfig[]
}

// Re-export monitor configs from dedicated file
export { MonitorFieldConfigs, BasicMonitorFieldConfig, getMonitorFieldConfig } from './monitorFieldConfigs'

// General form field configuration
export const GeneralFieldConfig: FormFieldsConfig = {
  title: 'פרטים כלליים',
  fields: [
    { name: 'displayName', type: 'text', label: 'שם תצוגה', required: true, colSpan: 6 },
    { name: 'entityType', type: 'text', label: 'סוג יישות', disabled: true, colSpan: 6 },
    { name: 'description', type: 'textarea', label: 'תיאור', required: true, colSpan: 12 },
    { name: 'links', type: 'links-array', label: 'לינקים', colSpan: 12 },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Application Configuration (merged from staticConfig.ts)
// ─────────────────────────────────────────────────────────────────────────────
import type { EntityConfig } from '../types/entity'

export const STATIC_CONFIG: EntityConfig = {
  categories: [
    { 
      id: 'databases', 
      label: 'מסדי נתונים', 
      systemIds: ['mongo_k', 'sql_server', 'redis', 'postgresql', 'elastic', 'data'] 
    },
    { 
      id: 'filesystems', 
      label: 'אחסון נתונים', 
      systemIds: ['s3', 'hdfs', 'share'] 
    },
    { 
      id: 'transport', 
      label: 'עיבוד ושינוע', 
      systemIds: ['kafka', 'nifi'] 
    },
    { 
      id: 'virtualization', 
      label: 'וירטואליזציה', 
      systemIds: ['linux', 'windows', 'pvc', 'openshift'] 
    },
    { 
      id: 'services', 
      label: 'שירותים', 
      systemIds: ['groove', 'anonymous', 'url_entity'] 
    },
  ],
  systems: {
    redis: { id: 'redis', label: 'Redis' },
    postgresql: { id: 'postgresql', label: 'PostgreSQL' },
    elastic: { id: 'elastic', label: 'Elastic' },
    hdfs: { id: 'hdfs', label: 'HDFS' },
    nifi: { id: 'nifi', label: 'NiFi' },
    s3: { id: 's3', label: 'S3' },
    kafka: { id: 'kafka', label: 'Kafka' },
    mongo_k: { id: 'mongo_k', label: 'Mongo K' },
    sql_server: { id: 'sql_server', label: 'SQL Server' },
    vm_linux: { id: 'vm_linux', label: 'Linux' },
    vm_windows: { id: 'vm_windows', label: 'Windows' },
    pvc: { id: 'pvc', label: 'PVC' },
    openshift: { id: 'openshift', label: 'OpenShift' },
    data: { id: 'data', label: 'Data' },
    share: { id: 'share', label: 'Share' },
    anonymous: { id: 'anonymous', label: 'Anonymous' },
    groove: { id: 'groove', label: 'Groove' },
    url_entity: { id: 'url_entity', label: 'URL' },
  },
}

// Re-export binding configs from dedicated file
export { 
  BindingFieldConfigs, 
  getBindingFieldConfig, 
  BINDING_DEFINITIONS,
  type BindingMetadata 
} from './bindingFieldConfigs'
