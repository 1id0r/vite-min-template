/**
 * VirtualTreeList Component
 *
 * Virtualized tree renderer for 600k+ nodes.
 * Only renders visible rows in the viewport for optimal performance.
 */

import { memo, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TreeNodeView } from './TreeNodeView'
import { type TreeNode, type TreeNodeMap } from './treeTypes'

export interface VirtualTreeListProps {
  nodeMap: TreeNodeMap
  rootIds: string[]
  expanded: Set<string>
  selectedIds: Set<string>
  loading: Record<string, boolean>
  onToggleExpand: (vid: string, hasChildren: boolean) => void
  onToggleSelection: (node: TreeNode) => void
  estimateSize?: number
  overscan?: number
}

/**
 * Flatten visible nodes into a list for virtualization.
 * Only includes nodes whose ancestors are all expanded.
 */
function getVisibleNodes(
  nodeMap: TreeNodeMap,
  rootIds: string[],
  expanded: Set<string>,
): { node: TreeNode; depth: number }[] {
  const result: { node: TreeNode; depth: number }[] = []

  function traverse(ids: string[], depth: number) {
    for (const id of ids) {
      const node = nodeMap[id]
      if (!node) continue

      result.push({ node, depth })

      // If expanded, traverse children
      if (expanded.has(id) && node.childIds.length > 0) {
        traverse(node.childIds, depth + 1)
      }
    }
  }

  traverse(rootIds, 0)
  return result
}

export const VirtualTreeList = memo(function VirtualTreeList({
  nodeMap,
  rootIds,
  expanded,
  selectedIds,
  loading,
  onToggleExpand,
  onToggleSelection,
  estimateSize = 56,
  overscan = 10,
}: VirtualTreeListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Compute visible nodes (memoized)
  const visibleNodes = useMemo(() => getVisibleNodes(nodeMap, rootIds, expanded), [nodeMap, rootIds, expanded])

  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  const handleToggleExpand = useCallback(
    (vid: string, hasChildren: boolean) => {
      onToggleExpand(vid, hasChildren)
    },
    [onToggleExpand],
  )

  const handleToggleSelection = useCallback(
    (node: TreeNode) => {
      onToggleSelection(node)
    },
    [onToggleSelection],
  )

  return (
    <div
      ref={parentRef}
      style={{
        height: '400px',
        overflow: 'auto',
        direction: 'rtl',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const { node, depth } = visibleNodes[virtualRow.index]
          const isOpen = expanded.has(node.value)
          const isSelected = selectedIds.has(node.value)
          const hasChildren = node.childIds.length > 0

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                paddingRight: `${depth * 24}px`,
                boxSizing: 'border-box',
              }}
            >
              <TreeNodeView
                node={node}
                depth={depth}
                isOpen={isOpen}
                isSelected={isSelected}
                isLoading={loading[node.value] ?? false}
                onToggleExpand={() => handleToggleExpand(node.value, hasChildren)}
                onToggleSelection={() => handleToggleSelection(node)}
                // No renderChildren - virtualization handles hierarchy via depth padding
              />
            </div>
          )
        })}
      </div>
    </div>
  )
})
