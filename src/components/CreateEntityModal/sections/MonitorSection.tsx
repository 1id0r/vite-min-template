/**
 * MonitorSection - Dynamic Monitor Configuration (פרטי היישות)
 *
 * Renders system-specific monitor fields based on the selected system.
 * Uses field configs from fieldConfigs.ts to generate the form.
 * Includes a "בדוק ולידציה" (Check Validation) button for future validation integration.
 */

import { memo, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Box, Grid, Text, TextInput, NumberInput, Checkbox, Textarea, Select, Button, Stack } from '@mantine/core'
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

  const handleValidate = () => {
    // Placeholder for future validation integration
    console.log('Validate button clicked - will connect to validation component later')
  }

  return (
    <Box>
      <Text size='sm' fw={700} c='gray.8' mb='xs' dir='rtl'>
        פרטי היישות
      </Text>
      <Stack gap='md'>
        {/* Dynamic Fields */}
        <Grid gutter='md'>
          {fieldConfig.fields.map((field) => (
            <Grid.Col key={field.name} span={12}>
              <MonitorField field={field} control={control} error={(errors.monitor as any)?.[field.name]?.message} />
            </Grid.Col>
          ))}
        </Grid>

        {/* Validate Button */}
        <Button variant='outline' color='gray' size='sm' onClick={handleValidate} style={{ alignSelf: 'flex-start' }}>
          בדוק ולידציה
        </Button>
      </Stack>
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

  // Common label style matching mock design
  const labelStyles = {
    label: { fontWeight: 600 },
    input: { textAlign: 'right' as const },
  }

  switch (field.type) {
    case 'text':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <TextInput
              label={field.label}
              placeholder={field.placeholder || 'הזן שדה'}
              required={field.required}
              disabled={field.disabled}
              error={error}
              dir='rtl'
              {...rhfField}
              value={rhfField.value || ''}
              styles={labelStyles}
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
              placeholder={field.placeholder || 'הזן שדה'}
              required={field.required}
              disabled={field.disabled}
              error={error}
              dir='rtl'
              value={rhfField.value || ''}
              onChange={rhfField.onChange}
              styles={labelStyles}
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
              placeholder={field.placeholder || 'הזן שדה'}
              required={field.required}
              disabled={field.disabled}
              error={error}
              dir='rtl'
              {...rhfField}
              value={rhfField.value || ''}
              styles={labelStyles}
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
              placeholder={field.placeholder || 'בחר'}
              required={field.required}
              disabled={field.disabled}
              error={error}
              dir='rtl'
              data={field.options || []}
              value={rhfField.value || null}
              onChange={rhfField.onChange}
              styles={labelStyles}
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
              placeholder={field.asyncOptions?.placeholder || 'בחר...'}
              required={field.required}
              disabled={field.disabled}
              error={error}
              dir='rtl'
              data={[]} // Would be loaded from API
              value={rhfField.value || null}
              onChange={rhfField.onChange}
              styles={labelStyles}
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
