/**
 * RuleInstanceGroup - Shared expandable group with severity tracking
 *
 * Used in both RulesTab (entity rules) and BindingsTab (binding rules)
 * Preserves exact UI styling and behavior from original implementation
 */

import { memo, useState } from 'react'
import { Button, Typography } from 'antd'
import { IconPlus, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { GenericButton } from '../../GenericButton'
import { MAX_RULES_PER_TYPE } from './constants'

const { Text } = Typography

interface RuleInstanceGroupProps {
  ruleLabel: string
  indices: number[]
  onRemove?: (idx: number) => void
  onAddMore: () => void
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
        border: '1px solid #e9ecef',
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
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 16 }}>
            <GenericButton
              variant='link'
              text={isMaxReached ? 'מקסימום 3 חוקים' : 'הוסף חומרה'}
              icon={IconPlus}
              onClick={onAddMore}
              disabled={isMaxReached}
            />
          </div>
        </div>
      )}
    </div>
  )
})
