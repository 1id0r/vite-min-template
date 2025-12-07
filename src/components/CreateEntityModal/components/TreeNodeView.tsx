import { memo } from 'react'
import { ActionIcon, Box, Flex, Group, Loader, Text } from '@mantine/core'
import type { MantineNode } from '../../../types/tree'

interface TreeNodeViewProps {
  node: MantineNode
  depth?: number
  isSelected: boolean
  isExpanded: boolean
  isLoading: boolean
  onToggleExpansion: (nodeValue: string, hasChildren: boolean) => Promise<void>
  onToggleSelection: (node: MantineNode) => void
  // For recursive rendering, we need to pass these down
  expandedNodes: string[]
  selectedIds: Set<string>
  loadingStates: Record<string, boolean>
}

/**
 * TreeNodeView - Memoized tree node component
 *
 * Renders a single tree node with expand/collapse and selection functionality.
 * Recursively renders child nodes when expanded.
 *
 * Memoized to prevent unnecessary re-renders when parent state changes.
 */
export const TreeNodeView = memo(function TreeNodeView({
  node,
  depth = 0,
  isSelected,
  isExpanded,
  isLoading,
  onToggleExpansion,
  onToggleSelection,
  expandedNodes,
  selectedIds,
  loadingStates,
}: TreeNodeViewProps) {
  const handleExpandToggle = async () => {
    const hasChildren = node.children && node.children.length > 0
    await onToggleExpansion(node.value, hasChildren)
  }

  return (
    <Box style={{ marginBottom: 8, direction: 'rtl' }}>
      <Flex
        align='center'
        gap='sm'
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: isSelected ? '1.5px solid #4c6ef5' : '1px solid #e9ecef',
          backgroundColor: isSelected ? '#f0f4ff' : isExpanded ? '#f9fafb' : '#ffffff',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 2px 6px rgba(76, 110, 245, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <ActionIcon
          variant='subtle'
          radius='xl'
          color='indigo'
          onClick={handleExpandToggle}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <Text fw={700} size='sm'>
            {isExpanded ? '▾' : '▸'}
          </Text>
        </ActionIcon>

        <Flex
          align='center'
          gap='xs'
          style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
          onClick={() => onToggleSelection(node)}
        >
          <Text size='sm' fw={500} c='gray.9' style={{ wordBreak: 'break-word' }}>
            {node.label}
          </Text>
        </Flex>

        <Group gap={6} wrap='nowrap'>
          {isLoading && <Loader size='xs' />}
          <ActionIcon
            variant={isSelected ? 'filled' : 'light'}
            color='indigo'
            radius='xl'
            aria-label={isSelected ? 'Remove from selection' : 'Add to selection'}
            onClick={() => onToggleSelection(node)}
          >
            <Text fw={800} size='sm'>
              {isSelected ? '-' : '+'}
            </Text>
          </ActionIcon>
        </Group>
      </Flex>

      {isExpanded && node.children && node.children.length > 0 && (
        <Box
          style={{
            marginRight: 24,
            marginTop: 8,
            paddingRight: 16,
            borderRight: '2px solid #e9ecef',
            direction: 'rtl',
          }}
        >
          {node.children.map((c) => (
            <TreeNodeView
              key={c.value}
              node={c}
              depth={depth + 1}
              isSelected={selectedIds.has(c.value)}
              isExpanded={expandedNodes.includes(c.value)}
              isLoading={loadingStates[c.value] || false}
              onToggleExpansion={onToggleExpansion}
              onToggleSelection={onToggleSelection}
              expandedNodes={expandedNodes}
              selectedIds={selectedIds}
              loadingStates={loadingStates}
            />
          ))}
        </Box>
      )}
    </Box>
  )
})
