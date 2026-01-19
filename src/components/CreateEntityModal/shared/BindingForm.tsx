/**
 * BindingForm - Unified schema-driven binding form
 *
 * Supports both React Hook Form and standard controlled mode.
 * Special handling for grouped fields like scheduleInterval + scheduleUnit.
 */

import { memo } from 'react'
import { Controller } from 'react-hook-form'
import { InputNumber, Segmented, Typography } from 'antd'
import { getBindingFieldConfig, type FieldConfig } from '../../../schemas/fieldConfigs'
import { GenericFormField } from './GenericFormField'

const { Text } = Typography

interface BindingFormProps {
  bindingType: 'url' | 'elastic'
  basePath?: string // e.g., 'urls.0' (for RHF)
  control?: any // (for RHF)
  value?: any // (for Controlled)
  onChange?: (val: any) => void // (for Controlled)
}

export const BindingForm = memo(function BindingForm({
  bindingType,
  basePath,
  control,
  value,
  onChange,
}: BindingFormProps) {
  const config = getBindingFieldConfig(bindingType)

  if (!config) return null

  // Fields that should be grouped together
  const groupedFields = new Set(['scheduleInterval', 'scheduleUnit'])
  const fieldsToRender = config.fields.filter((f) => !groupedFields.has(f.name))

  // Check if we need to render the grouped schedule fields
  const scheduleIntervalField = config.fields.find((f) => f.name === 'scheduleInterval')
  const scheduleUnitField = config.fields.find((f) => f.name === 'scheduleUnit')
  const hasScheduleGroup = scheduleIntervalField && scheduleUnitField

  return (
    <>
      {/* Render schedule fields grouped together */}
      {hasScheduleGroup && (
        <ScheduleFieldGroup
          intervalField={scheduleIntervalField}
          unitField={scheduleUnitField}
          basePath={basePath}
          control={control}
          value={value}
          onChange={onChange}
        />
      )}

      {/* Render remaining fields normally */}
      {fieldsToRender.map((field: FieldConfig) => (
        <GenericFormField
          key={field.name}
          field={field}
          name={basePath ? `${basePath}.${field.name}` : undefined}
          control={control}
          value={value ? value[field.name] : undefined}
          onChange={(val) => {
            if (onChange) {
              onChange({ ...value, [field.name]: val })
            }
          }}
          layout='inline'
        />
      ))}
    </>
  )
})

/**
 * ScheduleFieldGroup - Renders scheduleInterval + scheduleUnit on the same row
 */
const ScheduleFieldGroup = memo(function ScheduleFieldGroup({
  intervalField,
  unitField,
  basePath,
  control,
  value,
  onChange,
}: {
  intervalField: FieldConfig
  unitField: FieldConfig
  basePath?: string
  control?: any
  value?: any
  onChange?: (val: any) => void
}) {
  const labelWidth = 100

  // RHF mode
  if (control && basePath) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14, width: labelWidth, marginLeft: 16, textAlign: 'right', flexShrink: 0 }}>
          {intervalField.label}
        </Text>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Controller
            name={`${basePath}.${intervalField.name}`}
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={intervalField.min} max={intervalField.max} style={{ width: 80 }} />
            )}
          />
          <Controller
            name={`${basePath}.${unitField.name}`}
            control={control}
            render={({ field }) => (
              <Segmented value={field.value} onChange={field.onChange} options={unitField.options || []} size='small' />
            )}
          />
        </div>
      </div>
    )
  }

  // Controlled mode
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
      <Text strong style={{ fontSize: 14, width: labelWidth, marginLeft: 16, textAlign: 'right', flexShrink: 0 }}>
        {intervalField.label}
      </Text>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <InputNumber
          value={value?.[intervalField.name]}
          onChange={(val) => onChange?.({ ...value, [intervalField.name]: val })}
          min={intervalField.min}
          max={intervalField.max}
          style={{ width: 80 }}
        />
        <Segmented
          value={value?.[unitField.name]}
          onChange={(val) => onChange?.({ ...value, [unitField.name]: val })}
          options={unitField.options || []}
          size='small'
        />
      </div>
    </div>
  )
})
