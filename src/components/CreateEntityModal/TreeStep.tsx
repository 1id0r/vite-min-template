import { useEffect, useState } from 'react'
import { Loader, Text, UnstyledButton, Group } from '@mantine/core'
import type { ApiTreeNode, TreeSelection } from '../../types/tree'
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
  selection: TreeSelection | null
  onSelectionChange: (selection: TreeSelection) => void
}

export function TreeStep({ selection, onSelectionChange }: TreeStepProps) {
  const [data, setData] = useState<MantineNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})

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

  const TreeNodeView: React.FC<{ node: MantineNode; depth?: number }> = ({ node, depth = 0 }) => {
    const isOpen = expanded.includes(node.value)
    const isSelected = selection?.vid === node.value

    return (
      <div style={{ marginBottom: 8 }}>
        <UnstyledButton
          onClick={async () => {
            if (!isOpen) {
              if (!node.children || node.children.length === 0) {
                await fetchChildren(node.value)
              }
              setExpanded((s) => (s.includes(node.value) ? s : [...s, node.value]))
            } else {
              setExpanded((s) => s.filter((v) => v !== node.value))
            }
            onSelectionChange({ vid: node.value, displayName: String(node.label) })
          }}
          style={{
            width: 'auto',
            padding: '10px 14px',
            border: '1.5px solid',
            borderColor: isSelected ? '#4c6ef5' : '#e0e0e0',
            borderRadius: 8,
            backgroundColor: isOpen ? '#f8f9fa' : '#ffffff',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            boxShadow: isSelected ? '0 2px 6px rgba(76, 110, 245, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#4c6ef5'
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(76, 110, 245, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isSelected ? '#4c6ef5' : '#e0e0e0'
            e.currentTarget.style.boxShadow = isSelected
              ? '0 2px 6px rgba(76, 110, 245, 0.15)'
              : '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Group>
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
            {loading[node.value] && <Loader size='xs' />}
          </Group>
        </UnstyledButton>

        {isOpen && node.children && node.children.length > 0 && (
          <div
            style={{
              marginLeft: 24,
              marginTop: 8,
              paddingLeft: 16,
              borderLeft: '2px solid #e9ecef',
            }}
          >
            {node.children.map((c) => (
              <TreeNodeView key={c.value} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!data) {
    return <Loader />
  }

  return (
    <div>
      <Text size='sm' color='dimmed' mb='sm'>
        Expand nodes. If a node has empty children, the client will request 3 more layers from the mock API using the
        node's `vid`.
      </Text>

      <div>
        {data.map((n) => (
          <TreeNodeView key={n.value} node={n} />
        ))}
      </div>
    </div>
  )
}
