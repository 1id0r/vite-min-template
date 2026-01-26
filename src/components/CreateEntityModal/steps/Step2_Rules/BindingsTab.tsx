/**
 * BindingsTab - Schema-Driven Bindings Management
 *
 * Simplified bindings tab using:
 * - BindingFieldConfigs for field definitions
 * - BindingForm for rendering fields
 * - Shared RuleInstanceGroup for consistent UI
 * - getRuleFields utility for field derivation
 */

import { memo, useState, useMemo } from 'react'
import { Collapse, Typography, Space, Select, Button, Checkbox, Modal } from 'antd'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { IconPlus, IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { TreeStep } from './TreeStep'
import { BindingForm, StandaloneRuleField, RuleInstanceGroup, getRuleFields } from '../../shared'
import { useRuleInstances } from '../../hooks/useRuleInstances'

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
  const { control, getValues } = useFormContext()
  const fieldArrayName = type === 'url' ? 'urls' : 'elastic'
  const { fields, append, remove } = useFieldArray({ control, name: fieldArrayName as any })

  const getDefaultValue = () => {
    if (type === 'url') return { url: '', timeout: 30 }
    return { queryName: '', scheduleInterval: 5, scheduleUnit: 'minutes', timeout: 5, jsonQuery: '' }
  }

  const handleRemove = (index: number) => {
    // Get current values for this binding
    const values = getValues(`${fieldArrayName}.${index}`)

    // Check if binding has any content
    const hasContent =
      values &&
      Object.entries(values).some(([key, value]) => {
        // Ignore default/empty values
        if (key === 'timeout' || key === 'scheduleInterval' || key === 'scheduleUnit') return false
        return value && value !== ''
      })

    if (hasContent) {
      Modal.confirm({
        title: 'מחיקת הצמדה',
        content: `האם אתה בטוח שברצונך למחוק את ה-${title} הזה? פעולה זו תמחק גם את כל החוקים המשויכים.`,
        okText: 'מחק',
        cancelText: 'ביטול',
        okButtonProps: { danger: true },
        onOk: () => remove(index),
      })
    } else {
      // Empty binding - remove without confirmation
      remove(index)
    }
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
                onRemove={() => handleRemove(index)}
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
// Binding Instance (URL or Elastic)
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
  const basePath = `${fieldArrayName}.${index}`

  // Use hook to manage rule instances and severities
  const rules = useRuleInstances(type)

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
            <Text style={{ color: '#6B7280' }}>
              {type === 'url' ? 'URL' : 'Elastic Query'} {index + 1}
            </Text>
          </div>
          <Button type='text' icon={<IconX size={14} />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>

        {isExpanded && (
          <div style={{ direction: 'rtl', padding: 16 }}>
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

            {/* Rule Instances using shared RuleInstanceGroup */}
            {rules.ruleInstances.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(rules.groupedInstances).map(([ruleKey, group]) => (
                  <RuleInstanceGroup
                    key={ruleKey}
                    ruleLabel={group.label}
                    indices={group.indices}
                    onAddMore={() => rules.handleAddMore(ruleKey)}
                    renderInstance={(idx, showDivider) => (
                      <RuleInstanceItem
                        key={idx}
                        idx={idx}
                        ruleKey={ruleKey}
                        entityType={type}
                        onRemove={() => rules.handleRemove(idx)}
                        showDivider={showDivider}
                        disabledSeverities={Object.entries(rules.instanceSeverities)
                          .filter(([i]) => Number(i) !== idx)
                          .map(([, sev]) => sev)}
                        currentSeverity={rules.instanceSeverities[idx]}
                        onSeverityChange={(sev) => rules.handleSeverityChange(idx, sev)}
                      />
                    )}
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
// Rule Instance Item - Using shared getRuleFields utility
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

  // Use shared utility instead of inline field derivation
  const allFields = useMemo(() => getRuleFields(entityType, ruleKey), [entityType, ruleKey])

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
