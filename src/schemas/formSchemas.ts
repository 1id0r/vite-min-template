import { z } from 'zod'

/**
 * Form Schemas - Client-Side Validation with Zod
 * 
 * This file defines all form schemas for the entity creation flow using Zod.
 * Schemas provide both runtime validation and TypeScript type inference.
 * 
 * STRUCTURE:
 * - GeneralFormSchema: Fixed schema for Step 2 (all entities)
 * - Monitor schemas: Dynamic schemas for Step 3 (per system type)
 * - MonitorSchemaRegistry: Maps system IDs to their monitor schemas
 * 
 * ADDING A NEW MONITOR FORM:
 * 1. Create schema: export const MySystemSchema = z.object({...})
 * 2. Add to registry: MonitorSchemaRegistry['my_system'] = MySystemSchema
 * 3. Add field config in fieldConfigs.ts
 * 
 * MODIFYING VALIDATION:
 * Just update the Zod schema - changes apply immediately
 * Example: dc: z.string().min(1).max(10) // Add max length
 */

// ─────────────────────────────────────────────────────────────────────────────
// General Form Schema (Step 2 - Fixed for all entities)
// ─────────────────────────────────────────────────────────────────────────────

export const LinkSchema = z.object({
  label: z.string().max(30, 'שם תצוגה חייב להיות עד 30 תווים').optional(),
  url: z.string().url('לינק לא תקין').optional(),
})

export const GeneralFormSchema = z.object({
  displayName: z.string().min(1, 'שם תצוגה הוא שדה חובה').max(50, 'שם תצוגה חייב להיות עד 50 תווים'),
  entityType: z.string(),
  description: z.string().min(1, 'תיאור הוא שדה חובה').max(200, 'תיאור חייב להיות עד 200 תווים'),
  contactInfo: z.string().regex(/^[0-9\-+() ]*$/, 'פרטי התקשרות יכולים להכיל רק מספרים ותווי פיסוק').optional(),
  responsibleParty: z.string().max(50, 'גורם אחראי חייב להיות עד 50 תווים').optional(),
  links: z.array(LinkSchema).optional(),
})

export type GeneralFormData = z.infer<typeof GeneralFormSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Monitor Form Schemas (Step 3 - Dynamic per system)
// ─────────────────────────────────────────────────────────────────────────────

// Basic monitor form (used for most systems - no fields by default)
export const BasicMonitorSchema = z.object({})


// MongoDB
export const MongoMonitorSchema = z.object({
  dc: z.string().min(1, 'DC is required'),
  host: z.string().min(1, 'Host is required'),
  database: z.string().min(1, 'Database is required'),
})

// Redis
export const RedisMonitorSchema = z.object({
  dc: z.string().min(1, 'DC is required'),
  environment: z.string().min(1, 'Environment is required'),
  database: z.string().min(1, 'Database is required'),
  instance: z.string().min(1, 'Instance is required'),
})

// PostgreSQL
export const PostgresMonitorSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  dc: z.string().min(1, 'DC is required'),
  database: z.string().min(1, 'Database is required'),
})

// ECK
export const ECKMonitorSchema = z.object({
  cluster: z.string().min(1, 'Cluster is required'),
  index: z.string().min(1, 'Index is required'),
})

// SQL Server
export const SQLMonitorSchema = z.object({
  dc: z.string().min(1, 'DC is required'),
  host: z.string().min(1, 'Host is required'),
  database: z.string().min(1, 'Database is required'),
})

// S3
export const S3MonitorSchema = z.object({
  dc: z.string().min(1, 'DC is required'),
  name: z.string().min(1, 'Name is required'),
})

// HDFS
export const HDFSMonitorSchema = z.object({
  network: z.string().min(1, 'Network is required'),
  dc: z.string().min(1, 'DC is required'),
  url: z.string().min(1, 'URL is required'),
})


// Kafka
export const KafkaMonitorSchema = z.object({
  cluster: z.string().min(1, 'Cluster is required'),
  topic: z.string().min(1, 'Topic is required'),
  consumer: z.string().min(1, 'Consumer is required'),
})


// PVC
export const PVCMonitorSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  pvc: z.string().min(1, 'PVC is required'),
})

