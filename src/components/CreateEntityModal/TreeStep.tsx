import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActionIcon, Alert, Box, Button, Group, Loader, Paper, Stack, Text } from '@mantine/core'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { fetchTreeNodes } from '../../api/client'
import type { ApiTreeNode, TreeSelection } from '../../types/tree'

type MantineNode = {
  label: string
  value: string
  children?: MantineNode[]
}

const apiToMantine = (node: ApiTreeNode): MantineNode => ({
  label: node.DisplayName,
  value: node.VID,
  children: node.children?.map(apiToMantine) ?? [],
})

const updateNodeChildren = (nodes: MantineNode[], value: string, children: MantineNode[]): MantineNode[] =>
  nodes.map((n) => {
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

interface TreeStepProps {
  selection: TreeSelection | null
  onSelect: (selection: TreeSelection) => void
}

export function TreeStep({ selection, onSelect }: TreeStepProps) {
  const [nodes, setNodes] = useState<MantineNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [rootLoading, setRootLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVid, setSelectedVid] = useState<string | null>(selection?.vid ?? null)

  useEffect(() => {
    setSelectedVid(selection?.vid ?? null)
  }, [selection])

  const handleRootLoad = useCallback(async () => {
    setRootLoading(true)
    setError(null)
    try {
      const data = await fetchTreeNodes('root', 3)
      setNodes(data.map(apiToMantine))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tree')
    } finally {
      setRootLoading(false)
    }
  }, [])

  useEffect(() => {
    handleRootLoad()
  }, [handleRootLoad])

  const fetchChildren = useCallback(async (vid: string) => {
    setLoading((s) => ({ ...s, [vid]: true }))
    setError(null)
    try {
      const data = await fetchTreeNodes(vid, 3)
      const mapped = data.map(apiToMantine)
      setNodes((prev) => (prev ? updateNodeChildren(prev, vid, mapped) : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children')
    } finally {
      setLoading((s) => ({ ...s, [vid]: false }))
    }
  }, [])

  const handleExpandToggle = useCallback(
    async (node: MantineNode) => {
      const isOpen = expanded.includes(node.value)
      if (!isOpen) {
        if (!node.children || node.children.length === 0) {
          await fetchChildren(node.value)
        }
        setExpanded((prev) => (prev.includes(node.value) ? prev : [...prev, node.value]))
      } else {
        setExpanded((prev) => prev.filter((v) => v !== node.value))
      }
    },
    [expanded, fetchChildren]
  )

  const handleSelect = useCallback(
    (node: MantineNode) => {
      const label = typeof node.label === 'string' ? node.label : node.value
      setSelectedVid(node.value)
      onSelect({ displayName: label, vid: node.value })
    },
    [onSelect]
  )

  const rootState = useMemo(() => {
    if (rootLoading) {
      return (
        <Group justify='center' py='md'>
          <Loader />
        </Group>
      )
    }

    if (!nodes) {
      return (
        <Stack gap='xs'>
          <Text size='sm' c='dimmed'>
            No tree data loaded yet.
          </Text>
          <Button size='xs' variant='light' onClick={handleRootLoad}>
            Retry
          </Button>
        </Stack>
      )
    }

    return (
      <Stack gap='sm'>
        {nodes.map((node) => (
          <TreeNodeView
            key={node.value}
            node={node}
            depth={0}
            expanded={expanded}
            loading={loading}
            selectedVid={selectedVid}
            onToggle={handleExpandToggle}
            onSelect={handleSelect}
          />
        ))}
      </Stack>
    )
  }, [expanded, handleExpandToggle, handleRootLoad, handleSelect, loading, nodes, rootLoading, selectedVid])

  return (
    <Stack gap='md' style={{ flex: 1 }}>
      <Stack gap={4} align='flex-end'>
        <Text size='sm' fw={700} c='gray.8'>
          בחירת צומת לניטור
        </Text>
        <Text size='sm' c='dimmed' ta='right'>
          פתחו את העץ ובחרו רכיב. שם התצוגה וה-VID יישמרו כחלק מהישות המנוטרת.
        </Text>
      </Stack>

      {error && (
        <Alert color='red' title='טעינת עץ נכשלה'>
          <Group justify='space-between'>
            <Text size='sm'>{error}</Text>
            <Button size='xs' variant='light' onClick={handleRootLoad}>
              נסה שוב
            </Button>
          </Group>
        </Alert>
      )}

      <Box>{rootState}</Box>
    </Stack>
  )
}

interface TreeNodeViewProps {
  node: MantineNode
  depth: number
  expanded: string[]
  loading: Record<string, boolean>
  selectedVid: string | null
  onToggle: (node: MantineNode) => void
  onSelect: (node: MantineNode) => void
}

const TreeNodeView = ({
  node,
  depth,
  expanded,
  loading,
  selectedVid,
  onToggle,
  onSelect,
}: TreeNodeViewProps) => {
  const isOpen = expanded.includes(node.value)
  const isLoading = loading[node.value]
  const isSelected = selectedVid === node.value
  const hasChildren = (node.children?.length ?? 0) > 0

  return (
    <Stack gap={8} style={{ marginLeft: depth === 0 ? 0 : 24 }}>
      <Paper
        withBorder
        radius='md'
        p='sm'
        style={{
          backgroundColor: isSelected ? '#f0f4ff' : '#fff',
          borderColor: isSelected ? '#4c6ef5' : undefined,
          transition: 'all 0.2s ease',
        }}
      >
        <Group justify='space-between' wrap='nowrap' gap='sm' align='center'>
          <Group gap='xs' wrap='nowrap'>
            <ActionIcon
              variant='subtle'
              radius='xl'
              size='md'
              onClick={() => onToggle(node)}
              disabled={isLoading}
              aria-label={isOpen ? 'Collapse node' : 'Expand node'}
            >
              {isLoading ? <Loader size='xs' /> : isOpen ? <FiChevronDown /> : <FiChevronRight />}
            </ActionIcon>
            <Box>
              <Text size='sm' fw={600}>
                {node.label}
              </Text>
              <Text size='xs' c='dimmed'>
                {node.value}
              </Text>
            </Box>
          </Group>

          <Button size='xs' variant={isSelected ? 'filled' : 'light'} onClick={() => onSelect(node)}>
            {isSelected ? 'נבחר' : 'בחר'}
          </Button>
        </Group>
      </Paper>

      {isOpen && hasChildren && (
        <Stack gap={8} pl='lg' style={{ borderLeft: '1px solid #e9ecef' }}>
          {node.children?.map((child) => (
            <TreeNodeView
              key={child.value}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              loading={loading}
              selectedVid={selectedVid}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
