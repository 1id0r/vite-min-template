import { Alert, Box, Button, Center, Grid, Loader, Paper, Stack, Text } from '@mantine/core'
import FormComponent, { withTheme, type IChangeEvent } from '@rjsf/core'
import { Theme as MantineTheme } from '@rjsf/mantine'
import validator from '@rjsf/validator-ajv8'
import type { ObjectFieldTemplateProps } from '@rjsf/utils'
import type { FormDefinition } from '../../types/entity'
import { OwningTeamAsyncSelect } from '../form-widgets/OwningTeamAsyncSelect'
import type { FormStatus } from './types'

const RjsfForm = withTheme(MantineTheme)

export type RjsfFormRef = InstanceType<typeof FormComponent>

const shouldSpanFullWidth = (schema: Record<string, unknown>, uiSchema: Record<string, unknown>) => {
  const typeValue = schema.type
  const types = Array.isArray(typeValue) ? typeValue : typeValue ? [typeValue] : []
  const widget = uiSchema['ui:widget']
  const options = (uiSchema['ui:options'] ?? {}) as Record<string, unknown>
  const colSpanOption = options.colSpan

  if (typeof colSpanOption === 'number') {
    return colSpanOption >= 12
  }

  if (widget === 'textarea') {
    return true
  }

  if (types.includes('array') || types.includes('object')) {
    return true
  }

  return false
}

const FormObjectFieldTemplate = ({ properties, title, description }: ObjectFieldTemplateProps) => {
  const visible = properties.filter((property) => !property.hidden)
  const hidden = properties.filter((property) => property.hidden)

  return (
    <>
      <Stack gap='sm'>
        {title && (
          <Text fw={600} size='sm'>
            {title}
          </Text>
        )}
        {description && (
          <Text size='sm' c='dimmed'>
            {description}
          </Text>
        )}
        <Grid gutter='md'>
          {visible.map((property) => {
            type PropertyMeta = {
              schema?: Record<string, unknown>
              uiSchema?: Record<string, unknown>
            }
            const meta = property as PropertyMeta
            const schema = ((property.content as any)?.props?.schema ?? meta.schema ?? {}) as Record<
              string,
              unknown
            >
            const uiSchema = ((property.content as any)?.props?.uiSchema ?? meta.uiSchema ?? {}) as Record<
              string,
              unknown
            >
            const options = (uiSchema['ui:options'] ?? {}) as Record<string, unknown>
            const spanOption = typeof options.colSpan === 'number' ? options.colSpan : undefined
            const shouldFull = shouldSpanFullWidth(schema, uiSchema)
            const desiredSpan = spanOption ?? (shouldFull ? 12 : 6)
            const span = Math.min(12, Math.max(1, desiredSpan))

            return (
              <Grid.Col key={property.name} span={{ base: 12, sm: span }}>
                {property.content}
              </Grid.Col>
            )
          })}
        </Grid>
      </Stack>
      {hidden.map((property) => (
        <Box key={property.name} style={{ display: 'none' }}>
          {property.content}
        </Box>
      ))}
    </>
  )
}

const formWidgets = {
  OwningTeamAsyncSelect,
}

interface FormStepCardProps {
  status?: FormStatus
  definition?: FormDefinition
  error?: string
  formData: unknown
  attachRef: (ref: RjsfFormRef | null) => void
  onChange: (change: IChangeEvent) => void
  onSubmit: (change: IChangeEvent) => void
  onRetry: () => void
  fullHeight?: boolean
}

export function FormStepCard({
  status,
  definition,
  error,
  formData,
  attachRef,
  onChange,
  onSubmit,
  onRetry,
  fullHeight = false,
}: FormStepCardProps) {
  const paperStyle = fullHeight
    ? {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
      }
    : undefined

  if (status === 'error' && !definition) {
    return (
      <Paper withBorder shadow='xs' p='md' style={paperStyle}>
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

  if (!definition) {
    return (
      <Paper withBorder shadow='xs' p='md' style={paperStyle}>
        <Center style={fullHeight ? { flex: 1 } : undefined}>
          <Loader size='sm' />
        </Center>
      </Paper>
    )
  }

  const combinedUiSchema = {
    'ui:submitButtonOptions': {
      norender: true,
    },
    ...(definition.uiSchema ?? {}),
  }

  return (
    <Paper withBorder shadow='xs' p='md' style={paperStyle}>
      <Box style={fullHeight ? { display: 'flex', flexDirection: 'column', flex: 1 } : undefined}>
        <RjsfForm
          schema={definition.schema}
          uiSchema={combinedUiSchema}
          formData={formData}
          validator={validator}
          liveValidate
          ref={attachRef}
          widgets={formWidgets}
          templates={{ ObjectFieldTemplate: FormObjectFieldTemplate }}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </Box>
    </Paper>
  )
}
