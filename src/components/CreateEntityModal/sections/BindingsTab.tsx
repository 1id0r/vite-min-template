import { memo, useState, useMemo } from 'react'
import { Collapse, Typography, Space, Select, Checkbox, Tag } from 'antd'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { TreeStep } from '../TreeStep'
import { PlusOutlined, CloseOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import { Input, InputNumber, Button, Segmented } from 'antd'
import { getEntityRules, getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'

const { Text } = Typography
const { Panel } = Collapse

// Shared panel container style
const panelContainerStyle: React.CSSProperties = {
  border: '1px solid #e9ecef',
  borderRadius: 12,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
}

export const BindingsTab = memo(function BindingsTab() {
  return (
    <div style={{ direction: 'rtl' }}>
      <Space direction='vertical' size='small' style={{ width: '100%' }}>
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
            <Panel header={<Text strong>אלסטיק</Text>} key='elastic'>
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
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [ruleInstances, setRuleInstances] = useState<Array<{ ruleKey: string; ruleLabel: string }>>([])

  const availableRules = useMemo(() => getEntityRules('url'), [])
  const ruleOptions = useMemo(() => {
    return Object.entries(availableRules).map(([key, def]) => ({
      value: key,
      label: def.labelHe || def.label,
    }))
  }, [availableRules])

  const handleRuleSelectionChange = (selected: string[]) => {
    // Add new rules
    selected.forEach((key) => {
      if (!selectedRules.includes(key)) {
        const ruleDef = availableRules[key]
        if (ruleDef) {
          setRuleInstances((prev) => [...prev, { ruleKey: key, ruleLabel: ruleDef.labelHe || ruleDef.label }])
        }
      }
    })
    // Remove deselected rules
    setRuleInstances((prev) => prev.filter((r) => selected.includes(r.ruleKey)))
    setSelectedRules(selected)
  }

  const handleRemoveRuleInstance = (idx: number) => {
    const removed = ruleInstances[idx]
    setRuleInstances((prev) => prev.filter((_, i) => i !== idx))
    setSelectedRules((prev) => {
      // Only remove from selected if no more instances of this rule
      const remaining = ruleInstances.filter((_, i) => i !== idx)
      if (!remaining.some((r) => r.ruleKey === removed.ruleKey)) {
        return prev.filter((k) => k !== removed.ruleKey)
      }
      return prev
    })
  }

  const handleAddMoreOfType = (ruleKey: string) => {
    const ruleDef = availableRules[ruleKey]
    if (ruleDef) {
      setRuleInstances((prev) => [...prev, { ruleKey, ruleLabel: ruleDef.labelHe || ruleDef.label }])
    }
  }

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      {/* Instance Container */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text style={{ width: 60, textAlign: 'left' }}>timeout</Text>
              <Controller
                name={`urls.${index}.timeout`}
                control={control}
                render={({ field }) => <InputNumber {...field} placeholder='הזן מספר בין 0-60' style={{ flex: 1 }} />}
              />
              <Text type='secondary'>שניות</Text>
            </div>

            {/* Rules Multi-Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text strong style={{ whiteSpace: 'nowrap' }}>
                חוק
              </Text>
              <Select
                mode='multiple'
                placeholder='הוסף חוק'
                style={{ flex: 1 }}
                options={ruleOptions}
                value={selectedRules}
                onChange={handleRuleSelectionChange}
                maxTagCount='responsive'
              />
            </div>

            {/* Rule Instances */}
            {ruleInstances.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(
                  ruleInstances.reduce((acc, inst, idx) => {
                    if (!acc[inst.ruleKey]) acc[inst.ruleKey] = { label: inst.ruleLabel, indices: [] }
                    acc[inst.ruleKey].indices.push(idx)
                    return acc
                  }, {} as Record<string, { label: string; indices: number[] }>)
                ).map(([ruleKey, group]) => (
                  <BindingRuleGroup
                    key={ruleKey}
                    ruleLabel={group.label}
                    ruleKey={ruleKey}
                    indices={group.indices}
                    onRemove={handleRemoveRuleInstance}
                    onAddMore={() => handleAddMoreOfType(ruleKey)}
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
          לא נוספו הגדרות אלסטיק עדיין
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
        <Button
          type='dashed'
          icon={<PlusOutlined />}
          onClick={() =>
            append({ queryName: '', scheduleInterval: 5, scheduleUnit: 'minutes', timeout: 5, jsonQuery: '' })
          }
        >
          הוסף אלסטיק
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
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [ruleInstances, setRuleInstances] = useState<Array<{ ruleKey: string; ruleLabel: string }>>([])

  const availableRules = useMemo(() => getEntityRules('elastic'), [])
  const ruleOptions = useMemo(() => {
    return Object.entries(availableRules).map(([key, def]) => ({
      value: key,
      label: def.labelHe || def.label,
    }))
  }, [availableRules])

  const handleRuleSelectionChange = (selected: string[]) => {
    selected.forEach((key) => {
      if (!selectedRules.includes(key)) {
        const ruleDef = availableRules[key]
        if (ruleDef) {
          setRuleInstances((prev) => [...prev, { ruleKey: key, ruleLabel: ruleDef.labelHe || ruleDef.label }])
        }
      }
    })
    setRuleInstances((prev) => prev.filter((r) => selected.includes(r.ruleKey)))
    setSelectedRules(selected)
  }

  const handleRemoveRuleInstance = (idx: number) => {
    const removed = ruleInstances[idx]
    setRuleInstances((prev) => prev.filter((_, i) => i !== idx))
    setSelectedRules((prev) => {
      const remaining = ruleInstances.filter((_, i) => i !== idx)
      if (!remaining.some((r) => r.ruleKey === removed.ruleKey)) {
        return prev.filter((k) => k !== removed.ruleKey)
      }
      return prev
    })
  }

  const handleAddMoreOfType = (ruleKey: string) => {
    const ruleDef = availableRules[ruleKey]
    if (ruleDef) {
      setRuleInstances((prev) => [...prev, { ruleKey, ruleLabel: ruleDef.labelHe || ruleDef.label }])
    }
  }

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      {/* Instance Container */}
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
            <Text strong>Elastic Query {index + 1}</Text>
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
            {/* Query Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text style={{ width: 100, textAlign: 'left' }}>שם שליפה</Text>
              <Controller
                name={`elastic.${index}.queryName`}
                control={control}
                render={({ field }) => <Input {...field} placeholder='הזן שם שליפה' style={{ flex: 1 }} />}
              />
            </div>

            {/* Schedule Interval with Unit Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text style={{ width: 100, textAlign: 'left' }}>תזמון שליפה</Text>
              <Controller
                name={`elastic.${index}.scheduleInterval`}
                control={control}
                render={({ field }) => <InputNumber {...field} min={1} placeholder='5' style={{ width: 80 }} />}
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

            {/* Timeout Pill Selector */}
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

            {/* JSON Query Field */}
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

            {/* Rules Multi-Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text strong style={{ whiteSpace: 'nowrap' }}>
                חוק
              </Text>
              <Select
                mode='multiple'
                placeholder='הוסף חוק'
                style={{ flex: 1 }}
                options={ruleOptions}
                value={selectedRules}
                onChange={handleRuleSelectionChange}
                maxTagCount='responsive'
              />
            </div>

            {/* Rule Instances */}
            {ruleInstances.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(
                  ruleInstances.reduce((acc, inst, idx) => {
                    if (!acc[inst.ruleKey]) acc[inst.ruleKey] = { label: inst.ruleLabel, indices: [] }
                    acc[inst.ruleKey].indices.push(idx)
                    return acc
                  }, {} as Record<string, { label: string; indices: number[] }>)
                ).map(([ruleKey, group]) => (
                  <BindingRuleGroup
                    key={ruleKey}
                    ruleLabel={group.label}
                    ruleKey={ruleKey}
                    indices={group.indices}
                    onRemove={handleRemoveRuleInstance}
                    onAddMore={() => handleAddMoreOfType(ruleKey)}
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
// Binding Rule Components - for rules attached to URL/Elastic bindings
// ─────────────────────────────────────────────────────────────────────────────

const BindingRuleGroup = ({
  ruleLabel,
  ruleKey,
  indices,
  onRemove,
  onAddMore,
}: {
  ruleLabel: string
  ruleKey: string
  indices: number[]
  onRemove: (idx: number) => void
  onAddMore: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  // Track severity values for each instance index
  const [instanceSeverities, setInstanceSeverities] = useState<Record<number, string>>({})

  const handleSeverityChange = (instanceIdx: number, severity: string) => {
    setInstanceSeverities((prev) => ({ ...prev, [instanceIdx]: severity }))
  }

  // Compute disabled severities for each instance (excluding its own)
  const getDisabledSeverities = (currentIdx: number) => {
    return Object.entries(instanceSeverities)
      .filter(([idx]) => Number(idx) !== currentIdx)
      .map(([, severity]) => severity)
  }

  return (
    <div
      style={{
        direction: 'rtl',
        border: '1px solid #fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Group Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Button type='text' shape='circle' size='small' icon={isExpanded ? <DownOutlined /> : <RightOutlined />} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ wordBreak: 'break-word' }}>
            {ruleLabel}
          </Text>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {indices.map((idx, i) => (
            <BindingRuleInstance
              key={idx}
              instanceIndex={idx}
              ruleKey={ruleKey}
              onRemove={() => onRemove(idx)}
              showDivider={i < indices.length - 1}
              disabledSeverities={getDisabledSeverities(idx)}
              onSeverityChange={(severity) => handleSeverityChange(idx, severity)}
            />
          ))}

          {/* Add More Button - max 3 instances per rule type */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type='link' icon={<PlusOutlined />} onClick={onAddMore} disabled={indices.length >= 3}>
              {indices.length >= 3 ? 'מקסימום 3 חוקים' : 'הוסף חומרה'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const BindingRuleInstance = ({
  instanceIndex,
  ruleKey,
  onRemove,
  showDivider,
  disabledSeverities = [],
  onSeverityChange,
}: {
  instanceIndex: number
  ruleKey: string
  onRemove: () => void
  showDivider: boolean
  disabledSeverities: string[]
  onSeverityChange: (severity: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const fieldGroups = useMemo(() => getRuleFieldGroups('url', ruleKey), [ruleKey])

  const allFields = useMemo(() => {
    const fields: Array<{ name: string; type: string; label: string; options?: any[] }> = []

    fieldGroups.forEach((groupName) => {
      const schema = FieldGroupSchemas[groupName]
      if (!schema) return

      Object.entries(schema.shape).forEach(([fieldName, fieldSchema]: [string, any]) => {
        let currentSchema = fieldSchema
        while (currentSchema._def.typeName === 'ZodOptional' || currentSchema._def.typeName === 'ZodNullable') {
          currentSchema = currentSchema._def.innerType
        }

        const typeName = currentSchema._def.typeName
        let type = 'text'
        if (typeName === 'ZodNumber') type = 'number'
        if (typeName === 'ZodBoolean') type = 'boolean'
        if (typeName === 'ZodEnum') type = 'select'

        fields.push({
          name: fieldName,
          type,
          label: fieldName,
          options: typeName === 'ZodEnum' ? currentSchema._def.values : undefined,
        })
      })
    })
    return fields
  }, [fieldGroups])

  // Format label helper
  const formatLabel = (label: string) => {
    return label
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Severity color mapping
  const severityConfig: Record<string, { color: string; label: string }> = {
    critical: { color: 'red', label: 'Critical' },
    major: { color: 'orange', label: 'Major' },
    info: { color: 'blue', label: 'Info' },
  }

  return (
    <div
      style={{
        marginBottom: showDivider ? 16 : 0,
        paddingBottom: showDivider ? 16 : 0,
        borderBottom: showDivider ? '1px solid #e9ecef' : 'none',
      }}
    >
      {/* Instance Container */}
      <div
        style={{
          border: '1px solid #e9ecef',
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
          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
          />
          <div
            style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Text style={{ color: '#6B7280' }}>חוק {instanceIndex + 1}</Text>
          </div>
          <Button type='text' icon={<CloseOutlined />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>

        {/* Instance Fields */}
        {isExpanded && (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {allFields.map((field) => (
                <div key={field.name} style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    {formatLabel(field.label)}
                  </Text>
                  {field.type === 'number' && <InputNumber min={0} style={{ width: '100%' }} placeholder='הזן' />}
                  {field.type === 'boolean' && <Checkbox />}
                  {field.type === 'select' && field.name === 'severity' && (
                    <Select
                      style={{ width: '100%' }}
                      onChange={(value) => onSeverityChange(value)}
                      options={[
                        {
                          value: 'critical',
                          label: <Tag color='red'>Critical</Tag>,
                          disabled: disabledSeverities.includes('critical'),
                        },
                        {
                          value: 'major',
                          label: <Tag color='orange'>Major</Tag>,
                          disabled: disabledSeverities.includes('major'),
                        },
                        {
                          value: 'info',
                          label: <Tag color='blue'>Info</Tag>,
                          disabled: disabledSeverities.includes('info'),
                        },
                      ]}
                      optionRender={(option) => {
                        const config = severityConfig[option.value as string]
                        const isDisabled = disabledSeverities.includes(option.value as string)
                        return (
                          <Tag color={config?.color} style={isDisabled ? { opacity: 0.5 } : undefined}>
                            {config?.label} {isDisabled && '(בשימוש)'}
                          </Tag>
                        )
                      }}
                    />
                  )}
                  {field.type === 'select' && field.name !== 'severity' && (
                    <Select
                      style={{ width: '100%' }}
                      options={field.options?.map((opt: any) => ({ value: opt, label: opt }))}
                    />
                  )}
                  {field.type === 'text' && <Input placeholder='הזן' />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
