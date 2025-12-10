import { useEffect } from 'react'
import { Alert, Box, Button, Center, Grid, Loader, Paper, Stack, Text } from '@mantine/core'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormDefinition } from '../../types/entity'
import type { FormStatus } from './types'
import { FormField } from '../FormFields/FormField'
import type { FormFieldsConfig } from '../../schemas/fieldConfigs'

export type FormStepRef = UseFormReturn<any>

interface FormStepCardProps {
  status?: FormStatus
  definition?: FormDefinition
  fieldConfig?: FormFieldsConfig
  error?: string
  formData: unknown
  attachRef: (ref: FormStepRef | null) => void
  onChange: (data: unknown) => void
  onRetry: () => void
  fullHeight?: boolean
}

export function FormStepCard({
  status,
  definition,
  fieldConfig,
  error,
  formData,
  attachRef,
  onChange,
  onRetry,
  fullHeight = false,
}: FormStepCardProps) {
  const containerStyle = fullHeight
    ? {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
      }
    : {}

  // Initialize form with schema and resolver
  const form = useForm({
    resolver: definition?.schema ? zodResolver(definition.schema) : undefined,
    defaultValues: formData ?? definition?.initialData ?? {},
    mode: 'onSubmit', // Only validate when user submits
    reValidateMode: 'onChange', // Re-validate on change after first submit
  })

  const { control, watch, reset } = form

  // Attach form ref for parent access
  useEffect(() => {
    attachRef(form)
    return () => attachRef(null)
  }, [form, attachRef])

  // Watch form values and notify parent using watch's callback (avoids render loop)
  useEffect(() => {
    const subscription = watch((value) => {
      onChange(value)
    })
    return () => subscription.unsubscribe()
  }, [watch, onChange])

  // Reset form only when schema/definition changes (not when formData changes from user input)
  // This prevents reset loops while still allowing external data updates
  useEffect(() => {
    if (definition) {
      reset(formData ?? definition.initialData ?? {})
    }
  }, [definition?.schema, reset]) // Only depend on schema, not formData

  if (status === 'error' && !definition) {
    return (
      <Paper p='md' shadow='none' withBorder={false} style={containerStyle}>
        <Stack gap='sm'>
          <Alert color='red' title='Failed to load form'>
            {error ?? 'Unable to fetch the form definition. Try again.'}
          </Alert>
          <Button size='xs' variant='light' onClick={onRetry} style={{ alignSelf: 'flex-end' }}>
            Retry
          </Button>
        </Stack>
      </Paper>
    )
  }

  if (!definition || !fieldConfig) {
    return (
      <Paper p='md' shadow='none' withBorder={false} style={containerStyle}>
        <Center style={fullHeight ? { flex: 1 } : undefined}>
          <Loader size='sm' />
        </Center>
      </Paper>
    )
  }

  return (
    <Paper p='md' shadow='none' withBorder={false} style={containerStyle}>
      <Box style={fullHeight ? { display: 'flex', flexDirection: 'column', flex: 1 } : undefined}>
        {/* Removed onSubmit handler to prevent Enter key from auto-submitting */}
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack gap='sm' align='stretch'>
            {fieldConfig.title && (
              <Text fw={600} size='sm'>
                {fieldConfig.title}
              </Text>
            )}
            <Grid gutter='md'>
              {fieldConfig.fields.map((field) => (
                <FormField key={field.name} config={field} control={control} />
              ))}
            </Grid>
          </Stack>
        </form>
      </Box>
    </Paper>
  )
}
