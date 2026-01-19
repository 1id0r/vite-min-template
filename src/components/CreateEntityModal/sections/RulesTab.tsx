import { memo, useMemo, useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Select, Button, Space, Typography, Checkbox } from 'antd'
import { IconPlus, IconX, IconChevronRight, IconChevronDown } from '@tabler/icons-react'
import { getEntityRules, getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'
import { RuleField, MAX_RULES_PER_TYPE } from '../shared'
import type { EntityFormData } from '../hooks/useEntityForm'

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
              <RuleTypeGroup
                key={ruleKey}
                ruleLabel={group.label}
                indices={group.indices}
                entityType={entityType}
                onRemove={remove}
                onAddMore={() => handleAddMoreOfType(ruleKey)}
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
// RuleTypeGroup - Expandable group with severity tracking
// ─────────────────────────────────────────────────────────────────────────────

const RuleTypeGroup = ({
  ruleLabel,
  indices,
  entityType,
  onRemove,
  onAddMore,
}: {
  ruleLabel: string
  indices: number[]
  entityType: string
  onRemove: (idx: number) => void
  onAddMore: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const isMaxReached = indices.length >= MAX_RULES_PER_TYPE

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
          width: '100%',
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
          {ruleLabel}
        </Text>
      </div>

      {isExpanded && (
        <div style={{ padding: 16 }}>
          {indices.map((idx, i) => (
            <RuleInstance
              key={idx}
              index={idx}
              entityType={entityType}
              onRemove={() => onRemove(idx)}
              showDivider={i < indices.length - 1}
              siblingIndices={indices}
            />
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type='dashed' icon={<IconPlus size={14} />} onClick={onAddMore} disabled={isMaxReached}>
              {isMaxReached ? 'מקסימום 3 חוקים' : 'הוסף חוק'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

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
      Object.entries(schema.shape).forEach(([fieldName, fieldSchema]: [string, any]) => {
        let cur = fieldSchema
        while (cur._def.typeName === 'ZodOptional' || cur._def.typeName === 'ZodNullable') cur = cur._def.innerType
        const typeName = cur._def.typeName
        let type: 'text' | 'number' | 'boolean' | 'select' = 'text'
        if (typeName === 'ZodNumber') type = 'number'
        if (typeName === 'ZodBoolean') type = 'boolean'
        if (typeName === 'ZodEnum') type = 'select'
        fields.push({
          name: fieldName,
          type,
          label: fieldName,
          options: typeName === 'ZodEnum' ? cur._def.values : undefined,
        })
      })
    })
    return fields
  }, [fieldGroups])

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
