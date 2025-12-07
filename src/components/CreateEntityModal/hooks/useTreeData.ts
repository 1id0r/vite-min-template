import { useEffect, useMemo, useState } from 'react'
import type { MantineNode } from '../../../types/tree'
import { fetchTreeNodes } from '../../../api/client'
import { apiToMantine, updateNodeChildren } from '../utils/treeTransformers'

interface UseTreeDataResult {
  data: MantineNode[] | null
  expanded: string[]
  loading: Record<string, boolean>
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>
  fetchChildren: (vid: string) => Promise<void>
}

/**
 * Custom hook for managing tree data state
 *
 * Handles:
 * - Initial tree data fetch (root nodes with depth 3)
 * - Expansion state tracking
 * - Per-node loading states during lazy loading
 * - Fetching and updating children when nodes expand
 *
 * @returns Tree data state and control functions
 *
 * @example
 * const { data, expanded, loading, setExpanded, fetchChildren } = useTreeData()
 */
export function useTreeData(): UseTreeDataResult {
  const [data, setData] = useState<MantineNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  /**
   * Effect: Fetch initial root tree nodes on component mount
   *
   * Fetches the root level of the tree with depth 3 (loads root + 2 levels of children)
   * This provides an initial view of the tree structure without requiring
   * users to expand multiple levels manually.
   */
  useEffect(() => {
    ;(async () => {
      const json = await fetchTreeNodes('root', 3)
      setData(json.map(apiToMantine))
    })()
  }, [])

  /**
   * Fetch children for a specific node (lazy loading)
   *
   * Called when a user expands a node that hasn't loaded its children yet.
   * Updates the loading state during fetch and merges children into tree.
   *
   * @param vid - The VID (unique identifier) of the node to fetch children for
   */
  const fetchChildren = async (vid: string): Promise<void> => {
    setLoading((s) => ({ ...s, [vid]: true }))
    try {
      const json = await fetchTreeNodes(vid, 1)
      const mapped = json.map(apiToMantine)
      setData((prev) => (prev ? updateNodeChildren(prev, vid, mapped) : prev))
    } finally {
      setLoading((s) => ({ ...s, [vid]: false }))
    }
  }

  // Memoize the return object to prevent unnecessary re-renders in consuming components
  return useMemo(
    () => ({
      data,
      expanded,
      loading,
      setExpanded,
      fetchChildren,
    }),
    [data, expanded, loading]
  )
}
