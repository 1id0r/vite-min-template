import { Controller } from 'react-hook-form'
import { Input, InputNumber, Checkbox, Select, Typography } from 'antd'
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
                  <div style={{ display: 'flex', gap: 8, direction: 'ltr' }}>
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
                            backgroundColor: isSelected ? config.color : isDisabled ? '#f5f5f5' : '#fafafa',
                            color: isSelected ? '#fff' : isDisabled ? '#bfbfbf' : '#595959',
                            border: `1px solid ${isSelected ? config.color : isDisabled ? '#d9d9d9' : '#e8e8e8'}`,
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
        <div style={{ display: 'flex', gap: 8, direction: 'ltr' }}>
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
                  backgroundColor: isSelected ? config.color : isDisabled ? '#f5f5f5' : '#fafafa',
                  color: isSelected ? '#fff' : isDisabled ? '#bfbfbf' : '#595959',
                  border: `1px solid ${isSelected ? config.color : isDisabled ? '#d9d9d9' : '#e8e8e8'}`,
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
