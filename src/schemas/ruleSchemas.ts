import { z } from 'zod'

/**
 * Rule Schemas - Future Rules Feature
 * 
 * This file defines reusable field groups and rule schemas for entity rules.
 * Rules appear as expandable tabs in the UI, each containing configurable fields.
 * 
 * STRUCTURE:
 * - Global Field Schemas: Reusable field groups (generic, dynamic)
 * - Rule-Specific Field Schemas: Extra fields for specific rules
 * - Entity Rule Registry: Maps entity -> rule -> field composition
 * 
 * ADDING A NEW RULE:
 * 1. Add rule name to the appropriate entity in EntityRuleRegistry
 * 2. Specify which field groups it uses: ['generic', 'dynamic']
 * 3. If it has extra fields, add them to RuleSpecificFields
 */

// ─────────────────────────────────────────────────────────────────────────────
// Global Field Schemas - Reusable across all rules
// ─────────────────────────────────────────────────────────────────────────────

/** Severity levels for rules */
export const SeverityEnum = z.enum(['critical', 'major', 'info'])
export type Severity = z.infer<typeof SeverityEnum>

/**
 * Generic Fields - Common metadata fields for most rules
 * Used in almost every rule configuration
 */
export const GenericRuleFieldsSchema = z.object({
  functionality: z.string().optional(),
  details: z.string().optional(),
  severity: SeverityEnum.optional(),
  duration: z.number().optional(), // in minutes
})

export type GenericRuleFields = z.infer<typeof GenericRuleFieldsSchema>

/**
 * Dynamic Fields - Time-based configuration fields
 * Controls when and how the rule is evaluated
 */
export const DynamicRuleFieldsSchema = z.object({
  threshold: z.number().optional(),
  start_time: z.string().optional(), // HH:mm format
  end_time: z.string().optional(),   // HH:mm format
  is_same_date: z.boolean().optional(),
})

export type DynamicRuleFields = z.infer<typeof DynamicRuleFieldsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Rule-Specific Field Schemas - Extra fields for specific rules
// ─────────────────────────────────────────────────────────────────────────────

/** Linux service rule - requires service name */
export const ServiceRuleFieldsSchema = z.object({
  service_name: z.string().optional(),
})

export type ServiceRuleFields = z.infer<typeof ServiceRuleFieldsSchema>

/**
 * MongoK Fields - Combined generic + threshold (no time fields)
 * Used for MongoDB on Kubernetes rules
 */
export const MongoKRuleFieldsSchema = z.object({
  functionality: z.string().optional(),
  details: z.string().optional(),
  threshold: z.number().optional(),
  severity: SeverityEnum.optional(),
  duration: z.number().optional(), // in minutes
})

export type MongoKRuleFields = z.infer<typeof MongoKRuleFieldsSchema>

/**
 * Volume Fields - Extra field for NiFi volume-based rules
 */
export const VolumeRuleFieldsSchema = z.object({
  volume_unit: z.string().optional(), // e.g., 'MB', 'GB', etc.
})

export type VolumeRuleFields = z.infer<typeof VolumeRuleFieldsSchema>

/**
 * Elastic Threshold Fields - Simplified dynamic fields (threshold only)
 * Used for Elasticsearch query rules
 */
export const ElasticThresholdFieldsSchema = z.object({
  threshold: z.number().optional(),
})

export type ElasticThresholdFields = z.infer<typeof ElasticThresholdFieldsSchema>

/**
 * Buckets Field - Extra field for ES aggregation queries
 */
export const BucketsFieldSchema = z.object({
  buckets: z.number().optional(),
})

export type BucketsField = z.infer<typeof BucketsFieldSchema>

/**
 * Pods Threshold Fields - For OpenShift pod-level monitoring
 * Rules that monitor pods have both pods_threshold and threshold
 */
export const PodsThresholdFieldsSchema = z.object({
  pods_threshold: z.number().optional(),
  threshold: z.number().optional(),
})

export type PodsThresholdFields = z.infer<typeof PodsThresholdFieldsSchema>

/**
 * Time Unit Threshold Fields - For rules that need threshold with time unit
 * Used for delay, latency rules in data entity
 */
export const TimeUnitThresholdFieldsSchema = z.object({
  threshold: z.number().optional(),
  time_unit: z.string().optional(), // e.g., 'seconds', 'minutes', 'hours'
})

export type TimeUnitThresholdFields = z.infer<typeof TimeUnitThresholdFieldsSchema>

/**
 * Uniting Alerts Fields - For custom entity's uniting_alerts rule
 * Has many specialized fields for alert aggregation
 */
