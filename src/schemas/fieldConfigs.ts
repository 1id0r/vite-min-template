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

/** Validation configuration for API calls */
export interface ValidationConfig {
  /** API entity name (e.g., 'Mongok' for /eav/isexist/Mongok) */
  entityName: string
  /** Maps form field names (snake_case) to API header names */
  fieldMappings: Record<string, string>
}

export interface FormFieldsConfig {
  title?: string
  fields: FieldConfig[]
  /** Optional validation config for entity existence check */
  validation?: ValidationConfig
}

// Monitor field configurations by system ID
export const MonitorFieldConfigs: Record<string, FormFieldsConfig> = {
  mongo_k: {
    title: 'Mongo monitoring',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 12 },
    ],
    validation: {
      entityName: 'Mongok',
      fieldMappings: { cluster: 'cluster' },
    },
  },
  redis: {
    title: 'Redis',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 6 },
      { name: 'db_name', type: 'text', label: 'DB Name', labelHe: 'שם מסד נתונים', required: true, colSpan: 6 },
    ],
    validation: {
      entityName: 'Redis',
      fieldMappings: { cluster: 'cluster', db_name: 'dbName' },
    },
  },
  postgresql: {
    title: 'PostgreSQL monitoring',
    fields: [
      { name: 'host', type: 'text', label: 'Host', labelHe: 'שרת', required: true, colSpan: 12 },
    ],
    validation: {
      entityName: 'Postgresql',
      fieldMappings: { host: 'host' },
    },
  },
  elastic: {
    title: 'Elastic',
    fields: [
      { name: 'cluster', type: 'async-select', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 4 },
      { name: 'node', type: 'text', label: 'Node', labelHe: 'צומת', required: true, colSpan: 4 },
      { name: 'buckets_names', type: 'textarea', label: 'Buckets Names', labelHe: 'שמות דליים', required: false, colSpan: 4, placeholder: 'bucket1, bucket2' },
      { name: 'query_id', type: 'text', label: 'Query ID', labelHe: 'מזהה שליפה', required: true, colSpan: 4 },
    ],
    validation: {
      entityName: 'Elastic',
      fieldMappings: { cluster: 'cluster' },
    },
  },
  sql_server: {
    title: 'SQL Server monitoring',
    fields: [
      { name: 'database_name', type: 'text', label: 'Database Name', labelHe: 'שם מסד נתונים', required: true, colSpan: 6 },
      { name: 'hosts', type: 'textarea', label: 'Hosts', labelHe: 'שרתים', required: true, colSpan: 6, placeholder: 'host1, host2, host3' },
    ],
  },
  s3: {
    title: 'S3 monitoring',
    fields: [
      { name: 'account', type: 'text', label: 'Account', labelHe: 'חשבון', required: true, colSpan: 12 },
    ],
    validation: {
      entityName: 'S3',
      fieldMappings: { account: 'account' },
    },
  },
  hdfs: {
    title: 'HDFS monitoring',
    fields: [
      { name: 'path', type: 'text', label: 'Path', labelHe: 'נתיב', required: true, colSpan: 6 },
      { name: 'hierarchy', type: 'text', label: 'Hierarchy', labelHe: 'היררכיה', required: true, colSpan: 6 },
    ],
  },
  kafka: {
    title: 'Kafka monitoring',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 4 },
      { name: 'consumer_group', type: 'text', label: 'Consumer Group', labelHe: 'קבוצת צרכנים', required: true, colSpan: 4 },
      { name: 'topic', type: 'text', label: 'Topic', labelHe: 'נושא', required: true, colSpan: 4 },
    ],
    validation: {
      entityName: 'Kafka',
      fieldMappings: { cluster: 'cluster', consumer_group: 'consumerGroup', topic: 'topic' },
    },
  },
  nifi: {
    title: 'NiFi monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', labelHe: 'סביבה', required: true, colSpan: 4 },
      { name: 'componentType', type: 'text', label: 'Component Type', labelHe: 'סוג רכיב', required: true, colSpan: 4 },
      { name: 'componentId', type: 'text', label: 'Component ID', labelHe: 'מזהה רכיב', required: true, colSpan: 4 },
    ],
    validation: {
      entityName: 'Nifi',
      fieldMappings: { environment: 'environment', componentType: 'componentType', componentId: 'componentId' },
    },
  },
  pvc: {
    title: 'PVC monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', labelHe: 'סביבה', required: true, colSpan: 4 },
      { name: 'namespace', type: 'text', label: 'Namespace', labelHe: 'מרחב שמות', required: true, colSpan: 4 },
      { name: 'pvc', type: 'text', label: 'PVC', labelHe: 'PVC', required: true, colSpan: 4 },
    ],
    validation: {
      entityName: 'Pvc',
      fieldMappings: { environment: 'environment', namespace: 'namespace', pvc: 'pvc' },
    },
  },
  linux: {
    title: 'Linux VM monitoring',
    fields: [
      { name: 'server_name', type: 'text', label: 'Server Name', labelHe: 'שם שרת', required: true, colSpan: 12 },
    ],
    validation: {
      entityName: 'Linux',
      fieldMappings: { server_name: 'serverName' },
    },
  },
  windows: {
    title: 'Windows VM monitoring',
    fields: [
      { name: 'server_name', type: 'text', label: 'Server Name', labelHe: 'שם שרת', required: true, colSpan: 12 },
    ],
    validation: {
      entityName: 'Windows',
      fieldMappings: { server_name: 'serverName' },
    },
  },

  // New entity types added per user request
  openshift: {
    title: 'OpenShift',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', labelHe: 'סביבה', required: true, colSpan: 4 },
      { name: 'namespace', type: 'text', label: 'Namespace', labelHe: 'מרחב שמות', required: true, colSpan: 4 },
      { name: 'service', type: 'text', label: 'Service', labelHe: 'שירות', required: true, colSpan: 4 },
    ],
    validation: {
      entityName: 'Openshift',
      fieldMappings: { environment: 'environment', namespace: 'namespace', service: 'service' },
    },
  },
  data: {
    title: 'Data',
    fields: [
      { name: 'beak_id', type: 'text', label: 'Beak ID', labelHe: 'מזהה ביק', required: true, colSpan: 12 },
    ],
  },
  share: {
    title: 'Share',
    fields: [
      { name: 'datacenter', type: 'text', label: 'Datacenter', labelHe: 'מרכז נתונים', required: true, colSpan: 4 },
      { name: 'svm', type: 'text', label: 'SVM', labelHe: 'SVM', required: true, colSpan: 4 },
      { name: 'volume', type: 'text', label: 'Volume', labelHe: 'כרך', required: true, colSpan: 4 },
    ],
  },
  anonymous: {
    title: 'Anonymous',
    fields: [
      { name: 'anonymous_rule_id', type: 'text', label: 'Anonymous Rule ID', labelHe: 'מזהה חוק אנונימי', required: true, colSpan: 6 },
      { name: 'anonymous_rule_name', type: 'text', label: 'Anonymous Rule Name', labelHe: 'שם חוק אנונימי', required: true, colSpan: 6 },
    ],
  },
  groove: {
    title: 'Groove',
    fields: [
      { name: 'cube_name', type: 'text', label: 'Cube Name', labelHe: 'שם קוביה', required: true, colSpan: 6 },
      { name: 'timed_package_id', type: 'text', label: 'Timed Package ID', labelHe: 'מזהה חבילה מתוזמנת', required: true, colSpan: 6 },
    ],
    validation: {
      entityName: 'timedPackage',
      fieldMappings: { cube_name: 'PackageId', timed_package_id: 'timedPackageId' },
    },
  },
  url_entity: {
    title: 'URL',
    fields: [
      { name: 'node', type: 'text', label: 'Node', labelHe: 'צומת', required: true, colSpan: 4 },
      { name: 'route', type: 'text', label: 'Route', labelHe: 'נתיב', required: true, colSpan: 4 },
      { name: 'job_id', type: 'text', label: 'Job ID', labelHe: 'מזהה משימה', required: true, colSpan: 4 },
    ],
  },
}

