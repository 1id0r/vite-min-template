/**
 * GenericRuleForm Types
 * 
 * Shared types for the generic rule form component.
 */

export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'severity' | 'time'

export interface RuleFieldDef {
  name: string
  type: FieldType
  label: string
  labelHe?: string
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
}

export interface GenericRuleFormProps {
  /** Entity type (e.g., 'elastic', 'linux', 'kafka') */
  entityType: string
  /** Rule key (e.g., 'es_query_hits', 'cpu', 'kafka_lag') */
  ruleKey: string
  /** Initial data for editing mode */
  initialData?: Record<string, any>
  /** Callback when data changes */
  onChange?: (data: Record<string, any>) => void
  /** Disabled state for view-only mode */
  disabled?: boolean
  /** Severities already used by sibling rules (for cross-rule validation) */
  disabledSeverities?: string[]
  /** Layout direction */
  direction?: 'rtl' | 'ltr'
}

export interface RuleFormFieldProps {
  field: RuleFieldDef
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  disabledSeverities?: string[]
  direction?: 'rtl' | 'ltr'
}
