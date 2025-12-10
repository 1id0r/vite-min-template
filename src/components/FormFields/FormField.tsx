import { Checkbox, Grid, NumberInput, Select, TextInput, Textarea } from '@mantine/core'
import { type Control, Controller } from 'react-hook-form'
import type { FieldConfig } from '../../schemas/fieldConfigs'
import { LinksField } from '../FormFields/LinksField'
import { AsyncSelectField } from '../FormFields/AsyncSelectField'

interface FormFieldProps {
  config: FieldConfig
  control: Control<any>
}

export function FormField({ config, control }: FormFieldProps) {
  const { name, type, label, placeholder, disabled, colSpan = 6, options, asyncOptions, required } = config

  const span = Math.min(12, Math.max(1, colSpan))

  return (
    <Grid.Col span={{ base: 12, sm: span }}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const error = fieldState.error?.message

          switch (type) {
            case 'textarea':
              return (
                <Textarea
                  {...field}
                  label={label}
                  placeholder={placeholder}
                  disabled={disabled}
                  error={error}
                  withAsterisk={required}
                />
              )

            case 'number':
              return (
                <NumberInput
                  {...field}
                  label={label}
                  placeholder={placeholder}
                  disabled={disabled}
                  error={error}
                  withAsterisk={required}
                  onChange={(val) => field.onChange(val)}
                />
              )

            case 'boolean':
              return (
                <Checkbox
                  {...field}
                  label={label}
                  disabled={disabled}
                  checked={field.value ?? false}
                  onChange={(event) => field.onChange(event.currentTarget.checked)}
                />
              )

            case 'select':
              return (
                <Select
                  {...field}
                  label={label}
                  placeholder={placeholder}
                  disabled={disabled}
                  error={error}
                  data={options ?? []}
                  withAsterisk={required}
                />
              )

            case 'async-select':
              return (
                <AsyncSelectField
                  value={field.value}
                  onChange={field.onChange}
                  label={label}
                  error={error}
                  required={required}
                  asyncOptions={asyncOptions}
                />
              )

            case 'links-array':
              return <LinksField value={field.value ?? []} onChange={field.onChange} error={error} />

            case 'text':
            default:
              return (
                <TextInput
                  {...field}
                  label={label}
                  placeholder={placeholder}
                  disabled={disabled}
                  error={error}
                  value={field.value ?? ''}
                  withAsterisk={required}
                />
              )
          }
        }}
      />
    </Grid.Col>
  )
}
