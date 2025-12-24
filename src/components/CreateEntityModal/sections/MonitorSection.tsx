/**
 * MonitorSection - Dynamic Monitor Configuration
 *
 * Renders system-specific monitor fields based on the selected system.
 * Uses field configs from fieldConfigs.ts to generate the form.
 */

import { memo, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Box, Grid, Text, TextInput, NumberInput, Checkbox, Textarea, Select, Divider } from '@mantine/core'
import { getMonitorFieldConfig, type FieldConfig } from '../../../schemas/fieldConfigs'
import type { EntityFormData } from '../hooks/useEntityForm'

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

  return (
    <Box>
      <Text size='sm' fw={700} c='gray.8' mb='xs' dir='rtl'>
        {fieldConfig.title || 'פרטי מוניטור'}
      </Text>
      <Grid gutter='md'>
        {fieldConfig.fields.map((field) => (
          <Grid.Col key={field.name} span={field.colSpan || 6}>
            <MonitorField field={field} control={control} error={(errors.monitor as any)?.[field.name]?.message} />
          </Grid.Col>
        ))}
      </Grid>
      <Divider my='md' />
    </Box>
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

  switch (field.type) {
    case 'text':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <TextInput
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              error={error}
              {...rhfField}
              value={rhfField.value || ''}
              styles={{ label: { fontWeight: 600 } }}
            />
          )}
        />
      )

    case 'number':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <NumberInput
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              error={error}
              value={rhfField.value || ''}
              onChange={rhfField.onChange}
              styles={{ label: { fontWeight: 600 } }}
            />
          )}
        />
      )

    case 'textarea':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <Textarea
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              error={error}
              {...rhfField}
              value={rhfField.value || ''}
              styles={{ label: { fontWeight: 600 } }}
            />
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
              label={field.label}
              disabled={field.disabled}
              checked={rhfField.value || false}
              onChange={rhfField.onChange}
              mt='md'
            />
          )}
        />
      )

    case 'select':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <Select
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              error={error}
              data={field.options || []}
              value={rhfField.value || null}
              onChange={rhfField.onChange}
              styles={{ label: { fontWeight: 600 } }}
            />
          )}
        />
      )

    case 'async-select':
      // TODO: Implement async select with API loading
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <Select
              label={field.label}
              placeholder={field.asyncOptions?.placeholder || 'Select...'}
              required={field.required}
              disabled={field.disabled}
              error={error}
              data={[]} // Would be loaded from API
              value={rhfField.value || null}
              onChange={rhfField.onChange}
              styles={{ label: { fontWeight: 600 } }}
              searchable
            />
          )}
        />
      )

    default:
      return null
  }
})

MonitorField.displayName = 'MonitorField'
