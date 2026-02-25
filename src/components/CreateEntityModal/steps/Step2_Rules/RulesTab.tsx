import { memo, useMemo } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button, Space, Typography, Modal } from 'antd'
import { IconX } from '@tabler/icons-react'
import { getEntityRules } from '../../../../schemas/ruleSchemas'
import {
  RuleField,
  RuleInstanceGroup,
  getRuleFields,
  FunctionalitySection,
  CustomRuleInstance,
  MultiSelectDropdown,
} from '../../shared'
import type { EntityFormData } from '../../hooks/useEntityForm'

const { Text } = Typography

// ─────────────────────────────────────────────────────────────────────────────
// Main RulesTab Component
// ─────────────────────────────────────────────────────────────────────────────

interface RulesTabProps {
  entityType?: string
}

export const RulesTab = memo(function RulesTab({ entityType = 'linux' }: RulesTabProps) {
  const { control, getValues } = useFormContext<EntityFormData>()
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
    const newKeysSet = new Set(selectedKeys)

    // Check which keys were removed
    const removedKeys = [...currentKeys].filter((key) => !newKeysSet.has(key))

    if (removedKeys.length > 0) {
      let hasData = false
      let removedRuleLabel = ''

      removedKeys.forEach((key) => {
        fields.forEach((f: any, idx) => {
          if (f.ruleKey === key) {
            const values = getValues(`entityRules.${idx}.data`)
            const instanceHasData =
              values &&
              Object.entries(values).some(([, value]) => {
                if (value === '' || value === null || value === undefined) return false
                return true
              })
            if (instanceHasData) {
              hasData = true
              removedRuleLabel = f.ruleLabel || availableRules[key]?.labelHe || availableRules[key]?.label || key
            }
          }
        })
      })

      if (hasData) {
        Modal.confirm({
          title: 'מחיקת חוק',
          content: `האם אתה בטוח שברצונך למחוק את החוק "${removedRuleLabel}"? פעולה זו תמחק את כל הנתונים שהזנת.`,
          okText: 'המשך עריכה',
          cancelText: 'מחק חוק',
          okButtonProps: { type: 'primary' },
          cancelButtonProps: { style: { color: '#1677ff', borderColor: '#1677ff', backgroundColor: 'transparent' } },
          direction: 'rtl',
          onOk: () => {
            // Do nothing, let user continue editing (they clicked "continue editing" which is okText)
          },
          onCancel: () => {
            // They clicked "delete rule" (cancelText)
            applySelectionChange(selectedKeys)
          },
        })
        return
      }
    }

    applySelectionChange(selectedKeys)
  }

  const applySelectionChange = (selectedKeys: string[]) => {
    const currentKeys = new Set(selectedRuleKeys)
    selectedKeys.forEach((key) => {
      if (!currentKeys.has(key)) {
        const ruleDef = availableRules[key]
        if (ruleDef) append({ ruleKey: key, ruleLabel: ruleDef.labelHe || ruleDef.label, enabled: true, data: {} })
      }
    })
    const newKeysSet = new Set(selectedKeys)
    // Remove indices in reverse order so array shifting doesn't mess up subsequent removals
    const indicesToRemove: number[] = []
    fields.forEach((f: any, idx) => {
      if (!newKeysSet.has(f.ruleKey)) indicesToRemove.push(idx)
    })
    if (indicesToRemove.length > 0) {
      remove(indicesToRemove.reverse())
    }
  }

  const handleRemoveRule = (index: number, ruleLabel: string) => {
    // Get current values for this rule
    const values = getValues(`entityRules.${index}.data`)

    // Check if rule has any filled content
    const hasContent =
      values &&
      Object.entries(values).some(([, value]) => {
        // Ignore empty or default values
        if (value === '' || value === null || value === undefined) return false
        return true
      })

    if (hasContent) {
      Modal.confirm({
        title: 'מחיקת חוק',
        content: `האם אתה בטוח שברצונך למחוק את החוק "${ruleLabel}"? פעולה זו תמחק את כל הנתונים שהזנת.`,
        okText: 'המשך עריכה',
        cancelText: 'מחק חוק',
        okButtonProps: { type: 'primary' },
        cancelButtonProps: { style: { color: '#1677ff', borderColor: '#1677ff', backgroundColor: 'transparent' } },
        direction: 'rtl',
        onCancel: () => remove(index),
      })
    } else {
      // Empty rule - remove without confirmation
      remove(index)
    }
  }

  const handleAddMoreOfType = (ruleKey: string) => {
    const ruleDef = availableRules[ruleKey]
    if (ruleDef) append({ ruleKey, ruleLabel: ruleDef.labelHe || ruleDef.label, enabled: true, data: {} })
  }
  // ... (rest is same until return)
  return (
    <div style={{ direction: 'rtl' }}>
      <Space orientation='vertical' style={{ width: '100%' }} size='large'>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text strong style={{ whiteSpace: 'nowrap' }}>
            חוק
          </Text>
          <MultiSelectDropdown
            placeholder='הוסף חוק'
            options={ruleOptions}
            value={selectedRuleKeys}
            onChange={handleRuleSelectionChange}
            width='100%'
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
                    onRemove={() => handleRemoveRule(idx, group.label)}
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
  const ruleKey = watch(`entityRules.${index}.ruleKey`)

  // Use utility to get fields instead of inline derivation
  const allFields = useMemo(() => getRuleFields(entityType, ruleKey), [entityType, ruleKey])

  // Compute which group is the minority to label only that group
  const minorityLabel = useMemo(() => {
    const requiredCount = allFields.filter((f) => f.required).length
    const optionalCount = allFields.length - requiredCount
    if (optionalCount === 0 || requiredCount === 0) return null
    return requiredCount >= optionalCount ? 'optional' : 'required'
  }, [allFields])

  const getAnnotation = (field: { required?: boolean }): string | undefined => {
    if (!minorityLabel) return undefined
    if (minorityLabel === 'optional' && !field.required) return 'אופציונלי'
    if (minorityLabel === 'required' && field.required) return 'חובה'
    return undefined
  }

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
      <div
        style={{
          border: '1px solid #e9ecef',
          borderRadius: 8,
          padding: 16,
          position: 'relative', // To contain the absolute button
          minHeight: 100, // Ensure there's enough space for the floating button
        }}
      >
        <Button
          type='text'
          icon={<IconX size={14} />}
          onClick={onRemove}
          size='small'
          style={{
            color: '#6B7280',
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
          }}
        />

        <div style={{ width: '100%', marginTop: 24 }}>
          {ruleKey === 'custom' ?
            /* Custom rule has its own dedicated form */
            <CustomRuleInstance basePath={`entityRules.${index}.data`} control={control} />
          : <>
              {/* Functionality collapsible section */}
              <FunctionalitySection basePath={`entityRules.${index}.data.functionality`} />

              {/* Other rule fields */}
              {allFields.map((field) => (
                <RuleField
                  key={field.name}
                  basePath={`entityRules.${index}.data`}
                  field={field}
                  control={control}
                  disabledSeverities={disabledSeverities}
                  annotation={getAnnotation(field)}
                />
              ))}
            </>
          }
        </div>
      </div>
    </div>
  )
}
