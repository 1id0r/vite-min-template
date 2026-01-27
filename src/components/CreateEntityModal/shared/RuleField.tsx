import { Controller } from 'react-hook-form'
import { Input, InputNumber, Checkbox, Select, Typography, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { SEVERITY_CONFIG, formatLabel } from './constants'
import type { FieldType } from './ruleFieldUtils'
import './RuleField.css'

const { Text } = Typography

interface FieldDef {
  name: string
  type: FieldType
  label: string
  options?: string[]
}

interface RuleFieldProps {
  basePath: string
  field: FieldDef
  control: any
  disabledSeverities?: string[]
}

/**
 * Unified field renderer for rule forms
 * Handles: text, number (min=0), boolean, select (with severity badges)
 * Uses inline layout: label on right, input on left (RTL)
 */
export const RuleField = ({ basePath, field, control, disabledSeverities = [] }: RuleFieldProps) => {
  const name = `${basePath}.${field.name}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <Text strong style={{ fontSize: 14, width: 100, marginLeft: 12, flexShrink: 0 }}>
        {formatLabel(field.label)}
      </Text>

      {/* Use quarter width for compact fields */}
      <div
        style={{
          flex: 1,
          maxWidth:
            ['time', 'number'].includes(field.type) || ['duration', 'threshold', 'volume_unit'].includes(field.name) ?
              '25%'
            : undefined,
        }}
      >
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => {
            switch (field.type) {
              case 'number':
                return <InputNumber {...rhfField} min={0} style={{ width: '100%' }} />

              case 'boolean':
                return <Checkbox checked={rhfField.value} onChange={(e) => rhfField.onChange(e.target.checked)} />

              case 'time':
                return (
                  <TimePicker
                    value={rhfField.value ? dayjs(rhfField.value, 'HH:mm') : undefined}
                    onChange={(time) => rhfField.onChange(time ? time.format('HH:mm') : undefined)}
                    format='HH:mm'
                    style={{ width: '100%', direction: 'ltr' }}
                    classNames={{ popup: 'ltr-time-picker' }}
                    placeholder='HH:mm'
                  />
                )

              case 'severity':
                return (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['critical', 'major', 'info'] as const).map((sev) => {
                      const config = SEVERITY_CONFIG[sev]
                      const isDisabled = disabledSeverities.includes(sev)
                      const isSelected = rhfField.value === sev
                      return (
                        <div
                          key={sev}
                          onClick={() => !isDisabled && rhfField.onChange(sev)}
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
                    {...rhfField}
                    style={{ width: '100%' }}
                    options={field.options?.map((opt) => ({ value: opt, label: opt }))}
                  />
                )

              default: // text
                return <Input {...rhfField} />
            }
          }}
        />
      </div>
    </div>
  )
}

/**
 * Standalone field renderer (not connected to form)
 * Used in BindingsTab where fields use local state
 * Uses inline layout: label on right, input on left (RTL)
 */
export const StandaloneRuleField = ({
  field,
  value,
  onChange,
  disabledSeverities = [],
}: {
  field: FieldDef
  value?: any
  onChange?: (value: any) => void
  disabledSeverities?: string[]
}) => {
  const renderInput = () => {
    switch (field.type) {
      case 'number':
        return <InputNumber min={0} style={{ width: '100%' }} value={value} onChange={onChange} />

      case 'boolean':
        return <Checkbox checked={value} onChange={(e) => onChange?.(e.target.checked)} />

      case 'time':
        return (
          <TimePicker
            value={value ? dayjs(value, 'HH:mm') : undefined}
            onChange={(time) => onChange?.(time ? time.format('HH:mm') : undefined)}
            format='HH:mm'
            style={{ width: '100%', direction: 'ltr' }}
            classNames={{ popup: 'ltr-time-picker' }}
            placeholder='HH:mm'
          />
        )

      case 'severity':
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {(['critical', 'major', 'info'] as const).map((sev) => {
              const config = SEVERITY_CONFIG[sev]
              const isDisabled = disabledSeverities.includes(sev)
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
            style={{ width: '100%' }}
            value={value}
            onChange={onChange}
            options={field.options?.map((opt) => ({ value: opt, label: opt }))}
          />
        )

      default: // text
        return <Input value={value} onChange={(e) => onChange?.(e.target.value)} />
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <Text strong style={{ fontSize: 14, width: 100, marginLeft: 12, flexShrink: 0 }}>
        {formatLabel(field.label)}
      </Text>
      {/* Use quarter width for compact fields */}
      <div
        style={{
          flex: 1,
          maxWidth:
            ['time', 'number'].includes(field.type) || ['duration', 'threshold', 'volume_unit'].includes(field.name) ?
              '25%'
            : undefined,
        }}
      >
        {renderInput()}
      </div>
    </div>
  )
}
