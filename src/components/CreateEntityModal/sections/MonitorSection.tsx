/**
 * MonitorSection - Dynamic Monitor Configuration (פרטי היישות)
 *
 * Renders system-specific monitor fields based on the selected system.
 * Uses field configs from fieldConfigs.ts to generate the form.
 * Includes a "בדוק ולידציה" (Check Validation) button for future validation integration.
 */

import { memo, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input, InputNumber, Checkbox, Select, Button, Space, Typography } from 'antd'
import { getMonitorFieldConfig, type FieldConfig } from '../../../schemas/fieldConfigs'
import type { EntityFormData } from '../hooks/useEntityForm'

const { Text } = Typography
const { TextArea } = Input

interface MonitorSectionProps {
  systemId: string
}

export const MonitorSection = memo(function MonitorSection({ systemId }: MonitorSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<EntityFormData>()

  // Get field config for this system
  const fieldConfig = useMemo(() => getMonitorFieldConfig(systemId), [systemId])

  if (!fieldConfig || fieldConfig.fields.length === 0) {
    return null
  }

  const handleValidate = () => {
    // Placeholder for future validation integration
    console.log('Validate button clicked - will connect to validation component later')
  }

  return (
    <div
      style={{
        direction: 'rtl',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '24px',
      }}
    >
      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16, textAlign: 'right' }}>
        פרטי היישות
      </Text>
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {/* Dynamic Fields */}
        {fieldConfig.fields.map((field) => (
          <MonitorField
            key={field.name}
            field={field}
            control={control}
            error={(errors.monitor as any)?.[field.name]?.message}
          />
        ))}

        {/* Validate Button */}
        <Button onClick={handleValidate}>בדוק ולידציה</Button>
      </Space>
    </div>
  )
})

MonitorSection.displayName = 'MonitorSection'

// ─────────────────────────────────────────────────────────────────────────────
// Monitor Field Component
// ─────────────────────────────────────────────────────────────────────────────

interface MonitorFieldProps {
  field: FieldConfig
  control: any
  error?: string
}

const MonitorField = memo(function MonitorField({ field, control, error }: MonitorFieldProps) {
  const name = `monitor.${field.name}` as const

  const labelStyle = { fontSize: 14, width: 100, marginLeft: 16 }

  switch (field.type) {
    case 'text':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={labelStyle}>
                {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
              </Text>
              <Input
                placeholder={field.placeholder || 'הזן שדה'}
                disabled={field.disabled}
                status={error ? 'error' : undefined}
                {...rhfField}
                value={rhfField.value || ''}
                style={{ flex: 1, direction: 'rtl' }}
              />
              {error && (
                <Text type='danger' style={{ fontSize: 12, marginRight: 8 }}>
                  {error}
                </Text>
              )}
            </div>
          )}
        />
      )

    case 'number':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={labelStyle}>
                {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
              </Text>
              <InputNumber
                placeholder={field.placeholder || 'הזן שדה'}
                disabled={field.disabled}
                status={error ? 'error' : undefined}
                value={rhfField.value || undefined}
                onChange={rhfField.onChange}
                style={{ flex: 1, direction: 'rtl', width: 'auto' }}
              />
              {error && (
                <Text type='danger' style={{ fontSize: 12, marginRight: 8 }}>
                  {error}
                </Text>
              )}
            </div>
          )}
        />
      )

    case 'textarea':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <div style={{ display: 'flex', alignItems: 'start' }}>
              <Text strong style={{ ...labelStyle, marginTop: 5 }}>
                {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
              </Text>
              <div style={{ flex: 1 }}>
                <TextArea
                  placeholder={field.placeholder || 'הזן שדה'}
                  disabled={field.disabled}
                  status={error ? 'error' : undefined}
                  {...rhfField}
                  value={rhfField.value || ''}
                  style={{ direction: 'rtl', width: '100%' }}
                  rows={3}
                />
                {error && (
                  <Text type='danger' style={{ fontSize: 12, display: 'block' }}>
                    {error}
                  </Text>
                )}
              </div>
            </div>
          )}
        />
      )

    case 'boolean':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <Checkbox
              disabled={field.disabled}
              checked={rhfField.value || false}
              onChange={(e) => rhfField.onChange(e.target.checked)}
            >
              {field.label}
            </Checkbox>
          )}
        />
      )

    case 'select':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={labelStyle}>
                {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
              </Text>
              <Select
                placeholder={field.placeholder || 'בחר'}
                disabled={field.disabled}
                status={error ? 'error' : undefined}
                options={field.options}
                value={rhfField.value || undefined}
                onChange={rhfField.onChange}
                style={{ flex: 1, direction: 'rtl' }}
              />
              {error && (
                <Text type='danger' style={{ fontSize: 12, marginRight: 8 }}>
                  {error}
                </Text>
              )}
            </div>
          )}
        />
      )

    case 'async-select':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={labelStyle}>
                {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
              </Text>
              <Select
                placeholder={field.asyncOptions?.placeholder || 'בחר...'}
                disabled={field.disabled}
                status={error ? 'error' : undefined}
                options={[]} // Would be loaded from API
                value={rhfField.value || undefined}
                onChange={rhfField.onChange}
                style={{ flex: 1, direction: 'rtl' }}
                showSearch
              />
              {error && (
                <Text type='danger' style={{ fontSize: 12, marginRight: 8 }}>
                  {error}
                </Text>
              )}
            </div>
          )}
        />
      )

    default:
      return null
  }
})

MonitorField.displayName = 'MonitorField'
