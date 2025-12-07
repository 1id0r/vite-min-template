import { useCallback, useMemo } from 'react'
import { ActionIcon, Badge, Box, Group, Loader, Paper, Stack, Text, TextInput } from '@mantine/core'
import { FiSearch } from 'react-icons/fi'
import type { TreeSelectionList, MantineNode } from '../../types/tree'
import { TREE_SEARCH_ENDPOINT, TREE_SEARCH_APP_TOKEN, TREE_SEARCH_DEBOUNCE_MS } from './constants/treeConfig'
import { TreeNodeView } from './components/TreeNodeView'
import { useTreeData } from './hooks/useTreeData'
import { useTreeSearch } from './hooks/useTreeSearch'

interface TreeStepProps {
  selection: TreeSelectionList
  onSelectionChange: (selection: TreeSelectionList) => void
}

/**
 * TreeStep - Hierarchical tree navigation with search
 *
 * Provides a tree view with:
 * - Lazy loading of child nodes on expansion
 * - Debounced search with result display
 * - Multi-selection via + buttons
 * - Visual feedback for selected/expanded states
 */
export function TreeStep({ selection, onSelectionChange }: TreeStepProps) {
  // Tree data management hook
  const { data, expanded, loading, setExpanded, fetchChildren } = useTreeData()

  // Tree search hook (the main big hook - handles debouncing and request cancellation)
  const { searchTerm, setSearchTerm, isSearching, searchResults, searching, searchError } = useTreeSearch({
    searchEndpoint: TREE_SEARCH_ENDPOINT,
    appToken: TREE_SEARCH_APP_TOKEN,
    debounceMs: TREE_SEARCH_DEBOUNCE_MS,
  })

  // Selection helpers
  const selectedIds = useMemo(() => new Set(selection.map((item) => item.vid)), [selection])

  const addSelection = useCallback(
    (node: MantineNode) => {
      if (selectedIds.has(node.value)) {
        return
      }
      onSelectionChange([...selection, { vid: node.value, displayName: String(node.label) }])
    },
    [selectedIds, selection, onSelectionChange]
  )

  const removeSelection = useCallback(
    (vid: string) => {
      onSelectionChange(selection.filter((item) => item.vid !== vid))
    },
    [selection, onSelectionChange]
  )

  const toggleSelection = useCallback(
    (node: MantineNode) => {
      if (selectedIds.has(node.value)) {
        removeSelection(node.value)
      } else {
        addSelection(node)
      }
    },
    [selectedIds, addSelection, removeSelection]
  )

  const toggleExpansion = useCallback(
    async (nodeValue: string, hasChildren: boolean) => {
      const isOpen = expanded.includes(nodeValue)
      if (!isOpen) {
        if (!hasChildren) {
          await fetchChildren(nodeValue)
        }
        setExpanded((s) => (s.includes(nodeValue) ? s : [...s, nodeValue]))
      } else {
        setExpanded((s) => s.filter((v) => v !== nodeValue))
      }
    },
    [expanded, fetchChildren, setExpanded]
  )

  if (!data) {
    return <Loader />
  }

  return (
    <Stack gap='md' style={{ direction: 'rtl' }}>
      <TextInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        placeholder='חיפוש'
        radius='lg'
        size='md'
        rightSection={<FiSearch size={16} color='#6B7280' />}
        styles={{
          input: {
            textAlign: 'right',
          },
        }}
      />

      <Stack gap={6}>
        <Text size='sm' fw={600}>
          בחירות
        </Text>
        <Paper withBorder radius='md' p='sm'>
          {selection.length === 0 ? (
            <Text size='sm' c='dimmed'>
              הוסיפו פריטים באמצעות הסימן +
            </Text>
          ) : (
            <Group gap='xs'>
              {selection.map((item) => (
                <Badge
                  key={item.vid}
                  radius='xl'
                  variant='light'
                  color='indigo'
                  rightSection={
                    <ActionIcon
                      size='xs'
                      variant='subtle'
                      color='indigo'
                      radius='xl'
                      aria-label='הסר'
                      onClick={() => removeSelection(item.vid)}
                    >
                      <Text fw={800} size={'sm'}>
                        x
                      </Text>
                    </ActionIcon>
                  }
                >
                  {item.displayName}
                </Badge>
              ))}
            </Group>
          )}
        </Paper>
      </Stack>

      {isSearching ? (
        <Stack gap={8}>
          <Group gap='xs' align='center'>
            <Text size='sm' fw={600}>
              תוצאות חיפוש
            </Text>
            {searching && <Loader size='xs' />}
          </Group>
          {searchError && (
            <Text size='sm' c='red.6'>
              {searchError}
            </Text>
          )}
          {!searching && searchResults.length === 0 && !searchError && (
            <Text size='sm' c='dimmed'>
              אין תוצאות לחיפוש
            </Text>
          )}
          <Box>
            {searchResults.map((n) => (
              <TreeNodeView
                key={n.value}
                node={n}
                isSelected={selectedIds.has(n.value)}
                isExpanded={expanded.includes(n.value)}
                isLoading={loading[n.value] || false}
                onToggleExpansion={toggleExpansion}
                onToggleSelection={toggleSelection}
                expandedNodes={expanded}
                selectedIds={selectedIds}
                loadingStates={loading}
              />
            ))}
          </Box>
        </Stack>
      ) : (
        <Stack gap={8}>
          <Text size='sm' c='dimmed'>
            הרחיבו ענפים ובחרו באמצעות +
          </Text>
          <Box>
            {data.map((n) => (
              <TreeNodeView
                key={n.value}
                node={n}
                isSelected={selectedIds.has(n.value)}
                isExpanded={expanded.includes(n.value)}
                isLoading={loading[n.value] || false}
                onToggleExpansion={toggleExpansion}
                onToggleSelection={toggleSelection}
                expandedNodes={expanded}
                selectedIds={selectedIds}
                loadingStates={loading}
              />
            ))}
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
