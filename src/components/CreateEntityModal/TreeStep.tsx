import { useEffect, useMemo, useState } from 'react'
import { ActionIcon, Badge, Box, Flex, Group, Loader, Paper, Stack, Text, TextInput } from '@mantine/core'
import { FiSearch } from 'react-icons/fi'
import type { ApiTreeNode, TreeSelectionList } from '../../types/tree'
import { fetchTreeNodes } from '../../api/client'

type MantineNode = {
  label: React.ReactNode
  value: string
  children?: MantineNode[]
}

function apiToMantine(node: ApiTreeNode): MantineNode {
  return {
    label: node.DisplayName,
    value: node.VID,
    children: node.children?.map(apiToMantine) ?? [],
  }
}

function updateNodeChildren(nodes: MantineNode[], value: string, children: MantineNode[]): MantineNode[] {
  return nodes.map((n) => {
    if (n.value === value) {
      return { ...n, children }
    }
    if (n.children) {
      return {
        ...n,
        children: updateNodeChildren(n.children, value, children),
      }
    }
    return n
  })
}

interface TreeStepProps {
  selection: TreeSelectionList
  onSelectionChange: (selection: TreeSelectionList) => void
}

export function TreeStep({ selection, onSelectionChange }: TreeStepProps) {
  const [data, setData] = useState<MantineNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const selectedIds = useMemo(() => new Set(selection.map((item) => item.vid)), [selection])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MantineNode[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedSearch = searchTerm.trim()
  const isSearching = trimmedSearch.length > 0

  useEffect(() => {
    ;(async () => {
      const json = await fetchTreeNodes('root', 3)
      setData(json.map(apiToMantine))
    })()
  }, [])

  async function fetchChildren(vid: string) {
    setLoading((s) => ({ ...s, [vid]: true }))
    try {
      const json = await fetchTreeNodes(vid, 1)
      const mapped = json.map(apiToMantine)
      setData((prev) => (prev ? updateNodeChildren(prev, vid, mapped) : prev))
    } finally {
      setLoading((s) => ({ ...s, [vid]: false }))
    }
  }
  const SEARCH_ENDPOINT = 'https://replace-with-real-api/tree-search'
  const APP_TOKEN = '123lidor'

  const fetchSearchResults = async (term: string, signal?: AbortSignal): Promise<MantineNode[]> => {
    const url = new URL(SEARCH_ENDPOINT)
    url.searchParams.set('name', term)

    const response = await fetch(url.toString(), {
      signal,
      headers: {
        accept: 'text/plain',
        AppToken: APP_TOKEN,
      },
    })
    if (!response.ok) {
      throw new Error('Search failed')
    }
    const json = (await response.json()) as ApiTreeNode[]
    return json.map(apiToMantine)
  }

  useEffect(() => {
    if (!isSearching) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await fetchSearchResults(trimmedSearch, controller.signal)
        setSearchResults(results)
        setSearchError(null)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        setSearchResults([])
        setSearchError(error instanceof Error ? error.message : 'Search failed')
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [isSearching, trimmedSearch])

  const addSelection = (node: MantineNode) => {
    if (selectedIds.has(node.value)) {
      return
    }
    onSelectionChange([...selection, { vid: node.value, displayName: String(node.label) }])
  }

  const removeSelection = (vid: string) => {
    onSelectionChange(selection.filter((item) => item.vid !== vid))
  }

  const toggleSelection = (node: MantineNode) => {
    if (selectedIds.has(node.value)) {
      removeSelection(node.value)
    } else {
      addSelection(node)
    }
  }

  const TreeNodeView: React.FC<{ node: MantineNode; depth?: number }> = ({ node, depth = 0 }) => {
    const isOpen = expanded.includes(node.value)
    const isSelected = selectedIds.has(node.value)

    const handleExpandToggle = async () => {
      if (!isOpen) {
        if (!node.children || node.children.length === 0) {
          await fetchChildren(node.value)
        }
        setExpanded((s) => (s.includes(node.value) ? s : [...s, node.value]))
      } else {
        setExpanded((s) => s.filter((v) => v !== node.value))
      }
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
            backgroundColor: isSelected ? '#f0f4ff' : isOpen ? '#f9fafb' : '#ffffff',
            transition: 'all 0.15s ease',
            boxShadow: isSelected ? '0 2px 6px rgba(76, 110, 245, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <ActionIcon
            variant='subtle'
            radius='xl'
            color='indigo'
            onClick={handleExpandToggle}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            <Text fw={700} size='sm'>
              {isOpen ? '▾' : '▸'}
            </Text>
          </ActionIcon>

          <Flex
            align='center'
            gap='xs'
            style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
            onClick={() => toggleSelection(node)}
          >
            <Text size='sm' fw={500} c='gray.9' style={{ wordBreak: 'break-word' }}>
              {node.label}
            </Text>
          </Flex>

          <Group gap={6} wrap='nowrap'>
            {loading[node.value] && <Loader size='xs' />}
            <ActionIcon
              variant={isSelected ? 'filled' : 'light'}
              color='indigo'
              radius='xl'
              aria-label={isSelected ? 'Remove from selection' : 'Add to selection'}
              onClick={() => toggleSelection(node)}
            >
              <Text fw={800} size='sm'>
                {isSelected ? '-' : '+'}
              </Text>
            </ActionIcon>
          </Group>
        </Flex>

        {isOpen && node.children && node.children.length > 0 && (
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
              <TreeNodeView key={c.value} node={c} depth={depth + 1} />
            ))}
          </Box>
        )}
      </Box>
    )
  }

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
              <TreeNodeView key={n.value} node={n} />
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
              <TreeNodeView key={n.value} node={n} />
            ))}
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
