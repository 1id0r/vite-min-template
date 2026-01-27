/**
 * GenericRuleForm - Standalone Rule Form Component
 *
 * A fully generic, standalone rule form that:
 * - Accepts entityType and ruleKey to determine field configuration
 * - Supports initialData for editing existing rules
 * - Uses onChange callback for controlled behavior
 * - No react-hook-form dependency - works anywhere
 *
 * Usage:
 * ```tsx
 * <GenericRuleForm
 *   entityType="elastic"
 *   ruleKey="es_query_hits"
 *   initialData={{ threshold: 100, severity: 'major' }}
 *   onChange={(data) => console.log(data)}
 * />
 * ```
 */

import { memo, useState, useEffect, useMemo, useCallback } from 'react'
import { getRuleFieldGroups, FieldGroupSchemas } from '../../schemas/ruleSchemas'
import { getRuleFieldConfig } from '../../schemas/fieldConfigs'
import { RuleFormField } from './RuleFormField'
import type { GenericRuleFormProps, RuleFieldDef, FieldType } from './types'

export const GenericRuleForm = memo(function GenericRuleForm({
  entityType,
  ruleKey,
  initialData = {},
  onChange,
  disabled = false,
  disabledSeverities = [],
  direction = 'rtl',
}: GenericRuleFormProps) {
  // Internal state for form data
  const [data, setData] = useState<Record<string, any>>(initialData)

  // Reset data when initial data changes (e.g., switching to edit different rule)
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Derive field definitions from RuleFieldConfigs (preferred) with Zod schema fallback
  const fields = useMemo(() => {
    const fieldGroups = getRuleFieldGroups(entityType, ruleKey)
    const result: RuleFieldDef[] = []

    fieldGroups.forEach((groupName) => {
      // First try to get field config from RuleFieldConfigs
      const fieldConfig = getRuleFieldConfig(groupName)

      if (fieldConfig && fieldConfig.fields.length > 0) {
        // Use RuleFieldConfigs - this has proper Hebrew labels and field types
        fieldConfig.fields.forEach((field) => {
          result.push({
            name: field.name,
            type: field.type as FieldType,
            label: field.name, // English name for fallback
            labelHe: field.label, // Hebrew label from config
            placeholder: field.placeholder,
            min: field.min,
            max: field.max,
          })
        })
      } else {
        // Fallback to Zod schema introspection
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

          if (typeName === 'ZodNumber') type = 'number'
          if (typeName === 'ZodBoolean') type = 'boolean'
          if (typeName === 'ZodEnum') {
            type = fieldName === 'severity' ? 'severity' : 'select'
          }
          if (typeName === 'ZodString' && (fieldName === 'start_time' || fieldName === 'end_time')) {
            type = 'time'
          }

          result.push({
            name: fieldName,
            type,
            label: fieldName,
            options: typeName === 'ZodEnum' ? cur._def.values : undefined,
          })
        })
      }
    })

    return result
  }, [entityType, ruleKey])

  // Handle field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      const newData = { ...data, [fieldName]: value }
      setData(newData)
      onChange?.(newData)
    },
    [data, onChange],
  )

  if (fields.length === 0) {
    return null
  }

  return (
    <div style={{ direction }}>
      {fields.map((field) => (
        <RuleFormField
          key={field.name}
          field={field}
          value={data[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
          disabled={disabled}
          disabledSeverities={disabledSeverities}
          direction={direction}
        />
      ))}
    </div>
  )
})

GenericRuleForm.displayName = 'GenericRuleForm'
