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
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'async-select' | 'links-array'
  label: string
  placeholder?: string
  required?: boolean
  colSpan?: number // For grid layout (1-12)
  disabled?: boolean
  options?: { label: string; value: string }[] // For select fields
  asyncOptions?: {
    path: string
    placeholder?: string
  }
}

export interface FormFieldsConfig {
  title?: string
  fields: FieldConfig[]
}

// Monitor field configurations by system ID
export const MonitorFieldConfigs: Record<string, FormFieldsConfig> = {
  oracle_db: {
    title: 'Oracle monitoring',
    fields: [
      { name: 'dc', type: 'text', label: 'DC', placeholder: 'dc-01', required: true, colSpan: 4 },
      { name: 'host', type: 'text', label: 'Host', required: true, colSpan: 4 },
      { name: 'database', type: 'text', label: 'Database', required: true, colSpan: 4 },
    ],
  },
  mongo_k: {
    title: 'Mongo monitoring',
    fields: [
      { name: 'dc', type: 'text', label: 'DC', placeholder: 'dc-01', required: true, colSpan: 4 },
      { name: 'host', type: 'text', label: 'Host', required: true, colSpan: 4 },
      { name: 'database', type: 'text', label: 'Database', required: true, colSpan: 4 },
    ],
  },
  redis: {
    title: 'Redis',
    fields: [
      { name: 'dc', type: 'text', label: 'DC', placeholder: 'dc-01', required: true, colSpan: 6 },
      { name: 'environment', type: 'text', label: 'Environment', required: true, colSpan: 6 },
      { name: 'database', type: 'text', label: 'Database', required: true, colSpan: 6 },
      { name: 'instance', type: 'text', label: 'Instance', required: true, colSpan: 6 },
    ],
  },
  postgresql: {
    title: 'PostgreSQL monitoring',
    fields: [
      { name: 'dc', type: 'text', label: 'DC', placeholder: 'dc-01', required: true, colSpan: 4 },
      { name: 'host', type: 'text', label: 'Host', required: true, colSpan: 4 },
      { name: 'database', type: 'text', label: 'Database', required: true, colSpan: 4 },
    ],
  },
  eck: {
    title: 'ECK monitoring',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', required: true, colSpan: 6 },
      { name: 'index', type: 'text', label: 'Index', required: true, colSpan: 6 },
    ],
  },
  sql_server: {
    title: 'SQL monitoring',
    fields: [
      { name: 'dc', type: 'text', label: 'DC', placeholder: 'dc-01', required: true, colSpan: 4 },
      { name: 'host', type: 'text', label: 'Host', required: true, colSpan: 4 },
      { name: 'database', type: 'text', label: 'Database', required: true, colSpan: 4 },
    ],
  },
  s3_db: {
    title: 'S3 monitoring',
    fields: [
      { name: 'dc', type: 'text', label: 'DC', placeholder: 'dc-01', required: true, colSpan: 6 },
      { name: 'name', type: 'text', label: 'Name', required: true, colSpan: 6 },
    ],
  },
  hdfs: {
    title: 'HDFS monitoring',
    fields: [
      { name: 'network', type: 'text', label: 'Network', required: true, colSpan: 4 },
      { name: 'dc', type: 'text', label: 'DC', required: true, colSpan: 4 },
      { name: 'url', type: 'text', label: 'URL', required: true, colSpan: 4 },
    ],
  },
  hadoop_hdfs: {
    title: 'HDFS monitoring',
    fields: [
      { name: 'network', type: 'text', label: 'Network', required: true, colSpan: 4 },
      { name: 'dc', type: 'text', label: 'DC', required: true, colSpan: 4 },
      { name: 'url', type: 'text', label: 'URL', required: true, colSpan: 4 },
    ],
  },
  nfs: {
    title: 'NFS monitoring',
    fields: [
      { name: 'network', type: 'text', label: 'Network', required: true, colSpan: 4 },
      { name: 'dc', type: 'text', label: 'DC', required: true, colSpan: 4 },
      { name: 'route', type: 'text', label: 'Route', required: true, colSpan: 4 },
    ],
  },
  cifs: {
    title: 'CIFS monitoring',
    fields: [
      { name: 'network', type: 'text', label: 'Network', required: true, colSpan: 4 },
      { name: 'dc', type: 'text', label: 'DC', required: true, colSpan: 4 },
      { name: 'route', type: 'text', label: 'Route', required: true, colSpan: 4 },
    ],
  },
  kafka: {
    title: 'Kafka monitoring',
    fields: [
      { 
        name: 'cluster', 
        type: 'async-select', 
        label: 'Cluster', 
        required: true, 
        colSpan: 12,
        asyncOptions: { path: '/owning-teams', placeholder: 'Select cluster' }
      },
      { name: 'topic', type: 'text', label: 'Topic', required: true, colSpan: 6 },
      { name: 'consumer', type: 'text', label: 'Consumer', required: true, colSpan: 6 },
    ],
  },
  rabbitmq: {
    title: 'RabbitMQ monitoring',
    fields: [
      { name: 'network', type: 'text', label: 'Network', required: true, colSpan: 4 },
      { name: 'dc', type: 'text', label: 'DC', required: true, colSpan: 4 },
      { name: 'queue', type: 'text', label: 'שם תור', required: true, colSpan: 4 },
    ],
  },
  spark_ocp4: {
    title: 'Spark monitoring',
    fields: [
      { name: 'namespace', type: 'text', label: 'Namespace', required: true, colSpan: 6 },
      { name: 'applicationName', type: 'text', label: 'Application name', required: true, colSpan: 6 },
    ],
  },
  airflow: {
    title: 'Airflow monitoring',
    fields: [
      { name: 'network', type: 'text', label: 'Network', required: true, colSpan: 6 },
      { name: 'dc', type: 'text', label: 'DC', required: true, colSpan: 6 },
      { name: 'dag', type: 'text', label: 'DAG', required: true, colSpan: 6 },
      { name: 'task', type: 'text', label: 'Task', required: true, colSpan: 6 },
      { name: 'isSparkDag', type: 'boolean', label: "Is Spark's DAG", colSpan: 6 },
    ],
  },
  nifi: {
    title: 'NiFi monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', required: true, colSpan: 4 },
      { name: 'componentType', type: 'text', label: 'Component type', required: true, colSpan: 4 },
      { name: 'componentId', type: 'text', label: 'Component ID', required: true, colSpan: 4 },
    ],
  },
  ibm_mq: {
    title: 'IBM MQ monitoring',
    fields: [
      { name: 'queueManagers', type: 'text', label: 'Queue manager(s)', required: true, colSpan: 6 },
      { name: 'queueName', type: 'text', label: 'Queue name', required: true, colSpan: 6 },
    ],
  },
  os: {
    title: 'OS monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', required: true, colSpan: 6 },
      { name: 'namespace', type: 'text', label: 'Namespace', required: true, colSpan: 6 },
      { name: 'workland', type: 'text', label: 'Workland', required: true, colSpan: 6 },
      { name: 'type', type: 'text', label: 'Type', required: true, colSpan: 6 },
    ],
  },
  pvc: {
    title: 'PVC monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', required: true, colSpan: 4 },
      { name: 'namespace', type: 'text', label: 'Namespace', required: true, colSpan: 4 },
      { name: 'pvc', type: 'text', label: 'PVC', required: true, colSpan: 4 },
    ],
  },
  dns: {
    title: 'DNS monitoring',
    fields: [
      { name: 'dns', type: 'text', label: 'DNS', required: true, colSpan: 6 },
    ],
  },
  chevila: {
    title: 'Package monitoring',
    fields: [
      { name: 'entityName', type: 'text', label: 'שם יישות', required: true, colSpan: 6 },
      { name: 'identifier', type: 'text', label: 'מזהה', required: true, colSpan: 6 },
    ],
  },
  ribua: {
    title: 'ריבוע ניטור',
    fields: [
      { name: 'name', type: 'text', label: 'שם', required: true, colSpan: 6 },
      { name: 'identifier', type: 'text', label: 'מזהה', required: true, colSpan: 6 },
    ],
  },
  vm_linux: {
    title: 'Linux VM monitoring',
    fields: [
      { name: 'dns', type: 'text', label: 'DNS', required: true, colSpan: 6 },
    ],
  },
  vm_windows: {
    title: 'Windows VM monitoring',
    fields: [
      { name: 'dns', type: 'text', label: 'DNS', required: true, colSpan: 6 },
    ],
  },
  ocp4: {
    title: 'Cluster monitoring',
    fields: [
      { name: 'alertChannel', type: 'text', label: 'Alert channel', colSpan: 6 },
      { name: 'enableClusterLogging', type: 'boolean', label: 'Enable cluster logging', colSpan: 6 },
    ],
  },
}

