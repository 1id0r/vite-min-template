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

// Basic monitor form (used for most systems)
export const BasicMonitorSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  region: z.string().min(1, 'Region is required'),
  capacity: z.number().int().min(0).optional(),
  alertChannel: z.string().optional(),
  enableTelemetry: z.boolean().optional(),
})

// Oracle
export const OracleMonitorSchema = z.object({
  dc: z.string().min(1, 'DC is required'),
  host: z.string().min(1, 'Host is required'),
  database: z.string().min(1, 'Database is required'),
})

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

// NFS
export const NFSMonitorSchema = z.object({
  network: z.string().min(1, 'Network is required'),
  dc: z.string().min(1, 'DC is required'),
  route: z.string().min(1, 'Route is required'),
})

// CIFS
export const CIFSMonitorSchema = z.object({
  network: z.string().min(1, 'Network is required'),
  dc: z.string().min(1, 'DC is required'),
  route: z.string().min(1, 'Route is required'),
})

// Kafka
export const KafkaMonitorSchema = z.object({
  cluster: z.string().min(1, 'Cluster is required'),
  topic: z.string().min(1, 'Topic is required'),
  consumer: z.string().min(1, 'Consumer is required'),
})

// RabbitMQ
export const RabbitMonitorSchema = z.object({
  network: z.string().min(1, 'Network is required'),
  dc: z.string().min(1, 'DC is required'),
  queue: z.string().min(1, 'שם תור הוא שדה חובה'),
})

// Spark
export const SparkMonitorSchema = z.object({
  namespace: z.string().min(1, 'Namespace is required'),
  applicationName: z.string().min(1, 'Application name is required'),
})

// Airflow
export const AirflowMonitorSchema = z.object({
  network: z.string().min(1, 'Network is required'),
  dc: z.string().min(1, 'DC is required'),
  dag: z.string().min(1, 'DAG is required'),
  task: z.string().min(1, 'Task is required'),
  isSparkDag: z.boolean().optional(),
})

// NiFi
export const NiFiMonitorSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  componentType: z.string().min(1, 'Component type is required'),
  componentId: z.string().min(1, 'Component ID is required'),
})

// IBM MQ
export const IBMMQMonitorSchema = z.object({
  queueManagers: z.string().min(1, 'Queue manager(s) is required'),
  queueName: z.string().min(1, 'Queue name is required'),
})

// OS
export const OSMonitorSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  workland: z.string().min(1, 'Workland is required'),
  type: z.string().min(1, 'Type is required'),
})

// PVC
export const PVCMonitorSchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  pvc: z.string().min(1, 'PVC is required'),
})

// DNS
export const DNSMonitorSchema = z.object({
  dns: z.string().min(1, 'DNS is required'),
})

// Chevila (Package)
export const ChevilaMonitorSchema = z.object({
  entityName: z.string().min(1, 'שם יישות הוא שדה חובה'),
  identifier: z.string().min(1, 'מזהה הוא שדה חובה'),
})

// Ribua
export const RibuaMonitorSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  identifier: z.string().min(1, 'מזהה הוא שדה חובה'),
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
export const OCP4MonitorSchema = z.object({
  alertChannel: z.string().optional(),
  enableClusterLogging: z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Monitor Schema Registry - Maps system ID to schema
// ─────────────────────────────────────────────────────────────────────────────

export const MonitorSchemaRegistry: Record<string, z.ZodObject<any>> = {
  oracle_db: OracleMonitorSchema,
  mongo_k: MongoMonitorSchema,
  redis: RedisMonitorSchema,
  postgresql: PostgresMonitorSchema,
  eck: ECKMonitorSchema,
  sql_server: SQLMonitorSchema,
  s3_db: S3MonitorSchema,
  hdfs: HDFSMonitorSchema,
  hadoop_hdfs: HDFSMonitorSchema,
  nfs: NFSMonitorSchema,
  cifs: CIFSMonitorSchema,
  kafka: KafkaMonitorSchema,
  rabbitmq: RabbitMonitorSchema,
  spark_ocp4: SparkMonitorSchema,
  airflow: AirflowMonitorSchema,
  nifi: NiFiMonitorSchema,
  ibm_mq: IBMMQMonitorSchema,
  os: OSMonitorSchema,
  pvc: PVCMonitorSchema,
  dns: DNSMonitorSchema,
  chevila: ChevilaMonitorSchema,
  ribua: RibuaMonitorSchema,
  vm_linux: VMLinuxMonitorSchema,
  vm_windows: VMWindowsMonitorSchema,
  ocp4: OCP4MonitorSchema,
  // All other systems use basic schema
  splunk: BasicMonitorSchema,
  general: BasicMonitorSchema,
  gslb: BasicMonitorSchema,
  avi: BasicMonitorSchema,
  dp: BasicMonitorSchema,
  prophet: BasicMonitorSchema,
  runai: BasicMonitorSchema,
  jupyter: BasicMonitorSchema,
  llm: BasicMonitorSchema,
  richard: BasicMonitorSchema,
  solr: BasicMonitorSchema,
  tardis_xport: BasicMonitorSchema,
  s3_pipeline: BasicMonitorSchema,
  tiva: BasicMonitorSchema,
  mishloach: BasicMonitorSchema,
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
