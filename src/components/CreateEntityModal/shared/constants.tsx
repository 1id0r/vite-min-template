import type { ReactNode } from 'react'
import { Tag } from 'antd'
import { SEVERITY_LEVELS, SEVERITY_CONFIG } from '../../../schemas/ruleSchemas'

// ─────────────────────────────────────────────────────────────────────────────
// Severity Configuration - Re-exported from ruleSchemas.ts (Single Source of Truth)
// ─────────────────────────────────────────────────────────────────────────────

// Re-export for backwards compatibility
export { SEVERITY_LEVELS, SEVERITY_CONFIG }

export const SEVERITY_OPTIONS = Object.entries(SEVERITY_CONFIG).map(([value, config]) => ({
  value,
  label: (<Tag color={config.color}>{config.label}</Tag>) as ReactNode,
}))

export const getSeverityOptions = (disabledSeverities: string[] = []) =>
  SEVERITY_OPTIONS.map((opt) => ({
    ...opt,
    disabled: disabledSeverities.includes(opt.value),
  }))

// ─────────────────────────────────────────────────────────────────────────────
// Rule Limits
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_RULES_PER_TYPE = 3

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Format field names: 'some_field_name' → 'Some Field Name' */
export const formatLabel = (label: string): string =>
  label
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
