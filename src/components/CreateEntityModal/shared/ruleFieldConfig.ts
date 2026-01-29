/**
 * Rule Field Configuration Registry
 * 
 * Centralized field configurations with validations per field name.
 * Used to customize how rule fields are rendered and validated.
 */

import type { RuleFieldDef } from './ruleFieldUtils'

/**
 * Field-specific configurations that override default behavior
 * Key = field name, Value = partial field definition
 */
export const RULE_FIELD_CONFIG: Record<string, Partial<RuleFieldDef>> = {
  // ─────────────────────────────────────────────────────────────────────────
  // Threshold Variants
  // ─────────────────────────────────────────────────────────────────────────
  threshold: {
    placeholder: '1-99',
    min: 1,
    max: 99,
    required: true,
  },
  pods_threshold: {
    label: 'אחוז פודים',
    placeholder: '1-99',
    min: 0,
    max: 100,
    required: true,
  },
  amount_user: {
    label: 'כמות משתמשים שחווים כשלון',
    min: 0,
    max: 10000,
    defaultValue: 3,
    required: true,
  },
  amount_running: {
    label: 'כמות הרצות',
    min: 1,
    max: 1000000,
    required: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Duration & Time Fields
  // ─────────────────────────────────────────────────────────────────────────
  duration: {
    label: 'שיהוי להתרעה',
    placeholder: '2-15',
    min: 2,
    max: 15,
    suffix: 'דקות',
  },
  time_interval: {
    label: 'טווח בדיקה',
    placeholder: 'הזן מספר שלם',
    min: 1,
    suffix: 'דקות',
    defaultValue: 5,
    required: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Text Fields with Validation
  // ─────────────────────────────────────────────────────────────────────────
  metric_name: {
    label: 'שם מטריקה',
    required: true,
    validation: { noHebrew: true },
  },
  service_name: {
    label: 'שם שירות',
    required: true,
    validation: { noHebrew: true },
  },
  forecast_metric: {
    label: 'מטריקת החיזוי שנוצרת בניטור חריגות',
    required: true,
    validation: { noHebrew: true },
  },
  buckets: {
    label: 'buckets',
    tooltip: 'הזן ערך רצוי בשדה buckets, במידה ולא יוזן ערך החוק יוכל על כל הערכים',
    validation: { noQuotes: true },
  },
  description: {
    label: 'תיאור התראה',
    required: true,
  },
  details: {
    label: 'פרטי חוק',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Select Fields
  // ─────────────────────────────────────────────────────────────────────────
  status_code: {
    type: 'select',
    label: 'סטטוס קוד',
    options: ['4XX', '5XX', 'other'],
    required: true,
  },
  response_time_unit: {
    type: 'select',
    label: 'יחידת זמן',
    options: ['seconds', 'minutes', 'hours'],
    required: true,
  },
  time_unit: {
    type: 'select',
    label: 'יחידת זמן',
    options: ['minutes', 'hours'],
    required: true,
  },
  volume_unit: {
    type: 'select',
    label: 'יחידות מידה',
    options: ['bytes', 'KB', 'MB', 'GB'],
  },
  field_disk_type: {
    type: 'select',
    label: 'סוג דיסק',
    options: ['bytes', 'KB'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Float/Number Fields
  // ─────────────────────────────────────────────────────────────────────────
  expected_mean: {
    label: 'הפער הממוצע בין החיזוי למטריקה',
    required: true,
  },
}

/**
 * Get field configuration by field name
 */
export function getFieldConfig(fieldName: string): Partial<RuleFieldDef> {
  return RULE_FIELD_CONFIG[fieldName] || {}
}
