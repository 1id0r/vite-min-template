import { useMemo, type ReactElement, type ReactNode } from 'react'
import { Alert, Box, Button, Center, Grid, Group, Loader, Paper, Stack, Text, ActionIcon, Flex } from '@mantine/core'
import FormComponent, { withTheme, type IChangeEvent } from '@rjsf/core'
import { Theme as MantineTheme } from '@rjsf/mantine'
import validator from '@rjsf/validator-ajv8'
import type { ArrayFieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils'
import { getTemplate, getUiOptions } from '@rjsf/utils'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import type { FormDefinition } from '../../types/entity'
import { AsyncSelectWidget } from '../form-widgets/AsyncSelectWidget'
import type { FormStatus } from './types'
import {
  useAsyncValidation,
  type AsyncValidationFieldConfig,
  type AsyncValidationStatus,
} from '../../hooks/useAsyncValidation'

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
      <Stack gap='sm' align='flex-end'>
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

const HiddenErrorList = () => null

const ArrayFieldTitle = ({ title }: { title?: string }) => {
  if (!title || title.toLowerCase() === 'links') {
    return null
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
      <Text fw={600} size='sm'>
        {title}
      </Text>
    </div>
  )
}

const CustomArrayTemplate = (props: ArrayFieldTemplateProps) => {
  const { registry, uiSchema, canAdd, onAddClick } = props
  const uiOptions = getUiOptions(uiSchema)
  const DefaultArrayTemplate = getTemplate<'ArrayFieldTemplate', any, any, any>('ArrayFieldTemplate', registry, uiOptions)
  const idValue = (props as { idSchema?: { $id?: string } }).idSchema?.$id
  const isLinks = typeof idValue === 'string' && idValue.toLowerCase().includes('links')
  const items = (props.items as unknown as Array<
    ArrayFieldTemplateProps['items'][number] & {
      children: ReactNode
      hasRemove?: boolean
      onDropIndexClick?: (index: number) => (() => void) | undefined
      index: number
    }
  >)

  if (!isLinks) {
    return <DefaultArrayTemplate {...props} />
  }

  const renderAddButton = (variant: 'outlined' | 'light' = 'outlined') => (
    <ActionIcon
      variant={variant === 'outlined' ? 'outline' : 'light'}
      color='indigo'
      radius='md'
      size={44}
      onClick={onAddClick}
      disabled={!canAdd}
      aria-label='הוסף לינק'
    >
      <FiPlus size={18} />
    </ActionIcon>
  )

  return (
    <Stack gap='xs'>
      {items.length === 0 && canAdd && <Group justify='flex-start'>{renderAddButton()}</Group>}

      {items.map((item) => (
        <Group key={item.key} gap='xs' wrap='nowrap' align='center'>
          {canAdd && renderAddButton('light')}
          <Flex gap='xs' style={{ flex: 1, minWidth: 0 }}>
            {item.children}
          </Flex>
          {item.hasRemove && item.onDropIndexClick && (
            <ActionIcon
              variant='subtle'
              color='gray'
              radius='md'
              size={36}
              onClick={item.onDropIndexClick(item.index)}
              aria-label='הסר לינק'
            >
              <FiTrash2 size={16} />
            </ActionIcon>
          )}
        </Group>
      ))}
    </Stack>
  )
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
  const asyncConfigs = useMemo(() => extractAsyncValidationConfigs(definition?.uiSchema), [definition?.uiSchema])
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
  const formContextValue = useMemo(() => ({ asyncValidationStatus: statusMap }), [statusMap])

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
          templates={{
            ObjectFieldTemplate: FormObjectFieldTemplate,
            ErrorListTemplate: HiddenErrorList,
            ArrayFieldTitleTemplate: ArrayFieldTitle,
            ArrayFieldTemplate: CustomArrayTemplate,
          }}
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
