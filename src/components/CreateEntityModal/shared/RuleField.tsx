import { Controller } from 'react-hook-form'
import { Input, InputNumber, Checkbox, Select, Typography, Tag } from 'antd'
import { SEVERITY_CONFIG, formatLabel } from './constants'

const { Text } = Typography

interface FieldDef {
  name: string
  type: 'text' | 'number' | 'boolean' | 'select'
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
 */
export const RuleField = ({ basePath, field, control, disabledSeverities = [] }: RuleFieldProps) => {
  const name = `${basePath}.${field.name}`

  return (
    <div style={{ marginBottom: 8 }}>
      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
        {formatLabel(field.label)}
      </Text>

      <Controller
        name={name}
        control={control}
        render={({ field: rhfField }) => {
          switch (field.type) {
            case 'number':
              return <InputNumber {...rhfField} min={0} style={{ width: '100%' }} />

            case 'boolean':
              return <Checkbox checked={rhfField.value} onChange={(e) => rhfField.onChange(e.target.checked)} />

            case 'select':
              if (field.name === 'severity') {
                return (
                  <Select
                    {...rhfField}
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: 'critical',
                        label: <Tag color='red'>Critical</Tag>,
                        disabled: disabledSeverities.includes('critical'),
                      },
                      {
                        value: 'major',
                        label: <Tag color='orange'>Major</Tag>,
                        disabled: disabledSeverities.includes('major'),
                      },
                      {
                        value: 'info',
                        label: <Tag color='blue'>Info</Tag>,
                        disabled: disabledSeverities.includes('info'),
                      },
                    ]}
                    optionRender={(option) => {
                      const config = SEVERITY_CONFIG[option.value as keyof typeof SEVERITY_CONFIG]
                      const isDisabled = disabledSeverities.includes(option.value as string)
                      return (
                        <Tag color={config?.color} style={isDisabled ? { opacity: 0.5 } : undefined}>
                          {config?.label} {isDisabled && '(בשימוש)'}
                        </Tag>
                      )
                    }}
                  />
                )
              }
              return (
                <Select
                  {...rhfField}
                  style={{ width: '100%' }}
                  options={field.options?.map((opt) => ({ value: opt, label: opt }))}
                />
              )

            default:
              return <Input {...rhfField} />
          }
        }}
      />
    </div>
  )
}

/**
 * Standalone field renderer (not connected to form)
 * Used in BindingsTab where fields use local state
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
  return (
    <div style={{ marginBottom: 8 }}>
      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
        {formatLabel(field.label)}
      </Text>

      {field.type === 'number' && <InputNumber min={0} style={{ width: '100%' }} value={value} onChange={onChange} />}

      {field.type === 'boolean' && <Checkbox checked={value} onChange={(e) => onChange?.(e.target.checked)} />}

      {field.type === 'select' && field.name === 'severity' && (
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          options={[
            {
              value: 'critical',
              label: <Tag color='red'>Critical</Tag>,
              disabled: disabledSeverities.includes('critical'),
            },
            { value: 'major', label: <Tag color='orange'>Major</Tag>, disabled: disabledSeverities.includes('major') },
            { value: 'info', label: <Tag color='blue'>Info</Tag>, disabled: disabledSeverities.includes('info') },
          ]}
          optionRender={(option) => {
            const config = SEVERITY_CONFIG[option.value as keyof typeof SEVERITY_CONFIG]
            const isDisabled = disabledSeverities.includes(option.value as string)
            return (
              <Tag color={config?.color} style={isDisabled ? { opacity: 0.5 } : undefined}>
                {config?.label} {isDisabled && '(בשימוש)'}
              </Tag>
            )
          }}
        />
      )}

      {field.type === 'select' && field.name !== 'severity' && (
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={onChange}
          options={field.options?.map((opt) => ({ value: opt, label: opt }))}
        />
      )}

      {field.type === 'text' && <Input value={value} onChange={(e) => onChange?.(e.target.value)} />}
    </div>
  )
}