// Default basic monitor fields (for systems not in the registry)
export const BasicMonitorFieldConfig: FormFieldsConfig = {
  title: 'Monitoring',
  fields: [],
}

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

// Helper to get monitor field config by system ID
export function getMonitorFieldConfig(systemId: string): FormFieldsConfig {
  return MonitorFieldConfigs[systemId] ?? BasicMonitorFieldConfig
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
    defaultOpen: true,
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


// ─────────────────────────────────────────────────────────────────────────────
// Rule Field Configurations
// ─────────────────────────────────────────────────────────────────────────────

export const RuleFieldConfigs: Record<string, FormFieldsConfig> = {
  generic: {
    title: 'שדות כלליים',
    fields: [
      { name: 'functionality', type: 'text', label: 'פונקציונליות', colSpan: 12 },
      { name: 'details', type: 'text', label: 'פרטים', colSpan: 12 },
      { name: 'severity', type: 'severity', label: 'חומרה', colSpan: 12 },
      { name: 'duration', type: 'number', label: 'משך זמן', colSpan: 6, suffix: 'דקות' },
    ],
  },
  dynamic: {
    title: 'שדות דינמיים',
    fields: [
      { name: 'threshold', type: 'number', label: 'סף', colSpan: 6 },
      { name: 'is_same_date', type: 'boolean', label: 'אותו תאריך', colSpan: 6 },
      { name: 'start_time', type: 'time', label: 'שעת התחלה', colSpan: 6 },
      { name: 'end_time', type: 'time', label: 'שעת סיום', colSpan: 6 },
    ],
  },
  threshold: {
    title: 'סף',
    fields: [
      { name: 'threshold', type: 'number', label: 'סף', colSpan: 12 },
    ],
  },
  volume: {
    title: 'יחידת נפח',
    fields: [
      { name: 'volume_unit', type: 'text', label: 'יחידת נפח', colSpan: 12, placeholder: 'MB, GB, etc.' },
    ],
  },
}

// Helper to get rule field config by field group name
export function getRuleFieldConfig(fieldGroupName: string): FormFieldsConfig | undefined {
  return RuleFieldConfigs[fieldGroupName]
}
