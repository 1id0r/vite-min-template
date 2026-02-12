import { Controller } from 'react-hook-form'
import { Input, InputNumber, Checkbox, Select, Typography, TimePicker, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { SEVERITY_CONFIG, SEVERITY_LEVELS, formatLabel } from './constants'
import type { RuleFieldDef } from './ruleFieldUtils'
import './RuleField.css'

const { Text } = Typography

interface RuleFieldProps {
  basePath: string
  field: RuleFieldDef
  control: any
  disabledSeverities?: string[]
  /** Optional annotation text shown next to label (e.g., 'אופציונלי', 'חובה') */
  annotation?: string
}

/**
 * Unified field renderer for rule forms
 * Handles: text, number (min=0), boolean, select (with severity badges)
 * Uses inline layout: label on right, input on left (RTL)
 */
export const RuleField = ({ basePath, field, control, disabledSeverities = [], annotation }: RuleFieldProps) => {
  const name = `${basePath}.${field.name}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <Tooltip title={field.tooltip} placement='top'>
        <div style={{ width: 100, marginLeft: 12, flexShrink: 0 }}>
          <Text strong style={{ fontSize: 14, display: 'block' }}>
            {formatLabel(field.label)}
          </Text>
          {annotation && (
            <Text type='secondary' style={{ fontSize: 11, display: 'block' }}>
              {annotation}
            </Text>
          )}
        </div>
      </Tooltip>

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
                return (
                  <InputNumber
                    {...rhfField}
                    min={field.min ?? 0}
                    max={field.max}
                    placeholder={field.placeholder}
                    style={{ width: '100%' }}
                    suffix={field.suffix}
                  />
                )

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
                  <div
                    style={{ display: 'inline-flex', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}
                  >
                    {SEVERITY_LEVELS.map((sev) => {
                      const config = SEVERITY_CONFIG[sev]
                      const isDisabled = disabledSeverities.includes(sev)
                      const isSelected = rhfField.value === sev
                      return (
                        <div
                          key={sev}
                          onClick={() => !isDisabled && rhfField.onChange(sev)}
                          style={{
                            padding: '4px 14px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            backgroundColor: isSelected ? '#1677ff' : 'transparent',
                            color:
                              isSelected ? '#fff'
                              : isDisabled ? '#bfbfbf'
                              : '#595959',
                            borderRight: 'none',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: 13,
                            transition: 'all 0.15s ease',
                            opacity: isDisabled ? 0.45 : 1,
                            lineHeight: '22px',
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
  annotation,
}: {
  field: RuleFieldDef
  value?: any
  onChange?: (value: any) => void
  disabledSeverities?: string[]
  annotation?: string
}) => {
  const renderInput = () => {
    switch (field.type) {
      case 'number':
        return (
          <InputNumber
            min={field.min ?? 0}
            max={field.max}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
            value={value}
            onChange={onChange}
            suffix={field.suffix}
          />
        )

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
          <div style={{ display: 'inline-flex', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
            {SEVERITY_LEVELS.map((sev) => {
              const config = SEVERITY_CONFIG[sev]
              const isDisabled = disabledSeverities.includes(sev)
              const isSelected = value === sev
              return (
                <div
                  key={sev}
                  onClick={() => !isDisabled && onChange?.(sev)}
                  style={{
                    padding: '4px 14px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isSelected ? '#1677ff' : 'transparent',
                    color:
                      isSelected ? '#fff'
                      : isDisabled ? '#bfbfbf'
                      : '#595959',
                    borderRight: 'none',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: 13,
                    transition: 'all 0.15s ease',
                    opacity: isDisabled ? 0.45 : 1,
                    lineHeight: '22px',
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
            options={field.options?.map((opt: string) => ({ value: opt, label: opt }))}
          />
        )

      default: // text
        return <Input value={value} onChange={(e) => onChange?.(e.target.value)} />
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <Tooltip title={field.tooltip} placement='top'>
        <div style={{ width: 100, marginLeft: 12, flexShrink: 0 }}>
          <Text strong style={{ fontSize: 14, display: 'block' }}>
            {formatLabel(field.label)}
          </Text>
          {annotation && (
            <Text type='secondary' style={{ fontSize: 11, display: 'block' }}>
              {annotation}
            </Text>
          )}
        </div>
      </Tooltip>
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
