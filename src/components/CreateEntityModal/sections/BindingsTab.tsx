import { memo, useState } from 'react'
import { Collapse, Typography, Space } from 'antd'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { TreeStep } from '../TreeStep'
import { PlusOutlined, CloseOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { Input, InputNumber, Button } from 'antd'

const { Text } = Typography
const { Panel } = Collapse

// Shared panel container style
const panelContainerStyle: React.CSSProperties = {
  border: '1px solid #e9ecef',
  borderRadius: 12,
  marginBottom: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
}

export const BindingsTab = memo(function BindingsTab() {
  return (
    <div style={{ direction: 'rtl' }}>
      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        {/* URL Section */}
        <div style={panelContainerStyle}>
          <Collapse defaultActiveKey={['urls']} ghost expandIconPosition='end'>
            <Panel header={<Text strong>בדיקות תקינות</Text>} key='urls'>
              <URLSection />
            </Panel>
          </Collapse>
        </div>

        {/* Elastic Section */}
        <div style={panelContainerStyle}>
          <Collapse ghost expandIconPosition='end'>
            <Panel header={<Text strong>גמישות</Text>} key='elastic'>
              <ElasticSection />
            </Panel>
          </Collapse>
        </div>

        {/* Measurements Section */}
        <div style={panelContainerStyle}>
          <Collapse ghost expandIconPosition='end'>
            <Panel header={<Text strong>מדידות</Text>} key='measurements'>
              <MeasurementsSection />
            </Panel>
          </Collapse>
        </div>
      </Space>
    </div>
  )
})

BindingsTab.displayName = 'BindingsTab'

// ─────────────────────────────────────────────────────────────────────────────
// URL Section - with multiple URL instances grouped together
// ─────────────────────────────────────────────────────────────────────────────

const URLSection = () => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'urls' as any,
  })

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      {fields.map((field, index) => (
        <URLInstance
          key={field.id}
          index={index}
          control={control}
          onRemove={() => remove(index)}
          showDivider={index < fields.length - 1}
        />
      ))}

      {/* Add URL Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type='dashed' icon={<PlusOutlined />} onClick={() => append({ url: '', timeout: 30 })}>
          הוסף בדיקת תקינות
        </Button>
      </div>
    </Space>
  )
}

// Individual URL Instance
const URLInstance = ({
  index,
  control,
  onRemove,
  showDivider,
}: {
  index: number
  control: any
  onRemove: () => void
  showDivider: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      {/* Instance Container - wraps header and fields */}
      <div
        style={{
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',

          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Instance Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            // backgroundColor: '#f9fafb',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Button type='text' icon={<CloseOutlined />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />

          <div
            style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Text strong>URL</Text>
          </div>

          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
          />
        </div>

        {/* Instance Fields */}
        {isExpanded && (
          <div style={{ padding: '16px' }}>
            {/* URL Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text style={{ width: 60, textAlign: 'left' }}>URL</Text>
              <Controller
                name={`urls.${index}.url`}
                control={control}
                render={({ field }) => <Input {...field} placeholder='הזן URL' style={{ flex: 1 }} />}
              />
            </div>

            {/* Timeout Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text style={{ width: 60, textAlign: 'left' }}>timeout</Text>
              <Controller
                name={`urls.${index}.timeout`}
                control={control}
                render={({ field }) => <InputNumber {...field} placeholder='הזן מספר בין 0-60' style={{ flex: 1 }} />}
              />
              <Text type='secondary'>שניות</Text>
            </div>

            {/* Add Rule Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='dashed' icon={<PlusOutlined />}>
                הוסף חוק
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Elastic Section - with multiple Elastic instances grouped together
// ─────────────────────────────────────────────────────────────────────────────

const ElasticSection = () => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'elastic' as any,
  })

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      {fields.length === 0 && (
        <Text type='secondary' style={{ display: 'block', textAlign: 'center', padding: 16 }}>
          לא נוספו הגדרות גמישות עדיין
        </Text>
      )}

      {fields.map((field, index) => (
        <ElasticInstance
          key={field.id}
          index={index}
          control={control}
          onRemove={() => remove(index)}
          showDivider={index < fields.length - 1}
        />
      ))}

      {/* Add Elastic Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type='dashed' icon={<PlusOutlined />} onClick={() => append({ query: '', threshold: 0 })}>
          הוסף גמישות
        </Button>
      </div>
    </Space>
  )
}

// Individual Elastic Instance
const ElasticInstance = ({
  index,
  control,
  onRemove,
  showDivider,
}: {
  index: number
  control: any
  onRemove: () => void
  showDivider: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      {/* Instance Container - wraps header and fields */}
      <div
        style={{
          border: '1px solid #fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',

          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Instance Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            backgroundColor: '#fff',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Button type='text' icon={<CloseOutlined />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />

          <div
            style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Text strong>Elastic Query #{index + 1}</Text>
          </div>

          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
          />
        </div>

        {/* Instance Fields */}
        {isExpanded && (
          <div style={{ padding: '16px' }}>
            {/* Query Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text style={{ width: 80, textAlign: 'left' }}>Query</Text>
              <Controller
                name={`elastic.${index}.query`}
                control={control}
                render={({ field }) => <Input {...field} placeholder='הזן שאילתה' style={{ flex: 1 }} />}
              />
            </div>

            {/* Threshold Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text style={{ width: 80, textAlign: 'left' }}>Threshold</Text>
              <Controller
                name={`elastic.${index}.threshold`}
                control={control}
                render={({ field }) => <InputNumber {...field} placeholder='0' style={{ flex: 1 }} />}
              />
            </div>

            {/* Add Rule Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='dashed' icon={<PlusOutlined />}>
                הוסף חוק
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Measurements Section
// ─────────────────────────────────────────────────────────────────────────────

const MeasurementsSection = () => {
  const { control } = useFormContext()

  return (
    <Controller
      name='measurements'
      control={control}
      render={({ field }) => <TreeStep selection={field.value || []} onSelectionChange={field.onChange} />}
    />
  )
}
