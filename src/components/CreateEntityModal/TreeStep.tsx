import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Group, Loader, Paper, Stack, Text, UnstyledButton } from '@mantine/core'
import { fetchTreeNodes } from '../../api/client'
import type { TreeSelection, ApiTreeNode } from '../../types/tree'

type MantineNode = {
  label: string
  value: string
  children?: MantineNode[]
}

type LoadingState = Record<string, boolean>

const apiToMantine = (node: ApiTreeNode): MantineNode => ({
  label: node.DisplayName,
  value: node.VID,
  children: node.children?.map(apiToMantine) ?? [],
})

const updateNodeChildren = (nodes: MantineNode[], value: string, children: MantineNode[]): MantineNode[] =>
  nodes.map((node) => {
    if (node.value === value) {
      return { ...node, children }
    }
    if (node.children) {
      return { ...node, children: updateNodeChildren(node.children, value, children) }
    }
    return node
  })

interface TreeStepProps {
  selection: TreeSelection | null
  onSelectionChange: (selection: TreeSelection) => void
}

export function TreeStep({ selection, onSelectionChange }: TreeStepProps) {
  const [nodes, setNodes] = useState<MantineNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<LoadingState>({})
  const [error, setError] = useState<string | null>(null)

  const selectedVid = selection?.vid ?? null
  const selectedLabel = selection?.displayName ?? null

  const setLoadingForNode = useCallback((value: string, isLoading: boolean) => {
    setLoading((state) => ({
      ...state,
      [value]: isLoading,
    }))
  }, [])

  const loadRoot = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchTreeNodes('root', 3)
      setNodes(data.map(apiToMantine))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tree')
    }
  }, [])

  useEffect(() => {
    loadRoot()
  }, [loadRoot])

  const fetchChildren = useCallback(
    async (vid: string) => {
      setLoadingForNode(vid, true)
      try {
        const data = await fetchTreeNodes(vid, 3)
        const mapped = data.map(apiToMantine)
        setNodes((prev) => (prev ? updateNodeChildren(prev, vid, mapped) : prev))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load children')
      } finally {
        setLoadingForNode(vid, false)
      }
    },
    [setLoadingForNode]
  )

  const handleSelection = useCallback(
    (node: MantineNode) => {
      const label = typeof node.label === 'string' ? node.label : node.value
      onSelectionChange({
        vid: node.value,
        displayName: label,
      })
    },
    [onSelectionChange]
  )

  const handleToggle = useCallback(
    async (node: MantineNode) => {
      const isOpen = expanded.includes(node.value)
      handleSelection(node)

      if (!isOpen) {
        if (!node.children || node.children.length === 0) {
          await fetchChildren(node.value)
        }
        setExpanded((state) => (state.includes(node.value) ? state : [...state, node.value]))
      } else {
        setExpanded((state) => state.filter((id) => id !== node.value))
      }
    },
    [expanded, fetchChildren, handleSelection]
  )

  const headerText = useMemo(() => {
    if (selectedVid && selectedLabel) {
      return `בחרת צומת: ${selectedLabel} (${selectedVid})`
    }
    if (selectedVid) {
      return `בחרת צומת: ${selectedVid}`
    }
    return 'בחר צומת מהרשימה כדי להמשיך'
  }, [selectedLabel, selectedVid])

  if (error) {
    return (
      <Alert color='red' title='לא ניתן לטעון את העץ כרגע'>
        <Group justify='space-between' align='center'>
          <Text size='sm'>{error}</Text>
          <Button size='xs' variant='light' onClick={loadRoot}>
            נסה שוב
          </Button>
        </Group>
      </Alert>
    )
  }

  if (!nodes) {
    return (
      <Paper p='md' shadow='none' withBorder={false}>
        <Group justify='center'>
          <Loader size='sm' />
        </Group>
      </Paper>
    )
  }

  return (
    <Paper p='md' shadow='none' withBorder={false}>
      <Stack gap='sm'>
        <Text size='sm' fw={600} ta='right'>
          {headerText}
        </Text>
        <Text size='xs' c='dimmed' ta='right'>
          הרחב צומת כדי לבקש את הצאצאים שלו מה-API המדומה. בחירה בעזרת לחיצה תסמן את הצומת לשמירה.
        </Text>
        <div>
          {nodes.map((node) => (
            <TreeNodeView
              key={node.value}
              node={node}
              expanded={expanded}
              loading={loading}
              onToggle={handleToggle}
              selectedId={selectedVid}
            />
          ))}
        </div>
      </Stack>
    </Paper>
  )
}

interface TreeNodeViewProps {
  node: MantineNode
  expanded: string[]
  loading: LoadingState
  selectedId: string | null
  onToggle: (node: MantineNode) => void
  depth?: number
}

function TreeNodeView({ node, expanded, loading, selectedId, onToggle, depth = 0 }: TreeNodeViewProps) {
  const isOpen = expanded.includes(node.value)
  const isSelected = selectedId === node.value

  return (
    <div style={{ marginBottom: 8 }}>
      <UnstyledButton
        onClick={() => onToggle(node)}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1.5px solid',
          borderColor: isSelected ? '#0B5FFF' : '#e0e0e0',
          borderRadius: 8,
          backgroundColor: isOpen ? '#f8f9fa' : '#ffffff',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          boxShadow: isSelected
            ? '0 4px 8px rgba(11, 95, 255, 0.12)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify='space-between'>
          <Group gap='sm'>
            <div
              style={{
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: '#4c6ef5',
                fontWeight: 'bold',
              }}
            >
              {isOpen ? '▾' : '▸'}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 500,
                color: '#212529',
              }}
            >
              {node.label}
            </div>
          </Group>
          {loading[node.value] && <Loader size='xs' />}
        </Group>
      </UnstyledButton>

      {isOpen && node.children && node.children.length > 0 && (
        <div
          style={{
            marginLeft: depth === 0 ? 16 : 24,
            marginTop: 8,
            paddingLeft: 16,
            borderLeft: '2px solid #e9ecef',
          }}
        >
          {node.children.map((child) => (
            <TreeNodeView
              key={child.value}
              node={child}
              expanded={expanded}
              loading={loading}
              onToggle={onToggle}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
