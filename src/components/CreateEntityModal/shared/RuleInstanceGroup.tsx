/**
 * RuleInstanceGroup - Shared expandable group with severity tracking
 *
 * Used in both RulesTab (entity rules) and BindingsTab (binding rules)
 * Preserves exact UI styling and behavior from original implementation
 */

import { memo, useState } from 'react'
import { Button, Typography } from 'antd'
import { IconPlus, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { MAX_RULES_PER_TYPE } from './constants'

const { Text } = Typography

interface RuleInstanceGroupProps {
  /** Label for the group header */
  ruleLabel: string
  /** Indices of rule instances in this group */
  indices: number[]
  /** Callback when remove button is clicked (optional - removal can be handled in renderInstance) */
  onRemove?: (idx: number) => void
  /** Callback when "add more" is clicked */
  onAddMore: () => void
  /** Render function for each rule instance */
  renderInstance: (idx: number, showDivider: boolean) => React.ReactNode
}

export const RuleInstanceGroup = memo(function RuleInstanceGroup({
  ruleLabel,
  indices,
  onAddMore,
  renderInstance,
}: RuleInstanceGroupProps) {
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
          {indices.map((idx, i) => renderInstance(idx, i < indices.length - 1))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type='dashed' icon={<IconPlus size={14} />} onClick={onAddMore} disabled={isMaxReached}>
              {isMaxReached ? 'מקסימום 3 חוקים' : 'הוסף חוק'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

RuleInstanceGroup.displayName = 'RuleInstanceGroup'
