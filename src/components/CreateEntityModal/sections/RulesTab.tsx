import { memo, useMemo, useState } from 'react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { Select, Button, Space, Typography, Input, InputNumber, Checkbox, Tag } from 'antd'
import { PlusOutlined, CloseOutlined, RightOutlined, DownOutlined } from '@ant-design/icons'
import { getEntityRules, getRuleFieldGroups, FieldGroupSchemas } from '../../../schemas/ruleSchemas'
import type { EntityFormData } from '../hooks/useEntityForm'

const { Text } = Typography

interface RulesTabProps {
  entityType?: string
}

export const RulesTab = memo(function RulesTab({ entityType = 'linux' }: RulesTabProps) {
  const { control } = useFormContext<EntityFormData>()

  // Use field array for dynamic list of rules
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entityRules' as any,
  })

  // Get available rules for the entity
  const availableRules = useMemo(() => getEntityRules(entityType), [entityType])

  const ruleOptions = useMemo(() => {
    return Object.entries(availableRules).map(([key, def]) => ({
      value: key,
      label: def.labelHe || def.label,
    }))
  }, [availableRules])

  // Get currently selected rule keys (unique)
  const selectedRuleKeys = useMemo(() => {
    const keys = new Set<string>()
    fields.forEach((field: any) => {
      keys.add(field.ruleKey)
    })
    return Array.from(keys)
  }, [fields])

  // Handle rule selection change
  const handleRuleSelectionChange = (selectedKeys: string[]) => {
    // Find rules to add (in selectedKeys but not in current fields)
    const currentKeys = new Set(selectedRuleKeys)

    selectedKeys.forEach((key) => {
      if (!currentKeys.has(key)) {
        // Add new rule
        const ruleDef = availableRules[key]
        if (ruleDef) {
          append({
            ruleKey: key,
            ruleLabel: ruleDef.labelHe || ruleDef.label,
            enabled: true,
            data: {},
          })
        }
      }
    })

    // Find rules to remove (in current fields but not in selectedKeys)
    const newKeysSet = new Set(selectedKeys)
    const indicesToRemove: number[] = []

    fields.forEach((field: any, index) => {
      if (!newKeysSet.has(field.ruleKey)) {
        indicesToRemove.push(index)
      }
    })

    // Remove in reverse order to maintain correct indices
    indicesToRemove.reverse().forEach((index) => {
      remove(index)
    })
  }

  // Group rules by ruleKey for display
  const groupedRules = useMemo(() => {
    const groups: Record<string, { label: string; indices: number[] }> = {}

    fields.forEach((field: any, index) => {
      const ruleKey = field.ruleKey
      if (!groups[ruleKey]) {
        groups[ruleKey] = {
          label: field.ruleLabel,
          indices: [],
        }
      }
      groups[ruleKey].indices.push(index)
    })

    return groups
  }, [fields])

  const handleAddMoreOfType = (ruleKey: string) => {
    const ruleDef = availableRules[ruleKey]
    if (ruleDef) {
      append({
        ruleKey: ruleKey,
        ruleLabel: ruleDef.labelHe || ruleDef.label,
        enabled: true,
        data: {},
      })
    }
  }

  return (
    <div style={{ direction: 'rtl' }}>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        {/* Rule Multi-Select */}
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
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            maxTagCount='responsive'
          />
        </div>

        {/* Grouped Rules List - Only show if rules are selected */}
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

/**
 * Rule Type Group - Container for multiple instances of the same rule type
 */
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
  onRemove: (index: number) => void
  onAddMore: () => void
}) => {
  const { watch } = useFormContext()
  const [isExpanded, setIsExpanded] = useState(true)

  // Watch all severities for this rule group
  const allRulesData = watch('entityRules') || []
  const usedSeverities = useMemo(() => {
    const severities: Record<number, string> = {}
    indices.forEach((idx) => {
      const severity = allRulesData[idx]?.data?.severity
      if (severity) {
        severities[idx] = severity
      }
    })
    return severities
  }, [allRulesData, indices])

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

      {/* Expanded Content - List of instances */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {indices.map((index, i) => (
            <RuleInstance
              key={index}
              index={index}
              entityType={entityType}
              onRemove={() => onRemove(index)}
              showDivider={i < indices.length - 1}
              usedSeverities={usedSeverities}
            />
          ))}

          {/* Add More Button - max 3 instances per rule type */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type='dashed' icon={<PlusOutlined />} onClick={onAddMore} disabled={indices.length >= 3}>
              {indices.length >= 3 ? 'מקסימום 3 חוקים' : 'הוסף חוק'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Individual Rule Instance - Single instance with its own fields and remove button
 */
const RuleInstance = ({
  index,
  entityType,
  onRemove,
  showDivider,
  usedSeverities,
}: {
  index: number
  entityType: string
  onRemove: () => void
  showDivider: boolean
  usedSeverities: Record<number, string>
}) => {
  const { control, watch } = useFormContext()
  const [isExpanded, setIsExpanded] = useState(true)
  const ruleKey = watch(`entityRules.${index}.ruleKey`)

  const fieldGroups = useMemo(() => getRuleFieldGroups(entityType, ruleKey), [entityType, ruleKey])

  // Flatten all fields from all groups
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

  // Get severities used by other instances (not this one)
  const disabledSeverities = useMemo(() => {
    return Object.entries(usedSeverities)
      .filter(([idx]) => Number(idx) !== index)
      .map(([, severity]) => severity)
  }, [usedSeverities, index])

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
            <Text style={{ color: '#6B7280' }}>חוק {index + 1}</Text>
          </div>

          <Button type='text' icon={<CloseOutlined />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>

        {/* Instance Fields */}
        {isExpanded && (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
          </div>
        )}
      </div>
    </div>
  )
}

const RuleField = ({ basePath, field, control, disabledSeverities = [] }: any) => {
  const name = `${basePath}.${field.name}`

  // Format label: replace underscores with spaces and capitalize each word
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
    <div style={{ marginBottom: 8 }}>
      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
        {formatLabel(field.label)}
      </Text>

      <Controller
        name={name}
        control={control}
        render={({ field: rhfField }) => {
          if (field.type === 'number') {
            return <InputNumber {...rhfField} min={0} style={{ width: '100%' }} />
          }
          if (field.type === 'boolean') {
            return <Checkbox checked={rhfField.value} onChange={(e) => rhfField.onChange(e.target.checked)} />
          }
          if (field.type === 'select') {
            if (field.name === 'severity') {
              return (
                <Select
                  {...rhfField}
                  style={{ width: '100%' }}
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
              )
            }
            return <Select {...rhfField} style={{ width: '100%' }} />
          }
          return <Input {...rhfField} />
        }}
      />
    </div>
  )
}