export const UnitingAlertsFieldsSchema = z.object({
  threshold: z.number().optional(),
  description: z.string().optional(),
  aggregate_function: z.string().optional(),
  split_alert_by: z.string().optional(),
  iterated_description: z.string().optional(),
  base_query: z.string().optional(),
})

export type UnitingAlertsFields = z.infer<typeof UnitingAlertsFieldsSchema>

/**
 * MongoK with Volume - For S3 quantitative_allocation_storage rule
 * Combines threshold and volume_unit
 */
export const MongoKVolumeFieldsSchema = z.object({
  functionality: z.string().optional(),
  details: z.string().optional(),
  severity: SeverityEnum.optional(),
  duration: z.number().optional(),
  volume_unit: z.string().optional(),
  threshold: z.number().optional(),
})

export type MongoKVolumeFields = z.infer<typeof MongoKVolumeFieldsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Field Group Registry - Named groups for composition
// ─────────────────────────────────────────────────────────────────────────────

export const FieldGroupSchemas = {
  generic: GenericRuleFieldsSchema,
  dynamic: DynamicRuleFieldsSchema,
  service: ServiceRuleFieldsSchema,
  mongok: MongoKRuleFieldsSchema,
  volume: VolumeRuleFieldsSchema,
  elasticThreshold: ElasticThresholdFieldsSchema,
  buckets: BucketsFieldSchema,
  podsThreshold: PodsThresholdFieldsSchema,
  timeUnitThreshold: TimeUnitThresholdFieldsSchema,
  unitingAlerts: UnitingAlertsFieldsSchema,
  mongokVolume: MongoKVolumeFieldsSchema,
} as const

export type FieldGroupName = keyof typeof FieldGroupSchemas

// ─────────────────────────────────────────────────────────────────────────────
// Rule Composition Type - Defines which field groups a rule uses
// ─────────────────────────────────────────────────────────────────────────────

