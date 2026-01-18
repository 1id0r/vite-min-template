import { memo, useState, useMemo } from 'react'
import { Collapse, Typography, Space, Select } from 'antd'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { TreeStep } from '../TreeStep'
import { IconPlus, IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { Input, InputNumber, Button, Segmented } from 'antd'
import { getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'
import { useRuleInstances } from '../hooks/useRuleInstances'
import { StandaloneRuleField, MAX_RULES_PER_TYPE } from '../shared'

const { Text } = Typography
const { Panel } = Collapse

const panelStyle: React.CSSProperties = {
  border: '1px solid #e9ecef',
  borderRadius: 12,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BindingsTab
// ─────────────────────────────────────────────────────────────────────────────

export const BindingsTab = memo(function BindingsTab() {
  return (
    <div style={{ direction: 'rtl' }}>
      <Space direction='vertical' size='small' style={{ width: '100%' }}>
        <div style={panelStyle}>
          <Collapse defaultActiveKey={['urls']} ghost expandIconPosition='end'>
            <Panel header={<Text strong>URL</Text>} key='urls'>
              <URLSection />
            </Panel>
          </Collapse>
        </div>
        <div style={panelStyle}>
          <Collapse ghost expandIconPosition='end'>
            <Panel header={<Text strong>Elastic</Text>} key='elastic'>
              <ElasticSection />
            </Panel>
          </Collapse>
        </div>
        <div style={panelStyle}>
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
// URL Section
// ─────────────────────────────────────────────────────────────────────────────

const URLSection = () => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'urls' as any })

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      {fields.map((field, index) => (
        <BindingInstance
          key={field.id}
          type='url'
          index={index}
          control={control}
          onRemove={() => remove(index)}
          showDivider={index < fields.length - 1}
        />
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type='dashed' icon={<IconPlus size={14} />} onClick={() => append({ url: '', timeout: 30 })}>
          הוסף URL
        </Button>
      </div>
    </Space>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Elastic Section
// ─────────────────────────────────────────────────────────────────────────────

const ElasticSection = () => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'elastic' as any })

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      {fields.length === 0 && (
        <Text type='secondary' style={{ display: 'block', textAlign: 'center', padding: 16 }}>
          לא נוספו הגדרות Elastic עדיין
        </Text>
      )}
      {fields.map((field, index) => (
        <BindingInstance
          key={field.id}
          type='elastic'
          index={index}
          control={control}
          onRemove={() => remove(index)}
          showDivider={index < fields.length - 1}
        />
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button
          type='dashed'
          icon={<IconPlus size={14} />}
          onClick={() =>
            append({ queryName: '', scheduleInterval: 5, scheduleUnit: 'minutes', timeout: 5, jsonQuery: '' })
          }
        >
          הוסף Elastic
        </Button>
      </div>
    </Space>
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

// ─────────────────────────────────────────────────────────────────────────────
// Generic Binding Instance (URL or Elastic)
// ─────────────────────────────────────────────────────────────────────────────

const BindingInstance = ({
  type,
  index,
  control,
  onRemove,
  showDivider,
}: {
  type: 'url' | 'elastic'
  index: number
  control: any
  onRemove: () => void
  showDivider: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const rules = useRuleInstances(type)

  const label = type === 'url' ? 'URL' : `Elastic Query ${index + 1}`

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      <div
        style={{
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <Button type='text' icon={<IconX size={14} />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
            <Text strong>{label}</Text>
          </div>
          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          />
        </div>

        {/* Fields */}
        {isExpanded && (
          <div style={{ padding: 16 }}>
            {type === 'url' && <URLFields index={index} control={control} />}
            {type === 'elastic' && <ElasticFields index={index} control={control} />}

            {/* Rules Multi-Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text strong style={{ whiteSpace: 'nowrap' }}>
                חוק
              </Text>
              <Select
                mode='multiple'
                placeholder='הוסף חוק'
                style={{ flex: 1 }}
                options={rules.ruleOptions}
                value={rules.selectedRules}
                onChange={rules.handleSelectionChange}
                maxTagCount='responsive'
              />
            </div>

            {/* Rule Instances */}
            {rules.ruleInstances.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(rules.groupedInstances).map(([ruleKey, group]) => (
                  <RuleInstanceGroup
                    key={ruleKey}
                    ruleKey={ruleKey}
                    label={group.label}
                    indices={group.indices}
                    onRemove={rules.handleRemove}
                    onAddMore={() => rules.handleAddMore(ruleKey)}
                    instanceSeverities={rules.instanceSeverities}
                    onSeverityChange={rules.handleSeverityChange}
                    entityType={type}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Components
// ─────────────────────────────────────────────────────────────────────────────

const URLFields = ({ index, control }: { index: number; control: any }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Text style={{ width: 60, textAlign: 'left' }}>URL</Text>
      <Controller
        name={`urls.${index}.url`}
        control={control}
        render={({ field }) => <Input {...field} placeholder='הזן URL' style={{ flex: 1 }} />}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Text style={{ width: 60, textAlign: 'left' }}>timeout</Text>
      <Controller
        name={`urls.${index}.timeout`}
        control={control}
        render={({ field }) => <InputNumber {...field} min={0} placeholder='0-60' style={{ flex: 1 }} />}
      />
      <Text type='secondary'>שניות</Text>
    </div>
  </>
)

const ElasticFields = ({ index, control }: { index: number; control: any }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Text style={{ width: 100, textAlign: 'left' }}>שם שליפה</Text>
      <Controller
        name={`elastic.${index}.queryName`}
        control={control}
        render={({ field }) => <Input {...field} placeholder='הזן שם' style={{ flex: 1 }} />}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Text style={{ width: 100, textAlign: 'left' }}>תזמון שליפה</Text>
      <Controller
        name={`elastic.${index}.scheduleInterval`}
        control={control}
        render={({ field }) => <InputNumber {...field} min={1} style={{ width: 80 }} />}
      />
      <Controller
        name={`elastic.${index}.scheduleUnit`}
        control={control}
        render={({ field }) => (
          <div style={{ direction: 'ltr' }}>
            <Segmented
              value={field.value || 'minutes'}
              onChange={field.onChange}
              options={[
                { label: 'דקות', value: 'minutes' },
                { label: 'שעות', value: 'hours' },
              ]}
            />
          </div>
        )}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Text style={{ width: 100, textAlign: 'left' }}>timeout</Text>
      <Controller
        name={`elastic.${index}.timeout`}
        control={control}
        render={({ field }) => (
          <div style={{ direction: 'ltr' }}>
            <Segmented
              value={field.value || 5}
              onChange={field.onChange}
              options={[
                { label: '5 שניות', value: 5 },
                { label: '15 שניות', value: 15 },
                { label: '20 שניות', value: 20 },
              ]}
            />
          </div>
        )}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
      <Text style={{ width: 100, textAlign: 'left', paddingTop: 8 }}>JSON Query</Text>
      <Controller
        name={`elastic.${index}.jsonQuery`}
        control={control}
        render={({ field }) => (
          <Input.TextArea
            {...field}
            placeholder='{"query": {...}}'
            style={{ flex: 1, fontFamily: 'monospace' }}
            rows={4}
          />
        )}
      />
    </div>
  </>
)

// ─────────────────────────────────────────────────────────────────────────────
// Rule Instance Group
// ─────────────────────────────────────────────────────────────────────────────

const RuleInstanceGroup = ({
  ruleKey,
  label,
  indices,
  onRemove,
  onAddMore,
  instanceSeverities,
  onSeverityChange,
  entityType,
}: {
  ruleKey: string
  label: string
  indices: number[]
  onRemove: (idx: number) => void
  onAddMore: () => void
  instanceSeverities: Record<number, string>
  onSeverityChange: (idx: number, severity: string) => void
  entityType: 'url' | 'elastic'
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const isMaxReached = indices.length >= MAX_RULES_PER_TYPE

  const getDisabledSeverities = (idx: number) =>
    Object.entries(instanceSeverities)
      .filter(([i]) => Number(i) !== idx)
      .map(([, sev]) => sev)

  return (
    <div
      style={{
        direction: 'rtl',
        border: '1px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Button
          type='text'
          shape='circle'
          size='small'
          icon={isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        />
        <Text strong style={{ flex: 1, wordBreak: 'break-word' }}>
          {label}
        </Text>
      </div>

      {isExpanded && (
        <div style={{ padding: 16 }}>
          {indices.map((idx, i) => (
            <RuleInstanceItem
              key={idx}
              idx={idx}
              ruleKey={ruleKey}
              entityType={entityType}
              onRemove={() => onRemove(idx)}
              showDivider={i < indices.length - 1}
              disabledSeverities={getDisabledSeverities(idx)}
              onSeverityChange={(sev) => onSeverityChange(idx, sev)}
            />
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type='link' icon={<IconPlus size={14} />} onClick={onAddMore} disabled={isMaxReached}>
              {isMaxReached ? 'מקסימום 3 חוקים' : 'הוסף חומרה'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Rule Instance Item
// ─────────────────────────────────────────────────────────────────────────────

const RuleInstanceItem = ({
  idx,
  ruleKey,
  entityType,
  onRemove,
  showDivider,
  disabledSeverities,
  onSeverityChange,
}: {
  idx: number
  ruleKey: string
  entityType: 'url' | 'elastic'
  onRemove: () => void
  showDivider: boolean
  disabledSeverities: string[]
  onSeverityChange: (severity: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const fieldGroups = useMemo(() => getRuleFieldGroups(entityType, ruleKey), [entityType, ruleKey])
  const allFields = useMemo(() => {
    const fields: Array<{
      name: string
      type: 'text' | 'number' | 'boolean' | 'select'
      label: string
      options?: string[]
    }> = []
    fieldGroups.forEach((groupName) => {
      const schema = FieldGroupSchemas[groupName]
      if (!schema) return
      Object.entries(schema.shape).forEach(([name, fieldSchema]: [string, any]) => {
        let cur = fieldSchema
        while (cur._def.typeName === 'ZodOptional' || cur._def.typeName === 'ZodNullable') cur = cur._def.innerType
        const typeName = cur._def.typeName
        let type: 'text' | 'number' | 'boolean' | 'select' = 'text'
        if (typeName === 'ZodNumber') type = 'number'
        if (typeName === 'ZodBoolean') type = 'boolean'
        if (typeName === 'ZodEnum') type = 'select'
        fields.push({ name, type, label: name, options: typeName === 'ZodEnum' ? cur._def.values : undefined })
      })
    })
    return fields
  }, [fieldGroups])

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      <div style={{ border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            backgroundColor: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          />
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
            <Text style={{ color: '#6B7280' }}>חוק {idx + 1}</Text>
          </div>
          <Button type='text' icon={<IconX size={14} />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>

        {isExpanded && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {allFields.map((field) => (
                <StandaloneRuleField
                  key={field.name}
                  field={field}
                  disabledSeverities={field.name === 'severity' ? disabledSeverities : []}
                  onChange={field.name === 'severity' ? onSeverityChange : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
