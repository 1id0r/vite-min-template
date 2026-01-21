/**
 * Utility: Derive rule fields from Zod schema
 * 
 * Extracts field definitions from rule schemas for dynamic form rendering
 */

import { getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'

export interface RuleFieldDef {
  name: string
  type: 'text' | 'number' | 'boolean' | 'select'
  label: string
  options?: string[]
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
      let type: 'text' | 'number' | 'boolean' | 'select' = 'text'

      if (typeName === 'ZodNumber') type = 'number'
      if (typeName === 'ZodBoolean') type = 'boolean'
      if (typeName === 'ZodEnum') type = 'select'

      fields.push({
        name: fieldName,
        type,
        label: fieldName,
        options: typeName === 'ZodEnum' ? cur._def.values : undefined,
      })
    })
  })

  return fields
}
