import { useMemo, type ReactElement } from 'react'
import { Alert, Box, Button, Center, Grid, Group, Loader, Paper, Stack, Text } from '@mantine/core'
import FormComponent, { withTheme, type IChangeEvent } from '@rjsf/core'
import { Theme as MantineTheme } from '@rjsf/mantine'
import validator from '@rjsf/validator-ajv8'
import type { ObjectFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils'
import type { FormDefinition } from '../../types/entity'
import { AsyncSelectWidget } from '../form-widgets/AsyncSelectWidget'
import type { FormStatus } from './types'
import { useAsyncValidation, type AsyncValidationFieldConfig, type AsyncValidationStatus } from '../../hooks/useAsyncValidation'

const RjsfForm = withTheme(MantineTheme)

export type RjsfFormRef = InstanceType<typeof FormComponent>

const shouldSpanFullWidth = (schema: RJSFSchema, uiSchema: UiSchema) => {
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

type TemplatePropsWithContext = ObjectFieldTemplateProps & {
  formContext?: {
    asyncValidationStatus?: Record<string, AsyncValidationStatus>
  }
}

type FieldContentProps = {
  schema?: RJSFSchema
  uiSchema?: UiSchema
}

const FormObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const { properties, title, description } = props
  const formContext = (props as TemplatePropsWithContext).formContext
  const asyncStatusMap = (formContext?.asyncValidationStatus ?? {}) as Record<string, AsyncValidationStatus>
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
              schema?: RJSFSchema
              uiSchema?: UiSchema
            }
            const meta = property as PropertyMeta
            const contentProps =
              ((property.content as ReactElement<FieldContentProps>)?.props as FieldContentProps | undefined) ?? {}
            const schema = (contentProps.schema ?? meta.schema ?? {}) as RJSFSchema
            const uiSchema = (contentProps.uiSchema ?? meta.uiSchema ?? {}) as UiSchema
            const options = (uiSchema['ui:options'] ?? {}) as Record<string, unknown>
            const spanOption = typeof options.colSpan === 'number' ? options.colSpan : undefined
            const shouldFull = shouldSpanFullWidth(schema, uiSchema)
            const desiredSpan = spanOption ?? (shouldFull ? 12 : 6)
            const span = Math.min(12, Math.max(1, desiredSpan))

            return (
              <Grid.Col key={property.name} span={{ base: 12, sm: span }}>
                <Stack gap={4}>
                  {property.content}
                  {asyncStatusMap[property.name] === 'loading' && (
                    <Group justify='flex-end' gap='xs'>
                      <Loader size='xs' />
                      <Text size='xs' c='dimmed'>
                        בודק זמינות...
                      </Text>
                    </Group>
                  )}
                </Stack>
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
  AsyncSelect: AsyncSelectWidget,
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
  const asyncConfigs = useMemo(
    () => extractAsyncValidationConfigs(definition?.uiSchema),
    [definition?.uiSchema]
  )
  const stepFormData = (formData as Record<string, unknown>) ?? undefined
  const { extraErrors, statusMap } = useAsyncValidation(stepFormData, asyncConfigs)

  const containerStyle = fullHeight
    ? {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
      }
    : {}

  const combinedUiSchema = useMemo(
    () => ({
      'ui:submitButtonOptions': {
        norender: true,
      },
      ...(definition?.uiSchema ?? {}),
    }),
    [definition?.uiSchema]
  )
  const formContextValue = useMemo(
    () => ({ asyncValidationStatus: statusMap }),
    [statusMap]
  )

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

  if (!definition) {
    return (
      <Paper p='md' shadow='none' withBorder={false} style={containerStyle}>
        <Center style={fullHeight ? { flex: 1 } : undefined}>
          <Loader size='sm' />
        </Center>
      </Paper>
    )
  }

  const ensuredDefinition = definition

  return (
    <Paper p='md' shadow='none' withBorder={false} style={containerStyle}>
      <Box style={fullHeight ? { display: 'flex', flexDirection: 'column', flex: 1 } : undefined}>
        <RjsfForm
          schema={ensuredDefinition.schema}
          uiSchema={combinedUiSchema}
          formData={formData}
          validator={validator}
          extraErrors={extraErrors}
          liveValidate
          ref={attachRef}
          widgets={formWidgets}
          formContext={formContextValue}
          templates={{ ObjectFieldTemplate: FormObjectFieldTemplate }}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </Box>
    </Paper>
  )
}

function extractAsyncValidationConfigs(uiSchema?: UiSchema): AsyncValidationFieldConfig[] {
  if (!uiSchema) {
    return []
  }

  return Object.entries(uiSchema).reduce<AsyncValidationFieldConfig[]>((acc, [fieldKey, config]) => {
    if (!config || typeof config !== 'object') {
      return acc
    }

    const options = (config as Record<string, unknown>)['ui:options']
    if (!options || typeof options !== 'object') {
      return acc
    }

    const asyncOptions = (options as Record<string, unknown>).asyncValidation as
      | {
          validationRoute?: string
          debounceMs?: number
          duplicateMessage?: string
          serverMessage?: string
          field?: string
        }
      | undefined

    if (!asyncOptions?.validationRoute) {
      return acc
    }

    acc.push({
      field: asyncOptions.field ?? fieldKey,
      validationRoute: asyncOptions.validationRoute,
      debounceMs: asyncOptions.debounceMs,
      messages: {
        duplicate: asyncOptions.duplicateMessage,
        server: asyncOptions.serverMessage,
      },
    })

    return acc
  }, [])
}
