/**
 * Utility: Derive rule fields from Zod schema
 * 
 * Extracts field definitions from rule schemas for dynamic form rendering
 */

import { getRuleFieldGroups, FieldGroupSchemas, SEVERITY_LEVELS } from '../../../schemas/ruleSchemas'
import { RULE_FIELD_CONFIG } from './ruleFieldConfig'

export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'severity' | 'time'

/**
 * Validation rules for a field
 */
export interface FieldValidation {
  noHebrew?: boolean      // Cannot include Hebrew characters
  noQuotes?: boolean      // Cannot include ' " `
  range?: [number, number] // Min/Max range
}

/**
 * Field definition with validation and display configuration
 */
export interface RuleFieldDef {
  name: string
  type: FieldType
  label: string
  options?: string[]
  // Validation & Display Config
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
  defaultValue?: any
  suffix?: string
  tooltip?: string
  validation?: FieldValidation
}

/** Field names that should be rendered as time pickers */
const TIME_FIELD_NAMES = ['start_time', 'end_time']

/** Field names that should be excluded from auto-generation (rendered by dedicated components) */
const EXCLUDED_FIELD_NAMES = ['functionality']

/** Field names that should be rendered as severity pills */
const SEVERITY_FIELD_NAMES = ['severity']

/** Field names that should be rendered as number inputs */
const NUMBER_FIELD_NAMES = ['threshold', 'duration', 'time_interval', 'expected_mean', 'amount_user', 'amount_running', 'pods_threshold']

/** Field names that should be rendered as boolean checkboxes */
const BOOLEAN_FIELD_NAMES = ['is_same_date']

/**
 * Detect if an enum field is a severity field
 * Uses SEVERITY_LEVELS from ruleSchemas.ts (Single Source of Truth)
 */
function isSeverityEnum(values: string[]): boolean {
  return SEVERITY_LEVELS.every(v => values.includes(v)) && values.length === SEVERITY_LEVELS.length
}

/**
 * Get all fields for a specific rule type
 * Handles Zod schema introspection, type inference, and field config merging
 */
export function getRuleFields(entityType: string, ruleKey: string): RuleFieldDef[] {
  const fieldGroups = getRuleFieldGroups(entityType, ruleKey)
  const fields: RuleFieldDef[] = []

  fieldGroups.forEach((groupName) => {
    const schema = FieldGroupSchemas[groupName]
    if (!schema) return

    Object.entries(schema.shape).forEach(([fieldName, fieldSchema]: [string, any]) => {
      // Skip fields rendered by dedicated components
      if (EXCLUDED_FIELD_NAMES.includes(fieldName)) return
      
      // Unwrap optional/nullable
      let cur = fieldSchema
      while (cur._def.typeName === 'ZodOptional' || cur._def.typeName === 'ZodNullable') {
        cur = cur._def.innerType
      }

      const typeName = cur._def.typeName
      let type: FieldType = 'text'
      let options: string[] | undefined = undefined

      // Get field-specific config (may override type/options)
      const fieldConfig = RULE_FIELD_CONFIG[fieldName] || {}

      // If config specifies a type, use it
      if (fieldConfig.type) {
        type = fieldConfig.type
        options = fieldConfig.options
      } else {
        // Determine field type based on Zod schema and field name
        if (typeName === 'ZodNumber') {
          type = 'number'
        } else if (typeName === 'ZodBoolean') {
          type = 'boolean'
        } else if (typeName === 'ZodEnum') {
          const enumValues = cur._def.values as string[]
          if (isSeverityEnum(enumValues)) {
            type = 'severity'
          } else {
            type = 'select'
            options = enumValues
          }
        } else if (TIME_FIELD_NAMES.includes(fieldName)) {
          // Time fields detected by name
          type = 'time'
        } else if (fieldConfig.options) {
          // Field config provides options = select
          type = 'select'
          options = fieldConfig.options
        } 
        // Fallback: name-based detection (for Zod version compatibility)
        else if (SEVERITY_FIELD_NAMES.includes(fieldName)) {
          type = 'severity'
        } else if (NUMBER_FIELD_NAMES.includes(fieldName)) {
          type = 'number'
        } else if (BOOLEAN_FIELD_NAMES.includes(fieldName)) {
          type = 'boolean'
        }
      }

      // DEBUG: Log field type detection
      console.log(`[RuleField] ${fieldName}: zodType=${typeName} → resolvedType=${type}`, fieldConfig.type ? '(from config)' : '')

      // Build field definition, merging with config
      const fieldDef: RuleFieldDef = {
        name: fieldName,
        type,
        label: fieldConfig.label || fieldName,
        options: options || fieldConfig.options,
        // Merge config properties
        required: fieldConfig.required,
        placeholder: fieldConfig.placeholder,
        min: fieldConfig.min,
        max: fieldConfig.max,
        defaultValue: fieldConfig.defaultValue,
        suffix: fieldConfig.suffix,
        tooltip: fieldConfig.tooltip,
        validation: fieldConfig.validation,
      }

      fields.push(fieldDef)
    })
  })

  return fields
}

