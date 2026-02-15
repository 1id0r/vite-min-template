/**
 * CustomRuleInstance - Dedicated form for the universal "custom" rule
 *
 * Structure:
 * - שם חוק (rule_name): text
 * - שם רכיב (component): segmented סטטי/דינמי → async select or text
 * - מאגר מטריקות (metrics_pool): segmented 120/140
 * - חומרות (severity_entries): up to 3 collapsible entries, each with severity/query/description/delay
 */

import { memo, useState, useEffect } from 'react'
import { Controller, useFormContext, useFieldArray } from 'react-hook-form'
import { Input, InputNumber, Button, Typography, Space } from 'antd'
import { IconPlus, IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { SEVERITY_LEVELS, SEVERITY_CONFIG } from '../../../schemas/ruleSchemas'
import { JsonEditor } from './JsonEditor'

const { Text } = Typography

interface CustomRuleInstanceProps {
  /** Base path in form, e.g. 'entityRules.0.data' */
  basePath: string
  control: any
}

export const CustomRuleInstance = memo(function CustomRuleInstance({ basePath, control }: CustomRuleInstanceProps) {
  const { watch, getValues } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.severity_entries` as any,
  })

  // Ensure at least one severity entry exists on mount
  useEffect(() => {
    const currentEntries = getValues(`${basePath}.severity_entries`)
    if (!currentEntries || currentEntries.length === 0) {
      append({ severity: undefined, query: '', run_description: '', alert_delay: 5 })
    }
  }, [basePath, getValues, append])

  // Watch severity values in real-time — no useMemo (watch returns same ref, memo won't retrigger)
  const watchedEntries = watch(`${basePath}.severity_entries`) || []
  const usedSeverities: string[] = watchedEntries.map((e: any) => e?.severity).filter(Boolean)

  const canAddMore = fields.length < 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* שם חוק */}
      <FieldRow label='שם חוק'>
        <Controller
          name={`${basePath}.rule_name`}
          control={control}
          render={({ field }) => <Input {...field} placeholder='הזן שם חוק' style={{ width: '100%' }} />}
        />
      </FieldRow>

      {/* מאגר מטריקות - Radio pills */}
      <FieldRow label='מאגר מטריקות'>
        <Controller
          name={`${basePath}.metrics_pool`}
          control={control}
          render={({ field }) => (
            <RadioPillGroup
              value={field.value || '120'}
              onChange={field.onChange}
              options={[
                { label: '120', value: '120' },
                { label: '140', value: '140' },
              ]}
            />
          )}
        />
      </FieldRow>

      {/* חומרות section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text strong style={{ fontSize: 14 }}>
            חומרות
          </Text>
          {canAddMore && (
            <Button
              type='dashed'
              size='small'
              icon={<IconPlus size={14} />}
              onClick={() => append({ severity: undefined, query: '', run_description: '', alert_delay: 5 })}
            >
              הוסף חומרה
            </Button>
          )}
        </div>

        <Space direction='vertical' style={{ width: '100%' }} size='middle'>
          {fields.map((entry, idx) => (
            <SeverityEntry
              key={entry.id}
              index={idx}
              basePath={`${basePath}.severity_entries.${idx}`}
              control={control}
              usedSeverities={usedSeverities}
              currentSeverity={watchedEntries[idx]?.severity}
              onRemove={() => remove(idx)}
              defaultExpanded
            />
          ))}
        </Space>

        {fields.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#9CA3AF' }}>
            <Text type='secondary'>לחץ על "הוסף חומרה" כדי להתחיל</Text>
          </div>
        )}
      </div>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// SeverityEntry - Collapsible severity sub-form
// ─────────────────────────────────────────────────────────────────────────────

const SeverityEntry = ({
  index,
  basePath,
  control,
  usedSeverities,
  currentSeverity,
  onRemove,
  defaultExpanded = true,
}: {
  index: number
  basePath: string
  control: any
  usedSeverities: string[]
  currentSeverity?: string
  onRemove: () => void
  defaultExpanded?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const severityLabel =
    currentSeverity ? SEVERITY_CONFIG[currentSeverity as keyof typeof SEVERITY_CONFIG]?.label : undefined

  return (
    <div
      style={{
        border: '1px solid #e9ecef',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Collapsible header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isExpanded ?
            <IconChevronDown size={16} color='#6B7280' />
          : <IconChevronRight size={16} color='#6B7280' />}
          <Text strong style={{ fontSize: 13, color: '#374151' }}>
            חומרה {index + 1}
          </Text>
          {severityLabel && !isExpanded && (
            <Text type='secondary' style={{ fontSize: 12 }}>
              — {severityLabel}
            </Text>
          )}
        </div>
        <Button
          type='text'
          icon={<IconX size={14} />}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          size='small'
          style={{ color: '#6B7280' }}
        />
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Severity - connected radio pills */}
            <FieldRow label='חומרה'>
              <Controller
                name={`${basePath}.severity`}
                control={control}
                render={({ field }) => (
                  <SeverityRadioGroup
                    value={field.value}
                    onChange={field.onChange}
                    usedSeverities={usedSeverities}
                    currentSeverity={currentSeverity}
                  />
                )}
              />
            </FieldRow>

            {/* שליפה - JSON */}
            <FieldRow label='שליפה' stacked>
              <Controller
                name={`${basePath}.query`}
                control={control}
                render={({ field }) => (
                  <JsonEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    height='120px'
                    placeholder='{"query": {...}}'
                  />
                )}
              />
            </FieldRow>

            {/* תיאור הרצה */}
            <FieldRow label='תיאור הרצה'>
              <Controller
                name={`${basePath}.run_description`}
                control={control}
                render={({ field }) => <Input {...field} placeholder='הזן תיאור' style={{ width: '100%' }} />}
              />
            </FieldRow>

            {/* שיהוי התראה */}
            <FieldRow label='שיהוי התראה'>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Controller
                  name={`${basePath}.alert_delay`}
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={2} max={15} placeholder='2-15' style={{ width: 100 }} />
                  )}
                />
                <Text type='secondary' style={{ whiteSpace: 'nowrap' }}>
                  דקות
                </Text>
              </div>
            </FieldRow>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SeverityRadioGroup - Connected pill-style radio buttons
// ─────────────────────────────────────────────────────────────────────────────

const SeverityRadioGroup = ({
  value,
  onChange,
  usedSeverities,
  currentSeverity,
}: {
  value?: string
  onChange: (val: string) => void
  usedSeverities: string[]
  currentSeverity?: string
}) => (
  <div
    style={{
      display: 'inline-flex',
      border: '1px solid #d9d9d9',
      borderRadius: 6,
      overflow: 'hidden',
    }}
  >
    {SEVERITY_LEVELS.map((sev) => {
      const config = SEVERITY_CONFIG[sev]
      const isSelected = value === sev
      const isDisabled = usedSeverities.includes(sev) && currentSeverity !== sev
      return (
        <div
          key={sev}
          onClick={() => !isDisabled && onChange(sev)}
          style={{
            padding: '4px 14px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            backgroundColor: isSelected ? '#1677ff' : 'transparent',
            color:
              isSelected ? '#fff'
              : isDisabled ? '#bfbfbf'
              : '#595959',
            borderRight: 'none',
            fontWeight: isSelected ? 600 : 400,
            fontSize: 13,
            transition: 'all 0.15s ease',
            opacity: isDisabled ? 0.45 : 1,
            lineHeight: '22px',
          }}
        >
          {config.label}
        </div>
      )
    })}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// FieldRow - Inline label + input layout (RTL)
// ─────────────────────────────────────────────────────────────────────────────

const FieldRow = ({
  label,
  children,
  stacked = false,
}: {
  label: string
  children: React.ReactNode
  stacked?: boolean
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: stacked ? 'column' : 'row',
      alignItems: stacked ? 'flex-start' : 'center',
      gap: stacked ? 8 : 0,
    }}
  >
    <Text strong style={{ fontSize: 14, width: stacked ? '100%' : 100, marginLeft: stacked ? 0 : 12, flexShrink: 0 }}>
      {label}
    </Text>
    <div style={{ flex: 1, width: stacked ? '100%' : undefined }}>{children}</div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// RadioPillGroup - Connected radio pill group (reusable)
// ─────────────────────────────────────────────────────────────────────────────

const RadioPillGroup = ({
  value,
  onChange,
  options,
  small = false,
}: {
  value: string
  onChange: (val: string) => void
  options: Array<{ label: string; value: string }>
  small?: boolean
}) => (
  <div
    style={{
      display: 'inline-flex',
      border: '1px solid #d9d9d9',
      borderRadius: 6,
      overflow: 'hidden',
    }}
  >
    {options.map((opt) => {
      const isSelected = value === opt.value
      return (
        <div
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: small ? '2px 10px' : '4px 14px',
            cursor: 'pointer',
            backgroundColor: isSelected ? '#1677ff' : 'transparent',
            color: isSelected ? '#fff' : '#595959',
            fontWeight: isSelected ? 600 : 400,
            fontSize: small ? 12 : 13,
            transition: 'all 0.15s ease',
            lineHeight: small ? '20px' : '22px',
          }}
        >
          {opt.label}
        </div>
      )
    })}
  </div>
)
