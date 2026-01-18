import { useState, type ReactNode } from 'react'
import { Button, Typography } from 'antd'
import { PlusOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
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
            })
          )}

          {/* Add More Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type='dashed' icon={<PlusOutlined />} onClick={onAddMore} disabled={isMaxReached}>
              {isMaxReached ? 'מקסימום 3 חוקים' : 'הוסף חוק'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