export interface RuleDefinition {
  /** Display name for the rule tab */
  label: string
  /** Hebrew display name (optional) */
  labelHe?: string
  /** Field groups this rule uses */
  fieldGroups: FieldGroupName[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Rule Registry - Maps entity type to available rules
// ─────────────────────────────────────────────────────────────────────────────

export const EntityRuleRegistry: Record<string, Record<string, RuleDefinition>> = {
  // HDFS Rules
  hdfs: {
    file_percent_usage: {
      label: 'File Percent Usage',
      labelHe: 'אחוז שימוש בקבצים',
      fieldGroups: ['generic', 'dynamic'],
    },
    storage_usage: {
      label: 'Storage Usage',
      labelHe: 'שימוש באחסון',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // Kafka Rules
  kafka: {
    kafka_lag: {
      label: 'Kafka Lag',
      labelHe: 'לאג בקפקא',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // Linux Rules
  linux: {
    ram: {
      label: 'RAM',
      labelHe: 'זיכרון',
      fieldGroups: ['generic', 'dynamic'],
    },
    cpu: {
      label: 'CPU',
      labelHe: 'מעבד',
      fieldGroups: ['generic', 'dynamic'],
    },
    service: {
      label: 'Service',
      labelHe: 'שירות',
      fieldGroups: ['generic', 'service'],
    },
    absent_service: {
      label: 'Absent Service',
      labelHe: 'שירות חסר',
      fieldGroups: ['generic', 'service'],
    },
    storage_usage: {
      label: 'Storage Usage',
      labelHe: 'שימוש באחסון',
      fieldGroups: ['generic', 'dynamic'],
    },
    diskusage: {
      label: 'Disk Usage',
      labelHe: 'שימוש בדיסק',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // MongoK Rules (MongoDB on Kubernetes)
  mongok: {
    open_connection_mongok: {
      label: 'Open Connection',
      labelHe: 'חיבורים פתוחים',
      fieldGroups: ['mongok'],
    },
    storage_usage_percentage: {
      label: 'Storage Usage Percentage',
      labelHe: 'אחוז שימוש באחסון',
      fieldGroups: ['mongok'],
    },
    ram_mongok: {
      label: 'RAM',
      labelHe: 'זיכרון',
      fieldGroups: ['mongok'],
    },
    cpu_mongok: {
      label: 'CPU',
      labelHe: 'מעבד',
      fieldGroups: ['mongok'],
    },
    health_mongok: {
      label: 'Health',
      labelHe: 'בריאות',
      fieldGroups: ['mongok'],
    },
  },

  // NiFi Rules
  nifi: {
    amount_files_sent: {
      label: 'Amount Files Sent',
      labelHe: 'כמות קבצים יוצאת',
      fieldGroups: ['generic', 'dynamic'],
    },
    amount_files_queued: {
      label: 'Amount Files Queued',
      labelHe: 'כמות קבצים בתור',
      fieldGroups: ['generic', 'dynamic'],
    },
    volume_files_received: {
      label: 'Volume Files Received',
      labelHe: 'נפח קבצים נכנס',
      fieldGroups: ['generic', 'dynamic', 'volume'],
    },
    volume_files_sent: {
      label: 'Volume Files Sent',
      labelHe: 'נפח קבצים יוצא',
      fieldGroups: ['generic', 'dynamic', 'volume'],
    },
    volume_files_queued: {
      label: 'Volume Files Queued',
      labelHe: 'נפח קבצים בתור',
      fieldGroups: ['generic', 'dynamic', 'volume'],
    },
  },

  // Elastic Rules
  elastic: {
    es_query_hits: {
      label: 'ES Query Hits',
      labelHe: 'כמות תוצאות שליפה',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    es_query_aggs: {
      label: 'ES Query Aggs',
      labelHe: 'תוצאות האגרגציה',
      fieldGroups: ['generic', 'elasticThreshold', 'buckets'],
    },
  },

  // OpenShift Rules
  openshift: {
    container_cpu: {
      label: 'Container CPU',
      labelHe: 'מעבד קונטיינר',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    pods_cpu: {
      label: 'Pods CPU',
      labelHe: 'מעבד פודים',
      fieldGroups: ['generic', 'podsThreshold'],
    },
    container_memory: {
      label: 'Container Memory',
      labelHe: 'זיכרון קונטיינר',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    pods_memory: {
      label: 'Pods Memory',
      labelHe: 'זיכרון פודים',
      fieldGroups: ['generic', 'podsThreshold'],
    },
    container_restarts: {
      label: 'Container Restarts',
      labelHe: 'אתחולי קונטיינר',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    pod_pending: {
      label: 'Pod Pending',
      labelHe: 'פוד ממתין',
      fieldGroups: ['generic'],
    },
    pods_not_running: {
      label: 'Pods Not Running',
      labelHe: 'פודים לא פעילים',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    workload_without_pods: {
      label: 'Workload Without Pods',
      labelHe: 'עומס ללא פודים',
      fieldGroups: ['generic'],
    },
    pods_errors: {
      label: 'Pods Errors',
      labelHe: 'אחוזי פודים תקלים',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    svc_without_pods: {
      label: 'Service Without Pods',
      labelHe: 'שירות ללא פוד',
      fieldGroups: ['generic'],
    },
    pod_restarts: {
      label: 'Pod Restarts',
      labelHe: 'פוד מתחיל מחדש',
      fieldGroups: ['generic'],
    },
  },

  // Data Rules
  data: {
    hermetic: {
      label: 'Hermetic',
      labelHe: 'הרמטיות',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    delay: {
      label: 'Delay',
      labelHe: 'עיכוב',
      fieldGroups: ['generic', 'timeUnitThreshold'],
    },
    last_insertion_time: {
      label: 'Last Insertion Time',
      labelHe: 'תז"מ',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    last_capture_time: {
      label: 'Last Capture Time',
      labelHe: 'תז"ק',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    latency: {
      label: 'Latency',
      labelHe: 'שיהוי',
      fieldGroups: ['generic', 'timeUnitThreshold'],
    },
    amount_filtered: {
      label: 'Amount Filtered',
      labelHe: 'כמות מזהים שסוננו',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
    percent_filtered: {
      label: 'Percent Filtered',
      labelHe: 'אחוז מזהים שסוננו',
      fieldGroups: ['generic', 'elasticThreshold'],
    },
  },

  // PostgreSQL Rules
  postgresql: {
    connections_rate: {
      label: 'Connections Rate',
      labelHe: 'קצב חיבורים',
      fieldGroups: ['generic', 'dynamic'],
    },
    ram_utilization: {
      label: 'RAM Utilization',
      labelHe: 'ניצולת זיכרון',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // PVC Rules
  pvc: {
    pvc_usage: {
      label: 'PVC Usage',
      labelHe: 'שימוש PVC',
      fieldGroups: ['mongok'],
    },
  },

  // Redis Rules
  redis: {
    connections_amount: {
      label: 'Connections Amount',
      labelHe: 'כמות חיבורים',
      fieldGroups: ['generic', 'dynamic'],
    },
    ram_utilization: {
      label: 'RAM Utilization',
      labelHe: 'ניצולת זיכרון',
      fieldGroups: ['generic', 'dynamic'],
    },
    latency: {
      label: 'Latency',
      labelHe: 'שיהוי',
      fieldGroups: ['generic', 'dynamic'],
    },
    cpu_redis: {
      label: 'CPU',
      labelHe: 'מעבד',
      fieldGroups: ['generic', 'dynamic'],
    },
    health_redis: {
      label: 'Health',
      labelHe: 'בריאות',
      fieldGroups: ['generic'],
    },
    shard_operations_count: {
      label: 'Shard Operations Count',
      labelHe: 'כמות פעולות שארד',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // S3 Rules
  s3: {
    account_quota: {
      label: 'Account Quota',
      labelHe: 'מכסת חשבון',
      fieldGroups: ['mongok'],
    },
    allocation_files_by_percentage: {
      label: 'Allocation Files by Percentage',
      labelHe: 'הקצאת קבצים באחוזים',
      fieldGroups: ['mongok'],
    },
    quantitative_allocation_storage: {
      label: 'Quantitative Allocation Storage',
      labelHe: 'הקצאת אחסון כמותית',
      fieldGroups: ['mongokVolume'],
    },
  },

  // Share Rules
  share: {
    storage_usage: {
      label: 'Storage Usage',
      labelHe: 'שימוש באחסון',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // URL Rules
  url: {
    url_default: {
      label: 'URL Default',
      labelHe: 'ברירת מחדל URL',
      fieldGroups: ['generic'],
    },
  },

  // Windows Rules
  windows: {
    ram: {
      label: 'RAM',
      labelHe: 'זיכרון',
      fieldGroups: ['generic', 'dynamic'],
    },
    cpu: {
      label: 'CPU',
      labelHe: 'מעבד',
      fieldGroups: ['generic', 'dynamic'],
    },
    service: {
      label: 'Service',
      labelHe: 'שירות',
      fieldGroups: ['generic', 'service'],
    },
    absent_service: {
      label: 'Absent Service',
      labelHe: 'שירות חסר',
      fieldGroups: ['generic', 'service'],
    },
    diskusage: {
      label: 'Disk Usage',
      labelHe: 'שימוש בדיסק',
      fieldGroups: ['generic', 'dynamic'],
    },
  },

  // Custom Rules
  custom: {
    custom: {
      label: 'Custom',
      fieldGroups: [],
    },
    uniting_alerts: {
      label: 'Uniting Alerts',
      fieldGroups: ['generic', 'unitingAlerts'],
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all rules available for a given entity type
 */
export function getEntityRules(entityType: string): Record<string, RuleDefinition> {
  return EntityRuleRegistry[entityType] ?? {}
}

/**
 * Get rule names for a given entity type
 */
export function getEntityRuleNames(entityType: string): string[] {
  return Object.keys(EntityRuleRegistry[entityType] ?? {})
}

/**
 * Build a Zod schema for a specific rule by merging its field groups
 */
export function buildRuleSchema(entityType: string, ruleName: string): z.ZodObject<any> {
  const rules = EntityRuleRegistry[entityType]
  if (!rules || !rules[ruleName]) {
    return z.object({})
  }

  const rule = rules[ruleName]
  const mergedShape: Record<string, z.ZodTypeAny> = {}

  for (const groupName of rule.fieldGroups) {
    const groupSchema = FieldGroupSchemas[groupName]
    if (groupSchema) {
      // Merge the shape of each field group
      const shape = groupSchema.shape
      Object.assign(mergedShape, shape)
    }
  }

  return z.object(mergedShape)
}

/**
 * Get field group names for a specific rule
 */
export function getRuleFieldGroups(entityType: string, ruleName: string): FieldGroupName[] {
  const rules = EntityRuleRegistry[entityType]
  if (!rules || !rules[ruleName]) {
    return []
  }
  return rules[ruleName].fieldGroups
}



// ─────────────────────────────────────────────────────────────────────────────
// Type Inference Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Full rule data combining all possible field groups */
export type FullRuleData = GenericRuleFields & DynamicRuleFields & ServiceRuleFields & MongoKRuleFields & VolumeRuleFields & ElasticThresholdFields & BucketsField & PodsThresholdFields & TimeUnitThresholdFields & UnitingAlertsFields & MongoKVolumeFields

/** Rule configuration with enabled state */
export interface RuleConfig {
  enabled: boolean
  data: Partial<FullRuleData>
}

/** Entity rules state - maps rule name to its config */
export type EntityRulesState = Record<string, RuleConfig>