// NiFi
export const NiFiMonitorSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  componentType: z.string().min(1, 'Component type is required'),
  componentId: z.string().min(1, 'Component ID is required'),
})


// VM Linux
export const VMLinuxMonitorSchema = z.object({
  dns: z.string().min(1, 'DNS is required'),
})

// VM Windows
export const VMWindowsMonitorSchema = z.object({
  dns: z.string().min(1, 'DNS is required'),
})

// OCP4


// ─────────────────────────────────────────────────────────────────────────────
// Monitor Schema Registry - Maps system ID to schema
// ─────────────────────────────────────────────────────────────────────────────

export const MonitorSchemaRegistry: Record<string, z.ZodObject<any>> = {
  mongo_k: MongoMonitorSchema,
  redis: RedisMonitorSchema,
  postgresql: PostgresMonitorSchema,
  elastic: ECKMonitorSchema,
  sql_server: SQLMonitorSchema,
  s3_db: S3MonitorSchema,
  hdfs: HDFSMonitorSchema,
  kafka: KafkaMonitorSchema,
  nifi: NiFiMonitorSchema,
  pvc: PVCMonitorSchema, // Re-added PVC manually since it was deleted in the chunk above
  vm_linux: VMLinuxMonitorSchema,
  vm_windows: VMWindowsMonitorSchema,
}

// Helper to get monitor schema by system ID
export function getMonitorSchema(systemId: string): z.ZodObject<any> {
  return MonitorSchemaRegistry[systemId] ?? BasicMonitorSchema
}


export type MonitorFormData = z.infer<typeof BasicMonitorSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Attachment Schemas (for Bindings tab)
// ─────────────────────────────────────────────────────────────────────────────

export const UrlAttachmentSchema = z.object({
  type: z.literal('url'),
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'URL is required').url('Invalid URL format'),
  timeout: z.string().min(1, 'Timeout is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Elasticsearch Query DSL Validator
// ─────────────────────────────────────────────────────────────────────────────

// Valid top-level Elasticsearch request body keys
const VALID_ES_TOP_LEVEL_KEYS = [
  'query', 'aggs', 'aggregations', 'size', 'from', 'sort', '_source', 'fields',
  'highlight', 'script_fields', 'stored_fields', 'explain', 'version', 'seq_no_primary_term',
  'track_scores', 'track_total_hits', 'min_score', 'post_filter', 'rescore',
  'suggest', 'pit', 'runtime_mappings', 'collapse', 'timeout', 'search_after',
]

// Valid query types in Elasticsearch
const VALID_QUERY_TYPES = [
  // Full text queries
  'match', 'match_phrase', 'match_phrase_prefix', 'multi_match', 'query_string', 'simple_query_string',
  // Term-level queries
  'term', 'terms', 'range', 'exists', 'prefix', 'wildcard', 'regexp', 'fuzzy', 'ids',
  // Compound queries
  'bool', 'boosting', 'constant_score', 'dis_max', 'function_score',
  // Joining queries
  'nested', 'has_child', 'has_parent', 'parent_id',
  // Geo queries
  'geo_bounding_box', 'geo_distance', 'geo_polygon', 'geo_shape',
  // Specialized
  'match_all', 'match_none', 'wrapper', 'script', 'percolate', 'more_like_this',
]

/**
 * Validates an Elasticsearch Query DSL structure
 * Returns { valid: true } or { valid: false, error: string }
 */
function validateElasticQueryDSL(jsonString: string): { valid: boolean; error?: string } {
  // Step 1: Parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { valid: false, error: 'Invalid JSON syntax' }
  }

  // Step 2: Must be an object
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { valid: false, error: 'Query must be a JSON object' }
  }

  const obj = parsed as Record<string, unknown>
  const keys = Object.keys(obj)

  // Step 3: Must not be empty
  if (keys.length === 0) {
    return { valid: false, error: 'Query object cannot be empty' }
  }

  // Step 4: All top-level keys must be valid ES keys
  const invalidKeys = keys.filter(key => !VALID_ES_TOP_LEVEL_KEYS.includes(key))
  if (invalidKeys.length > 0) {
    return { valid: false, error: `Invalid top-level key(s): ${invalidKeys.join(', ')}. Expected: query, aggs, size, from, sort, etc.` }
  }

  // Step 5: If 'query' exists, validate it has a valid query type
  if (obj.query !== undefined) {
    if (typeof obj.query !== 'object' || obj.query === null || Array.isArray(obj.query)) {
      return { valid: false, error: '"query" must be an object' }
    }
    
    const queryObj = obj.query as Record<string, unknown>
    const queryKeys = Object.keys(queryObj)
    
    if (queryKeys.length === 0) {
      return { valid: false, error: '"query" object cannot be empty' }
    }

    // Check if at least one query type is valid
    const hasValidQueryType = queryKeys.some(key => VALID_QUERY_TYPES.includes(key))
    if (!hasValidQueryType) {
      return { 
        valid: false, 
        error: `No valid query type found. Expected one of: match, match_all, bool, term, range, etc. Got: ${queryKeys.join(', ')}` 
      }
    }
  }

  return { valid: true }
}

