/**
 * useTreeNodes Hook
 * 
 * Manages tree node state including:
 * - Initial data loading
 * - Node expansion/collapse
 * - Lazy loading of children
 */

import { useEffect, useState } from 'react'
import { fetchTreeNodes } from '../../../../../api/client'
import { type TreeNode, apiToTreeNode, updateNodeChildren } from './treeTypes'

export interface UseTreeNodesResult {
  data: TreeNode[] | null
  expanded: string[]
  loading: Record<string, boolean>
  fetchChildren: (vid: string) => Promise<void>
  toggleExpanded: (vid: string) => void
}

export function useTreeNodes(): UseTreeNodesResult {
  const [data, setData] = useState<TreeNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Initial data load
  useEffect(() => {
    ;(async () => {
      const json = await fetchTreeNodes('root', 3)
      setData(json.map(apiToTreeNode))
    })()
  }, [])

  // Fetch children for a node
  async function fetchChildren(vid: string) {
    setLoading((s) => ({ ...s, [vid]: true }))
    try {
      const json = await fetchTreeNodes(vid, 1)
      const mapped = json.map(apiToTreeNode)
      setData((prev) => (prev ? updateNodeChildren(prev, vid, mapped) : prev))
    } finally {
      setLoading((s) => ({ ...s, [vid]: false }))
    }
  }

  // Toggle expanded state
  function toggleExpanded(vid: string) {
    setExpanded((s) => 
      s.includes(vid) ? s.filter((v) => v !== vid) : [...s, vid]
    )
  }

  return {
    data,
    expanded,
    loading,
    fetchChildren,
    toggleExpanded,
  }
}
