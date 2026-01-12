import { useEffect, useMemo, useState } from 'react'
import { Input, Button, Tag, Space, Spin, Card, Typography } from 'antd'
import { SearchOutlined, PlusOutlined, MinusOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import type { ApiTreeNode, TreeSelectionList } from '../../types/tree'
import { fetchTreeNodes } from '../../api/client'

const { Text } = Typography

type TreeNode = {
  label: React.ReactNode
  value: string
  children?: TreeNode[]
}

function apiToMantine(node: ApiTreeNode): TreeNode {
  return {
    label: node.DisplayName,
    value: node.VID,
    children: node.children?.map(apiToMantine) ?? [],
  }
}

function updateNodeChildren(nodes: TreeNode[], value: string, children: TreeNode[]): TreeNode[] {
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
  const [data, setData] = useState<TreeNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const selectedIds = useMemo(() => new Set(selection.map((item) => item.vid)), [selection])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<TreeNode[]>([])
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

  const fetchSearchResults = async (term: string, signal?: AbortSignal): Promise<TreeNode[]> => {
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

  const addSelection = (node: TreeNode) => {
    if (selectedIds.has(node.value)) {
      return
    }
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

  const TreeNodeView: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
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
            backgroundColor: isSelected ? '#f0f4ff' : isOpen ? '#f9fafb' : '#ffffff',
            transition: 'all 0.15s ease',
            boxShadow: isSelected ? '0 2px 6px rgba(76, 110, 245, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <Button
            type='text'
            shape='circle'
            size='small'
            onClick={handleExpandToggle}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            icon={isOpen ? <DownOutlined /> : <RightOutlined />}
          />

          <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => toggleSelection(node)}>
            <Text strong style={{ wordBreak: 'break-word' }}>
              {node.label}
            </Text>
          </div>

          <Space size={6}>
            {loading[node.value] && <Spin size='small' />}
            <Button
              type={isSelected ? 'primary' : 'default'}
              shape='circle'
              size='small'
              aria-label={isSelected ? 'Remove from selection' : 'Add to selection'}
              onClick={() => toggleSelection(node)}
              icon={isSelected ? <MinusOutlined /> : <PlusOutlined />}
            />
          </Space>
        </div>

        {isOpen && node.children && node.children.length > 0 && (
          <div
            style={{
              marginRight: 24,
              marginTop: 8,
              paddingRight: 16,
              borderRight: '2px solid #e9ecef',
              direction: 'ltr',
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
    return <Spin />
  }

  return (
    <Space direction='vertical' size='middle' style={{ width: '100%', direction: 'rtl' }}>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='חיפוש'
        prefix={<SearchOutlined style={{ color: '#6B7280' }} />}
        style={{ textAlign: 'right' }}
      />

      <div>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
          בחירות
        </Text>
        <Card size='small'>
          {selection.length === 0 ? (
            <Text type='secondary' style={{ fontSize: 12 }}>
              הוסיפו פריטים באמצעות הסימן +
            </Text>
          ) : (
            <Space size={4} wrap>
              {selection.map((item) => (
                <Tag key={item.vid} color='blue' closable onClose={() => removeSelection(item.vid)}>
                  {item.displayName}
                </Tag>
              ))}
            </Space>
          )}
        </Card>
      </div>

      {isSearching ? (
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
          <div>
            {searchResults.map((n) => (
              <TreeNodeView key={n.value} node={n} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <Text type='secondary' style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            הרחיבו ענפים ובחרו באמצעות +
          </Text>
          <div>
            {data.map((n) => (
              <TreeNodeView key={n.value} node={n} />
            ))}
          </div>
        </div>
      )}
    </Space>
  )
}
