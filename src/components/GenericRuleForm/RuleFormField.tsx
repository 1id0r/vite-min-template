/**
 * RuleFormField - Standalone field renderer with inline layout
 *
 * Renders form fields with label on the right (RTL) and input on the left.
 * Fully standalone - no react-hook-form dependency.
 */

import { memo } from 'react'
import { Input, InputNumber, Checkbox, Select, Typography } from 'antd'
import type { RuleFormFieldProps } from './types'

const { Text } = Typography

// Severity configuration
const SEVERITY_CONFIG = {
  critical: { color: 'red', label: 'Critical' },
  major: { color: 'orange', label: 'Major' },
  info: { color: 'blue', label: 'Info' },
} as const

/** Format field names: 'some_field_name' → 'Some Field Name' */
const formatLabel = (label: string): string =>
  label
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

export const RuleFormField = memo(function RuleFormField({
  field,
  value,
  onChange,
  disabled = false,
  disabledSeverities = [],
  direction = 'rtl',
}: RuleFormFieldProps) {
  const label = field.labelHe || formatLabel(field.label)
  const isRTL = direction === 'rtl'

  const renderInput = () => {
    switch (field.type) {
      case 'number':
        return (
          <InputNumber
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={field.min ?? 0}
            max={field.max}
            style={{ width: '100%' }}
            placeholder={field.placeholder}
          />
        )

      case 'boolean':
        return <Checkbox checked={value} onChange={(e) => onChange?.(e.target.checked)} disabled={disabled} />

      case 'severity':
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {(['critical', 'major', 'info'] as const).map((sev) => {
              const config = SEVERITY_CONFIG[sev]
              const isDisabled = disabled || disabledSeverities.includes(sev)
              const isSelected = value === sev
              return (
                <div
                  key={sev}
                  onClick={() => !isDisabled && onChange?.(sev)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 16,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor:
                      isSelected ? config.color
                      : isDisabled ? '#f5f5f5'
                      : '#fafafa',
                    color:
                      isSelected ? '#fff'
                      : isDisabled ? '#bfbfbf'
                      : '#595959',
                    border: `1px solid ${
                      isSelected ? config.color
                      : isDisabled ? '#d9d9d9'
                      : '#e8e8e8'
                    }`,
                    opacity: isDisabled ? 0.5 : 1,
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: 13,
                    transition: 'all 0.2s ease',
                    textDecoration: isDisabled ? 'line-through' : 'none',
                  }}
                >
                  {config.label}
                </div>
              )
            })}
          </div>
        )

      case 'select':
        return (
          <Select
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ width: '100%' }}
            options={field.options?.map((opt) => ({ value: opt, label: opt }))}
            placeholder={field.placeholder}
          />
        )

      default: // text
        return (
          <Input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            placeholder={field.placeholder}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
        )
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 12,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <Text
        strong
        style={{
          fontSize: 14,
          width: 100,
          marginLeft: isRTL ? 12 : 0,
          marginRight: isRTL ? 0 : 12,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      <div style={{ flex: 1 }}>{renderInput()}</div>
    </div>
  )
})
