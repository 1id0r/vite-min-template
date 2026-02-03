/**
 * TreeStep Component
 *
 * Tree selection step for entity creation with search functionality.
 * Refactored to use extracted components and hooks from tree/ module.
 */

import { useMemo } from 'react'
import { Input, Space, Spin, Typography } from 'antd'
import { IconSearch } from '@tabler/icons-react'
import type { TreeSelectionList } from '../../../../types/tree'
import { useTreeData, TreeNodeView, SelectionTags, type TreeNode } from './tree'

const { Text } = Typography

interface TreeStepProps {
  selection: TreeSelectionList
  onSelectionChange: (selection: TreeSelectionList) => void
}

export function TreeStep({ selection, onSelectionChange }: TreeStepProps) {
  const {
    data,
    expanded,
    loading,
    searchTerm,
    setSearchTerm,
    searchResults,
    searching,
    searchError,
    isSearching,
    fetchChildren,
    toggleExpanded,
  } = useTreeData()

  const selectedIds = useMemo(() => new Set(selection.map((item) => item.vid)), [selection])

  // Selection handlers
  const addSelection = (node: TreeNode) => {
    if (selectedIds.has(node.value)) return
    onSelectionChange([...selection, { vid: node.value, displayName: String(node.label) }])
  }

  const removeSelection = (vid: string) => {
    onSelectionChange(selection.filter((item) => item.vid !== vid))
  }

  const toggleSelection = (node: TreeNode) => {
    if (selectedIds.has(node.value)) {
      removeSelection(node.value)
    } else {
      addSelection(node)
    }
  }

  // Recursive node renderer
  const renderNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isOpen = expanded.includes(node.value)
    const isSelected = selectedIds.has(node.value)

    const handleToggleExpand = async () => {
      if (!isOpen) {
        if (!node.children || node.children.length === 0) {
          await fetchChildren(node.value)
        }
        toggleExpanded(node.value)
      } else {
        toggleExpanded(node.value)
      }
    }

    return (
      <TreeNodeView
        key={node.value}
        node={node}
        depth={depth}
        isOpen={isOpen}
        isSelected={isSelected}
        isLoading={loading[node.value] ?? false}
        onToggleExpand={handleToggleExpand}
        onToggleSelection={() => toggleSelection(node)}
        renderChildren={
          isOpen && node.children && node.children.length > 0 ?
            () => node.children!.map((c) => renderNode(c, depth + 1))
          : undefined
        }
      />
    )
  }

  if (!data) {
    return <Spin />
  }

  return (
    <Space orientation='vertical' size='middle' style={{ width: '100%', direction: 'rtl' }}>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='חיפוש'
        prefix={<IconSearch size={16} style={{ color: '#6B7280' }} />}
        style={{ textAlign: 'right' }}
      />

      <SelectionTags selection={selection} onRemove={removeSelection} />

      {isSearching ?
        <div>
          <Space align='center' style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 14 }}>
              תוצאות חיפוש
            </Text>
            {searching && <Spin size='small' />}
          </Space>
          {searchError && (
            <Text type='danger' style={{ fontSize: 14 }}>
              {searchError}
            </Text>
          )}
          {!searching && searchResults.length === 0 && !searchError && (
            <Text type='secondary' style={{ fontSize: 14 }}>
              אין תוצאות לחיפוש
            </Text>
          )}
          <div>{searchResults.map((n) => renderNode(n))}</div>
        </div>
      : <div>
          <Text type='secondary' style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            הרחיבו ענפים ובחרו באמצעות +
          </Text>
          <div>{data.map((n) => renderNode(n))}</div>
        </div>
      }
    </Space>
  )
}