// Default basic monitor fields (for systems not in the registry)
export const BasicMonitorFieldConfig: FormFieldsConfig = {
  title: 'Monitoring',
  fields: [
    { name: 'identifier', type: 'text', label: 'Identifier', required: true, colSpan: 6 },
    { name: 'region', type: 'text', label: 'Region', required: true, colSpan: 6 },
    { name: 'capacity', type: 'number', label: 'Capacity', colSpan: 6 },
    { name: 'alertChannel', type: 'text', label: 'Alert channel', colSpan: 6 },
    { name: 'enableTelemetry', type: 'boolean', label: 'Enable telemetry', colSpan: 6 },
  ],
}

// General form field configuration
export const GeneralFieldConfig: FormFieldsConfig = {
  title: 'פרטים כלליים',
  fields: [
    { name: 'displayName', type: 'text', label: 'שם תצוגה', required: true, colSpan: 6 },
    { name: 'entityType', type: 'text', label: 'סוג יישות', disabled: true, colSpan: 6 },
    { name: 'description', type: 'textarea', label: 'תיאור', required: true, colSpan: 12 },
    { name: 'contactInfo', type: 'text', label: 'פרטי התקשרות', colSpan: 6 },
    { name: 'responsibleParty', type: 'text', label: 'גורם אחראי', colSpan: 6 },
    { name: 'links', type: 'links-array', label: '', colSpan: 12 },
  ],
}

// Helper to get monitor field config by system ID
export function getMonitorFieldConfig(systemId: string): FormFieldsConfig {
  return MonitorFieldConfigs[systemId] ?? BasicMonitorFieldConfig
}
