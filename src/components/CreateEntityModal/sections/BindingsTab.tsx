/**
 * BindingsTab - Schema-Driven Bindings Management
 *
 * Simplified bindings tab using:
 * - BindingFieldConfigs for field definitions
 * - BindingForm for rendering fields
 * - GenericRuleForm pattern for rules
 */

import { memo, useState, useMemo } from 'react'
import { Collapse, Typography, Space, Select, Button, Checkbox } from 'antd'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { IconPlus, IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { TreeStep } from '../TreeStep'
import { BindingForm, StandaloneRuleField, MAX_RULES_PER_TYPE } from '../shared'
import { useRuleInstances } from '../hooks/useRuleInstances'
import { getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'

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
        <BindingSection type='url' title='URL' defaultOpen />
        <BindingSection type='elastic' title='Elastic' />
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
// Generic Binding Section
// ─────────────────────────────────────────────────────────────────────────────

interface BindingSectionProps {
  type: 'url' | 'elastic'
  title: string
  defaultOpen?: boolean
}

const BindingSection = memo(function BindingSection({ type, title, defaultOpen }: BindingSectionProps) {
  const { control } = useFormContext()
  const fieldArrayName = type === 'url' ? 'urls' : 'elastic'
  const { fields, append, remove } = useFieldArray({ control, name: fieldArrayName as any })

  const getDefaultValue = () => {
    if (type === 'url') return { url: '', timeout: 30 }
    return { queryName: '', scheduleInterval: 5, scheduleUnit: 'minutes', timeout: 5, jsonQuery: '' }
  }

  return (
    <div style={panelStyle}>
      <Collapse defaultActiveKey={defaultOpen ? [type] : []} ghost expandIconPosition='end'>
        <Panel header={<Text strong>{title}</Text>} key={type}>
          <Space direction='vertical' style={{ width: '100%' }}>
            {fields.map((field, index) => (
              <BindingInstance
                key={field.id}
                type={type}
                index={index}
                control={control}
                fieldArrayName={fieldArrayName}
                onRemove={() => remove(index)}
                showDivider={index < fields.length - 1}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type='dashed' icon={<IconPlus size={14} />} onClick={() => append(getDefaultValue())}>
                הוסף {title}
              </Button>
            </div>
          </Space>
        </Panel>
      </Collapse>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Binding Instance
// ─────────────────────────────────────────────────────────────────────────────

interface BindingInstanceProps {
  type: 'url' | 'elastic'
  index: number
  control: any
  fieldArrayName: string
  onRemove: () => void
  showDivider: boolean
}

const BindingInstance = memo(function BindingInstance({
  type,
  index,
  control,
  fieldArrayName,
  onRemove,
  showDivider,
}: BindingInstanceProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const rules = useRuleInstances(type)
  const basePath = `${fieldArrayName}.${index}`

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
            <Text strong>{type === 'url' ? 'URL' : `Elastic Query ${index + 1}`}</Text>
          </div>
          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          />
        </div>

        {/* Content */}
        {isExpanded && (
          <div style={{ padding: 16 }}>
            {/* Schema-driven binding fields */}
            <BindingForm bindingType={type} basePath={basePath} control={control} />

            {/* Rules Multi-Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 8 }}>
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
                menuItemSelectedIcon={null}
                optionRender={(option) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Checkbox checked={rules.selectedRules.includes(option.value as string)} />
                    <span>{option.label}</span>
                  </div>
                )}
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
})

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
// Rule Instance Group (for binding rules)
// ─────────────────────────────────────────────────────────────────────────────

interface RuleInstanceGroupProps {
  ruleKey: string
  label: string
  indices: number[]
  onRemove: (idx: number) => void
  onAddMore: () => void
  instanceSeverities: Record<number, string>
  onSeverityChange: (idx: number, severity: string) => void
  entityType: 'url' | 'elastic'
}

const RuleInstanceGroup = memo(function RuleInstanceGroup({
  label,
  indices,
  onRemove,
  onAddMore,
  instanceSeverities,
  onSeverityChange,
  entityType,
  ruleKey,
}: RuleInstanceGroupProps) {
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
              currentSeverity={instanceSeverities[idx]}
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
})

// ─────────────────────────────────────────────────────────────────────────────
// Rule Instance Item
// ─────────────────────────────────────────────────────────────────────────────

interface RuleInstanceItemProps {
  idx: number
  ruleKey: string
  entityType: 'url' | 'elastic'
  onRemove: () => void
  showDivider: boolean
  disabledSeverities: string[]
  currentSeverity?: string
  onSeverityChange: (severity: string) => void
}

const RuleInstanceItem = memo(function RuleInstanceItem({
  idx,
  ruleKey,
  entityType,
  onRemove,
  showDivider,
  disabledSeverities,
  currentSeverity,
  onSeverityChange,
}: RuleInstanceItemProps) {
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
            {allFields.map((field) => (
              <StandaloneRuleField
                key={field.name}
                field={field}
                value={field.name === 'severity' ? currentSeverity : undefined}
                disabledSeverities={field.name === 'severity' ? disabledSeverities : []}
                onChange={field.name === 'severity' ? onSeverityChange : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
