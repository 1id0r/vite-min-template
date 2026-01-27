/**
 * Utility: Derive rule fields from Zod schema
 * 
 * Extracts field definitions from rule schemas for dynamic form rendering
 */

import { getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'

export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'severity' | 'time'

export interface RuleFieldDef {
  name: string
  type: FieldType
  label: string
  options?: string[]
}

/** Field names that should be rendered as time pickers */
const TIME_FIELD_NAMES = ['start_time', 'end_time']

/** Field names that should be rendered as select dropdowns with predefined options */
const SELECT_FIELD_NAMES: Record<string, string[]> = {
  volume_unit: ['KB', 'MB', 'GB', 'TB'],
  time_unit: ['seconds', 'minutes', 'hours', 'days'],
}

/** Severity enum values to detect severity fields */
const SEVERITY_VALUES = ['critical', 'major', 'info']

/**
 * Detect if an enum field is a severity field
 */
function isSeverityEnum(values: string[]): boolean {
  return SEVERITY_VALUES.every(v => values.includes(v)) && values.length === SEVERITY_VALUES.length
}

/**
 * Get all fields for a specific rule type
 * Handles Zod schema introspection and type inference
 */
export function getRuleFields(entityType: string, ruleKey: string): RuleFieldDef[] {
  const fieldGroups = getRuleFieldGroups(entityType, ruleKey)
  const fields: RuleFieldDef[] = []

  fieldGroups.forEach((groupName) => {
    const schema = FieldGroupSchemas[groupName]
    if (!schema) return

    Object.entries(schema.shape).forEach(([fieldName, fieldSchema]: [string, any]) => {
      // Unwrap optional/nullable
      let cur = fieldSchema
      while (cur._def.typeName === 'ZodOptional' || cur._def.typeName === 'ZodNullable') {
        cur = cur._def.innerType
      }

      const typeName = cur._def.typeName
      let type: FieldType = 'text'
      let options: string[] | undefined = undefined

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
      } else if (SELECT_FIELD_NAMES[fieldName]) {
        // Select fields with predefined options detected by name
        type = 'select'
        options = SELECT_FIELD_NAMES[fieldName]
      }

      fields.push({
        name: fieldName,
        type,
        label: fieldName,
        options,
      })
    })
  })

  return fields
}
