import {
  ActionIcon,
  Box,
  Grid,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { BsTrash } from 'react-icons/bs'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import type { Attachment, ElasticAttachment, UrlAttachment } from '../../../types/entity'
import { ElasticAttachmentSchema, UrlAttachmentSchema } from '../../../schemas/formSchemas'

interface BindingCardProps {
  attachment: Attachment
  onChange: (attachment: Attachment) => void
  onDelete: () => void
  isValid?: boolean
}

export function BindingCard({ attachment, onChange, onDelete }: BindingCardProps) {
  const isUrl = attachment.type === 'url'
  const isElastic = attachment.type === 'elastic'

  const schema = isUrl ? UrlAttachmentSchema : ElasticAttachmentSchema

  const {
    control,
    watch,
    reset,
    formState: {},
  } = useForm<Attachment>({
    resolver: zodResolver(schema),
    defaultValues: attachment,
    mode: 'onChange',
  })

  // Watch for changes and propagate up
  useEffect(() => {
    const subscription = watch((value) => {
      // Cast partially filled data to Attachment type for update
      onChange({ ...attachment, ...value } as Attachment)
    })
    return () => subscription.unsubscribe()
  }, [watch, onChange, attachment])

  const handleTypeChange = (value: string) => {
    if (value === attachment.type) return

    const base = { id: attachment.id, name: attachment.name }

    if (value === 'url') {
      const newUrl: UrlAttachment = {
        ...base,
        type: 'url',
        address: '',
        timeout: '30s',
      }
      onChange(newUrl)
      reset(newUrl)
    } else {
      const newElastic: ElasticAttachment = {
        ...base,
        type: 'elastic',
        cluster: '',
        index: '',
        scheduleValue: 3,
        scheduleUnit: 'minutes',
        timeout: '30s',
        query: '{}',
      }
      onChange(newElastic)
      reset(newElastic)
    }
  }

  return (
    <Paper withBorder p='md' radius='md' style={{ position: 'relative' }}>
      <Stack gap='md'>
        {/* Header with Type Selector and Delete */}
        <Group justify='space-between' align='flex-start'>
          <Group align='center'>
            <ActionIcon variant='subtle' color='red' onClick={onDelete}>
              <BsTrash size={16} />
            </ActionIcon>
            <Box>
              <Text size='sm' fw={500} mb={4}>
                סוג הצמדה <span style={{ color: 'red' }}>*</span>
              </Text>
              <SegmentedControl
                value={attachment.type}
                onChange={handleTypeChange}
                data={[
                  { label: 'URL', value: 'url' },
                  { label: 'ELASTIC', value: 'elastic' }, // Mock label per request
                  { label: 'MONGO', value: 'mongo', disabled: true },
                  { label: 'SQL', value: 'sql', disabled: true },
                  { label: 'REDIS', value: 'redis', disabled: true },
                ]}
              />
            </Box>
          </Group>
        </Group>

        {/* Common Name Field */}
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label={
                <span>
                  שם הצמדה<span style={{ color: 'red' }}>*</span>
                </span>
              }
              placeholder='שם הצמדה'
              error={fieldState.error?.message}
            />
          )}
        />

        {/* URL Specific Fields */}
        {isUrl && (
          <Controller
            name='address'
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label={
                  <span>
                    URL <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                placeholder='כתובת לייצוא'
                error={fieldState.error?.message}
              />
            )}
          />
        )}

        {/* Elastic Specific Fields */}
        {isElastic && (
          <>
            <Grid>
              <Grid.Col span={6}>
                <Controller
                  name='cluster'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Select
                      {...field}
                      label={
                        <span>
                          Cluster <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      placeholder='Select Cluster'
                      data={['Cluster A', 'Cluster B']} // Mock data
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Controller
                  name='index'
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      label={
                        <span>
                          Index <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      placeholder='Index'
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid.Col>
            </Grid>

            {/* Schedule & Timeout Row */}
            <Grid align='flex-end'>
              <Grid.Col span={6}>
                <Text size='sm' fw={500} mb={3}>
                  תזמון שליפה <span style={{ color: 'red' }}>*</span>
                </Text>
                <Group gap={0}>
                  <Controller
                    name='scheduleValue'
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        {...field}
                        min={1}
                        style={{ flex: 1 }}
                        rightSectionWidth={0}
                        styles={{ input: { borderTopRightRadius: 0, borderBottomRightRadius: 0 } }}
                      />
                    )}
                  />
                  <Controller
                    name='scheduleUnit'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        data={[
                          { label: 'דקות', value: 'minutes' },
                          { label: 'שעות', value: 'hours' },
                        ]}
                        styles={{ input: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } }}
                        style={{ width: 80 }}
                      />
                    )}
                  />
                </Group>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size='sm' fw={500} mb={3}>
                  Timeout (0-60s) <span style={{ color: 'red' }}>*</span>
                </Text>
                <Controller
                  name='timeout'
                  control={control}
                  render={({ field: { value, onChange } }) => {
                    // Parse "30s" to 30 for the slider/number input
                    const numValue = parseInt(String(value).replace('s', '')) || 30
                    return (
                      <NumberInput
                        value={numValue}
                        onChange={(val) => onChange(`${val}s`)}
                        min={0}
                        max={60}
                        suffix='s'
                      />
                    )
                  }}
                />
              </Grid.Col>
            </Grid>

            <Controller
              name='query'
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  label={
                    <span>
                      json<span style={{ color: 'red' }}>*</span>
                    </span>
                  }
                  placeholder=''
                  minRows={4}
                  error={fieldState.error?.message}
                  description='JSON format required'
                />
              )}
            />
          </>
        )}
      </Stack>
    </Paper>
  )
}
