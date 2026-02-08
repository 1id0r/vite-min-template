/**
 * TreeStep Component
 *
 * Tree selection step for entity creation with search functionality.
 * Uses virtualized rendering for 600k+ nodes.
 */

import { useCallback, useMemo } from 'react'
import { Input, Space, Spin, Typography } from 'antd'
import { IconSearch } from '@tabler/icons-react'
import type { TreeSelectionList } from '../../../../types/tree'
import { useTreeData, VirtualTreeList, SelectionTags, TreeNodeView, type TreeNode } from './tree'

const { Text } = Typography

interface TreeStepProps {
  selection: TreeSelectionList
  onSelectionChange: (selection: TreeSelectionList) => void
}

export function TreeStep({ selection, onSelectionChange }: TreeStepProps) {
  const {
    nodeMap,
    rootIds,
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

  // Selection handlers (memoized)
  const addSelection = useCallback(
    (node: TreeNode) => {
      onSelectionChange([...selection, { vid: node.value, displayName: String(node.label) }])
    },
    [selection, onSelectionChange],
  )

  const removeSelection = useCallback(
    (vid: string) => {
      onSelectionChange(selection.filter((item) => item.vid !== vid))
    },
    [selection, onSelectionChange],
  )

  const toggleSelection = useCallback(
    (node: TreeNode) => {
      if (selectedIds.has(node.value)) {
        removeSelection(node.value)
      } else {
        addSelection(node)
      }
    },
    [selectedIds, addSelection, removeSelection],
  )

  // Expand handler - fetches children if not loaded
  const handleToggleExpand = useCallback(
    async (vid: string, hasChildren: boolean) => {
      const isOpen = expanded.has(vid)

      if (!isOpen && !hasChildren) {
        // Not open and no children loaded yet - fetch them
        await fetchChildren(vid)
      }
      toggleExpanded(vid)
    },
    [expanded, fetchChildren, toggleExpanded],
  )

  // Render search result node (non-virtualized, flat list)
  const renderSearchNode = useCallback(
    (node: TreeNode) => (
      <TreeNodeView
        key={node.value}
        node={node}
        depth={0}
        isOpen={false}
        isSelected={selectedIds.has(node.value)}
        isLoading={false}
        onToggleExpand={() => {}}
        onToggleSelection={() => toggleSelection(node)}
      />
    ),
    [selectedIds, toggleSelection],
  )

  // Loading state
  if (Object.keys(nodeMap).length === 0) {
    return <Spin />
  }

  return (
    <Space direction='vertical' size='middle' style={{ width: '100%', direction: 'rtl' }}>
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
          <div>{searchResults.map(renderSearchNode)}</div>
        </div>
      : <div>
          <Text type='secondary' style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            הרחיבו ענפים ובחרו באמצעות +
          </Text>
          <VirtualTreeList
            nodeMap={nodeMap}
            rootIds={rootIds}
            expanded={expanded}
            selectedIds={selectedIds}
            loading={loading}
            onToggleExpand={handleToggleExpand}
            onToggleSelection={toggleSelection}
          />
        </div>
      }
    </Space>
  )
}
