import { useState, type ReactNode } from 'react'
import { Button, Typography } from 'antd'
import { IconPlus, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { GenericButton } from '../../GenericButton'
import { MAX_RULES_PER_TYPE } from './constants'

const { Text } = Typography

interface RuleGroupProps {
  label: string
  indices: number[]
  onAddMore: () => void
  children: (props: { idx: number; i: number; disabledSeverities: string[] }) => ReactNode
  usedSeverities?: Record<number, string>
}

/**
 * Generic expandable rule group container
 * - Handles expand/collapse
 * - Enforces max 3 rules limit
 * - Tracks used severities per instance
 */
export const RuleGroup = ({ label, indices, onAddMore, children, usedSeverities = {} }: RuleGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const getDisabledSeverities = (currentIdx: number) =>
    Object.entries(usedSeverities)
      .filter(([idx]) => Number(idx) !== currentIdx)
      .map(([, severity]) => severity)

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
      {/* Group Header */}
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ wordBreak: 'break-word' }}>
            {label}
          </Text>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {indices.map((idx, i) =>
            children({
              idx,
              i,
              disabledSeverities: getDisabledSeverities(idx),
            }),
          )}

          {/* Add More Button */}
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
}
