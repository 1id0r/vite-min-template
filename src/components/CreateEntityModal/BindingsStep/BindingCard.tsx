import { Button, Card, Input, InputNumber, Select, Row, Col, Space, Typography, Segmented } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import type { Attachment, ElasticAttachment, UrlAttachment } from '../../../types/entity'
import { ElasticAttachmentSchema, UrlAttachmentSchema } from '../../../schemas/formSchemas'

const { Text } = Typography
const { TextArea } = Input

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
    resolver: zodResolver(schema) as any,
    defaultValues: attachment,
    mode: 'onChange',
  })

  // Watch for changes and propagate up
  useEffect(() => {
    const subscription = watch((value) => {
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

  const typeOptions = [
    { label: 'URL', value: 'url' },
    { label: 'ELASTIC', value: 'elastic' },
    { label: 'MONGO', value: 'mongo', disabled: true },
    { label: 'SQL', value: 'sql', disabled: true },
    { label: 'REDIS', value: 'redis', disabled: true },
  ]

  return (
    <Card size='small' style={{ position: 'relative' }}>
      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        {/* Header with Type Selector and Delete */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
              סוג הצמדה <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
            <Segmented
              options={typeOptions}
              value={attachment.type}
              onChange={(value) => handleTypeChange(value as string)}
            />
          </div>
          <Button type='text' danger icon={<DeleteOutlined />} onClick={onDelete} />
        </div>

        {/* Common Name Field */}
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                שם הצמדה <span style={{ color: '#ff4d4f' }}>*</span>
              </Text>
              <Input {...field} placeholder='שם הצמדה' status={fieldState.error ? 'error' : undefined} />
              {fieldState.error && (
                <Text type='danger' style={{ fontSize: 12 }}>
                  {fieldState.error.message}
                </Text>
              )}
            </div>
          )}
        />

        {/* URL Specific Fields */}
        {isUrl && (
          <Controller
            name='address'
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                  URL <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <Input {...field} placeholder='כתובת לייצוא' status={fieldState.error ? 'error' : undefined} />
                {fieldState.error && (
                  <Text type='danger' style={{ fontSize: 12 }}>
                    {fieldState.error.message}
                  </Text>
                )}
              </div>
            )}
          />
        )}

        {/* Elastic Specific Fields */}
        {isElastic && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name='cluster'
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                        Cluster <span style={{ color: '#ff4d4f' }}>*</span>
                      </Text>
                      <Select
                        {...field}
                        placeholder='Select Cluster'
                        options={[
                          { label: 'Cluster A', value: 'Cluster A' },
                          { label: 'Cluster B', value: 'Cluster B' },
                        ]}
                        status={fieldState.error ? 'error' : undefined}
                        style={{ width: '100%' }}
                      />
                      {fieldState.error && (
                        <Text type='danger' style={{ fontSize: 12 }}>
                          {fieldState.error.message}
                        </Text>
                      )}
                    </div>
                  )}
                />
              </Col>
              <Col span={12}>
                <Controller
                  name='index'
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                        Index <span style={{ color: '#ff4d4f' }}>*</span>
                      </Text>
                      <Input {...field} placeholder='Index' status={fieldState.error ? 'error' : undefined} />
                      {fieldState.error && (
                        <Text type='danger' style={{ fontSize: 12 }}>
                          {fieldState.error.message}
                        </Text>
                      )}
                    </div>
                  )}
                />
              </Col>
            </Row>

            {/* Schedule & Timeout Row */}
            <Row gutter={16}>
              <Col span={12}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                  תזמון שליפה <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Controller
                    name='scheduleValue'
                    control={control}
                    render={({ field }) => <InputNumber {...field} min={1} style={{ flex: 1 }} />}
                  />
                  <Controller
                    name='scheduleUnit'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[
                          { label: 'דקות', value: 'minutes' },
                          { label: 'שעות', value: 'hours' },
                        ]}
                        style={{ width: 80 }}
                      />
                    )}
                  />
                </Space.Compact>
              </Col>

              <Col span={12}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                  Timeout (0-60s) <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <Controller
                  name='timeout'
                  control={control}
                  render={({ field: { value, onChange } }) => {
                    const numValue = parseInt(String(value).replace('s', '')) || 30
                    return (
                      <InputNumber
                        value={numValue}
                        onChange={(val) => onChange(`${val}s`)}
                        min={0}
                        max={60}
                        addonAfter='s'
                        style={{ width: '100%' }}
                      />
                    )
                  }}
                />
              </Col>
            </Row>

            <Controller
              name='query'
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                    json <span style={{ color: '#ff4d4f' }}>*</span>
                  </Text>
                  <TextArea {...field} placeholder='' rows={4} status={fieldState.error ? 'error' : undefined} />
                  <Text type='secondary' style={{ fontSize: 12 }}>
                    JSON format required
                  </Text>
                  {fieldState.error && (
                    <Text type='danger' style={{ fontSize: 12, display: 'block' }}>
                      {fieldState.error.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </>
        )}
      </Space>
    </Card>
  )
}
