import { memo, useMemo, useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Select, Button, Space, Typography, Checkbox } from 'antd'
import { IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { getEntityRules } from '../../../../schemas/ruleSchemas'
import { RuleField, RuleInstanceGroup, getRuleFields } from '../../shared'
import type { EntityFormData } from '../../hooks/useEntityForm'

const { Text } = Typography

// ─────────────────────────────────────────────────────────────────────────────
// Main RulesTab Component
// ─────────────────────────────────────────────────────────────────────────────

interface RulesTabProps {
  entityType?: string
}

export const RulesTab = memo(function RulesTab({ entityType = 'linux' }: RulesTabProps) {
  const { control } = useFormContext<EntityFormData>()
  const { fields, append, remove } = useFieldArray({ control, name: 'entityRules' as any })

  const availableRules = useMemo(() => getEntityRules(entityType), [entityType])
  const ruleOptions = useMemo(
    () => Object.entries(availableRules).map(([key, def]) => ({ value: key, label: def.labelHe || def.label })),
    [availableRules],
  )

  const selectedRuleKeys = useMemo(() => [...new Set(fields.map((f: any) => f.ruleKey))], [fields])

  const groupedRules = useMemo(() => {
    const groups: Record<string, { label: string; indices: number[] }> = {}
    fields.forEach((field: any, idx) => {
      if (!groups[field.ruleKey]) groups[field.ruleKey] = { label: field.ruleLabel, indices: [] }
      groups[field.ruleKey].indices.push(idx)
    })
    return groups
  }, [fields])

  const handleRuleSelectionChange = (selectedKeys: string[]) => {
    const currentKeys = new Set(selectedRuleKeys)
    selectedKeys.forEach((key) => {
      if (!currentKeys.has(key)) {
        const ruleDef = availableRules[key]
        if (ruleDef) append({ ruleKey: key, ruleLabel: ruleDef.labelHe || ruleDef.label, enabled: true, data: {} })
      }
    })
    const newKeysSet = new Set(selectedKeys)
    fields.forEach((f: any, idx) => {
      if (!newKeysSet.has(f.ruleKey)) remove(idx)
    })
  }

  const handleAddMoreOfType = (ruleKey: string) => {
    const ruleDef = availableRules[ruleKey]
    if (ruleDef) append({ ruleKey, ruleLabel: ruleDef.labelHe || ruleDef.label, enabled: true, data: {} })
  }

  return (
    <div style={{ direction: 'rtl' }}>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text strong style={{ whiteSpace: 'nowrap' }}>
            חוק
          </Text>
          <Select
            mode='multiple'
            placeholder='הוסף חוק'
            style={{ flex: 1 }}
            options={ruleOptions}
            value={selectedRuleKeys}
            onChange={handleRuleSelectionChange}
            showSearch
            filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            maxTagCount='responsive'
            menuItemSelectedIcon={null}
            optionRender={(option) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox checked={selectedRuleKeys.includes(option.value as string)} />
                <span>{option.label}</span>
              </div>
            )}
          />
        </div>

        {fields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(groupedRules).map(([ruleKey, group]) => (
              <RuleInstanceGroup
                key={ruleKey}
                ruleLabel={group.label}
                indices={group.indices}
                onRemove={remove}
                onAddMore={() => handleAddMoreOfType(ruleKey)}
                renderInstance={(idx, showDivider) => (
                  <RuleInstance
                    key={idx}
                    index={idx}
                    entityType={entityType}
                    onRemove={() => remove(idx)}
                    showDivider={showDivider}
                    siblingIndices={group.indices}
                  />
                )}
              />
            ))}
          </div>
        )}
      </Space>
    </div>
  )
})

RulesTab.displayName = 'RulesTab'

// ─────────────────────────────────────────────────────────────────────────────
// RuleInstance - Individual rule with fields
// ─────────────────────────────────────────────────────────────────────────────

const RuleInstance = ({
  index,
  entityType,
  onRemove,
  showDivider,
  siblingIndices,
}: {
  index: number
  entityType: string
  onRemove: () => void
  showDivider: boolean
  siblingIndices: number[]
}) => {
  const { control, watch } = useFormContext()
  const [isExpanded, setIsExpanded] = useState(true)
  const ruleKey = watch(`entityRules.${index}.ruleKey`)

  // Use utility to get fields instead of inline derivation
  const allFields = useMemo(() => getRuleFields(entityType, ruleKey), [entityType, ruleKey])

  // Watch sibling severities directly for real-time sync
  const siblingSeverities = siblingIndices
    .filter((idx) => idx !== index)
    .map((idx) => watch(`entityRules.${idx}.data.severity`))
    .filter(Boolean)

  const disabledSeverities = siblingSeverities

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
            <Text style={{ color: '#6B7280' }}>חוק {index + 1}</Text>
          </div>
          <Button type='text' icon={<IconX size={14} />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>

        {isExpanded && (
          <div style={{ padding: 16 }}>
            {allFields.map((field) => (
              <RuleField
                key={field.name}
                basePath={`entityRules.${index}.data`}
                field={field}
                control={control}
                disabledSeverities={disabledSeverities}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
