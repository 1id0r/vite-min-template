import type { ReactNode } from 'react'
import { Tag } from 'antd'

// ─────────────────────────────────────────────────────────────────────────────
// Severity Configuration
// ─────────────────────────────────────────────────────────────────────────────

export type SeverityLevel = 'critical' | 'major' | 'info'

export const SEVERITY_CONFIG: Record<SeverityLevel, { color: string; label: string }> = {
  critical: { color: 'red', label: 'Critical' },
  major: { color: 'orange', label: 'Major' },
  info: { color: 'blue', label: 'Info' },
}

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
