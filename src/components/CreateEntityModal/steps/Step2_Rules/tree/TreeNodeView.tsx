/**
 * TreeNodeView Component
 *
 * Renders a single tree node with expand/collapse and selection functionality.
 */

import { memo } from 'react'
import { Button, Space, Spin, Typography } from 'antd'
import { IconPlus, IconMinus, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { TreeNode } from './treeTypes'

const { Text } = Typography

export interface TreeNodeViewProps {
  node: TreeNode
  depth?: number
  isOpen: boolean
  isSelected: boolean
  isLoading: boolean
  onToggleExpand: () => void
  onToggleSelection: () => void
  renderChildren?: () => React.ReactNode
}

export const TreeNodeView = memo(function TreeNodeView({
  node,
  isOpen,
  isSelected,
  isLoading,
  onToggleExpand,
  onToggleSelection,
  renderChildren,
}: TreeNodeViewProps) {
  return (
    <div style={{ marginBottom: 8, direction: 'rtl' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: isSelected ? '1.5px solid #4c6ef5' : '1px solid #e9ecef',
          backgroundColor:
            isSelected ? '#f0f4ff'
            : isOpen ? '#f9fafb'
            : '#ffffff',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 2px 6px rgba(76, 110, 245, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Button
          type='text'
          shape='circle'
          size='small'
          onClick={onToggleExpand}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          icon={isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        />

        <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={onToggleSelection}>
          <Text strong style={{ wordBreak: 'break-word' }}>
            {node.label}
          </Text>
        </div>

        <Space size={6}>
          {isLoading && <Spin size='small' />}
          <Button
            type={isSelected ? 'primary' : 'default'}
            shape='circle'
            size='small'
            aria-label={isSelected ? 'Remove from selection' : 'Add to selection'}
            onClick={onToggleSelection}
            icon={isSelected ? <IconMinus size={14} /> : <IconPlus size={14} />}
          />
        </Space>
      </div>

      {isOpen && renderChildren && (
        <div
          style={{
            marginRight: 24,
            marginTop: 8,
            paddingRight: 16,
            borderRight: '2px solid #e9ecef',
            direction: 'rtl',
          }}
        >
          {renderChildren()}
        </div>
      )}
    </div>
  )
})
