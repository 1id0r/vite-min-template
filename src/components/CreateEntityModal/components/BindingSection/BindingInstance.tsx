/**
 * BindingInstance - Single Binding Instance with Rules
 *
 * Renders a single binding instance (e.g., one URL or one Elastic query)
 * with its form fields and associated rules. Fully generic and config-driven.
 */

import { memo, useState, useMemo } from 'react'
import { Typography, Button } from 'antd'
import { IconX, IconChevronDown, IconChevronRight, IconPlus } from '@tabler/icons-react'
import type { BindingMetadata } from '../../../../schemas/fieldConfigs'
import { BindingForm, StandaloneRuleField, RuleInstanceGroup, getRuleFields, MultiSelectDropdown } from '../../shared'
import { useRuleInstances } from '../../hooks/useRuleInstances'

const { Text } = Typography

interface BindingInstanceProps {
  config: BindingMetadata
  index: number
  control: any
  onRemove: () => void
  showDivider: boolean
}

export const BindingInstance = memo(function BindingInstance({
  config,
  index,
  control,
  onRemove,
  showDivider,
}: BindingInstanceProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const basePath = `${config.fieldArrayName}.${index}`

  // Use hook to manage rule instances and severities
  const rules = useRuleInstances(config.type as 'url' | 'elastic')

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
              {config.title} {index + 1}
            </Text>
          </div>
          <Button type='text' icon={<IconX size={14} />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>

        {isExpanded && (
          <div style={{ direction: 'rtl', padding: 16 }}>
            <BindingForm bindingType={config.type as 'url' | 'elastic'} basePath={basePath} control={control} />

            {/* Rules - show button or dropdown */}
            {rules.selectedRules.length === 0 && !rules.showDropdown ?
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8, marginBottom: 16 }}>
                <Button type='dashed' icon={<IconPlus size={14} />} onClick={rules.openDropdown}>
                  הוסף חוק
                </Button>
              </div>
            : <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 8 }}>
                <Text strong style={{ whiteSpace: 'nowrap' }}>
                  חוק
                </Text>
                <MultiSelectDropdown
                  placeholder='הוסף חוק'
                  options={rules.ruleOptions}
                  value={rules.selectedRules}
                  onChange={rules.handleSelectionChange}
                  width='100%'
                />
              </div>
            }

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
                        entityType={config.type}
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
// Rule Instance Item - Using shared getRuleFields utility
// ─────────────────────────────────────────────────────────────────────────────

interface RuleInstanceItemProps {
  idx: number
  ruleKey: string
  entityType: string
  onRemove: () => void
  showDivider: boolean
  disabledSeverities: string[]
  currentSeverity?: string
  onSeverityChange: (severity: string) => void
}

const RuleInstanceItem = memo(function RuleInstanceItem({
  ruleKey,
  entityType,
  onRemove,
  showDivider,
  disabledSeverities,
  currentSeverity,
  onSeverityChange,
}: RuleInstanceItemProps) {
  // Use shared utility instead of inline field derivation
  const allFields = useMemo(() => getRuleFields(entityType, ruleKey), [entityType, ruleKey])

  return (
    <div
      style={{
        marginBottom: showDivider ? 12 : 0,
      }}
    >
      <div
        style={{
          border: '1px solid #e9ecef',
          borderRadius: 8,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <Button type='text' icon={<IconX size={14} />} onClick={onRemove} size='small' style={{ color: '#6B7280' }} />
        </div>
        <div style={{ padding: '0 8px 8px 8px' }}>
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
      </div>
    </div>
  )
})