export const ElasticAttachmentSchema = z.object({
  type: z.literal('elastic'),
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  cluster: z.string().min(1, 'Cluster is required'),
  index: z.string().min(1, 'Index is required'),
  scheduleValue: z.number({ invalid_type_error: 'Required' } as any).min(1, 'Must be positive'),
  scheduleUnit: z.enum(['minutes', 'hours']),
  timeout: z.string().regex(/^\d+s$/, 'Timeout must be in format like "30s"'),
  query: z.string().min(1, 'Query is required').superRefine((val, ctx) => {
    const result = validateElasticQueryDSL(val)
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error ?? 'Invalid Elasticsearch query',
      })
    }
  }),
})

export const AttachmentSchema = z.discriminatedUnion('type', [
  UrlAttachmentSchema,
  ElasticAttachmentSchema,
])

// ─────────────────────────────────────────────────────────────────────────────
// Tree Selection Schema (for Measurements tab)
// ─────────────────────────────────────────────────────────────────────────────

export const TreeSelectionSchema = z.object({
  vid: z.string(),
  displayName: z.string(),
})

export type TreeSelectionData = z.infer<typeof TreeSelectionSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Entity Schema Builder
// ─────────────────────────────────────────────────────────────────────────────

/** Base fields always present in the entity form */
const EntityBaseSchema = z.object({
  flow: z.enum(['monitor', 'display']),
  systemId: z.string().min(1, 'בחר סוג יישות'),
  displayName: z.string().min(1, 'שם תצוגה הוא שדה חובה').max(50, 'שם תצוגה חייב להיות עד 50 תווים'),
  entityType: z.string(),
  description: z.string().min(1, 'תיאור הוא שדה חובה').max(200, 'תיאור חייב להיות עד 200 תווים'),
  contactInfo: z.string().regex(/^[0-9\-+() ]*$/, 'פרטי התקשרות יכולים להכיל רק מספרים ותווי פיסוק').optional().or(z.literal('')),
  responsibleParty: z.string().max(50, 'גורם אחראי חייב להיות עד 50 תווים').optional(),
  links: z.array(LinkSchema).optional(),
})

/** Display flow schema - base + icon */
const DisplayEntitySchema = EntityBaseSchema.extend({
  flow: z.literal('display'),
  icon: z.string().optional(),
})

/**
 * Builds dynamic entity schema based on flow type and selected system.
 * @param flow - 'monitor' or 'display'
 * @param systemId - Selected system ID (e.g., 'redis', 'kafka')
 */
export function getEntitySchema(flow: 'monitor' | 'display', systemId: string | null) {
  if (flow === 'display') {
    return DisplayEntitySchema
  }

  // Monitor flow - extend base with system-specific fields + bindings
  const monitorFields = systemId ? getMonitorSchema(systemId) : z.object({})
  
  return EntityBaseSchema.extend({
    flow: z.literal('monitor'),
    icon: z.string().optional(),
    // Monitor-specific fields are flattened into the form
    monitor: monitorFields,
    // Bindings (Step 4-5)
    measurements: z.array(TreeSelectionSchema).optional(),
    attachments: z.array(AttachmentSchema).optional(),
  })
}

/** Inferred type for the full entity form data */
export type EntityFormData = z.infer<typeof EntityBaseSchema> & {
  icon?: string
  monitor?: Record<string, unknown>
  measurements?: TreeSelectionData[]
  attachments?: z.infer<typeof AttachmentSchema>[]
}

