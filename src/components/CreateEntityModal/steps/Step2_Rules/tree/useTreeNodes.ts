/**
 * useTreeNodes Hook
 * 
 * Manages tree node state with flat Record structure for O(1) lookups.
 * - Initial data loading (root + 3 levels)
 * - Node expansion/collapse
 * - Lazy loading of children (1 level at a time)
 */

import { useCallback, useEffect, useState } from 'react'
import { fetchTreeNodes } from '../../../../../api/client'
import { 
  type TreeNodeMap, 
  type FlattenResult,
  flattenApiNodes, 
  mergeChildren 
} from './treeTypes'

export interface UseTreeNodesResult {
  nodeMap: TreeNodeMap
  rootIds: string[]
  expanded: Set<string>
  loading: Record<string, boolean>
  fetchChildren: (vid: string) => Promise<void>
  toggleExpanded: (vid: string) => void
}

export function useTreeNodes(): UseTreeNodesResult {
  const [nodeMap, setNodeMap] = useState<TreeNodeMap>({})
  const [rootIds, setRootIds] = useState<string[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Initial data load: root + 3 levels deep
  useEffect(() => {
    ;(async () => {
      const json = await fetchTreeNodes('root', 3)
      const result: FlattenResult = flattenApiNodes(json, null)
      setNodeMap(result.nodeMap)
      setRootIds(result.rootIds)
    })()
  }, [])

  // Fetch children for a node (1 level)
  const fetchChildren = useCallback(async (vid: string) => {
    setLoading(s => ({ ...s, [vid]: true }))
    try {
      const json = await fetchTreeNodes(vid, 1)
      setNodeMap(prev => mergeChildren(prev, vid, json))
    } finally {
      setLoading(s => ({ ...s, [vid]: false }))
    }
  }, [])

  // Toggle expanded state
  const toggleExpanded = useCallback((vid: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(vid)) {
        next.delete(vid)
      } else {
        next.add(vid)
      }
      return next
    })
  }, [])

  return {
    nodeMap,
    rootIds,
    expanded,
    loading,
    fetchChildren,
    toggleExpanded,
  }
}
