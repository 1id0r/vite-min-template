/**
 * useTreeData Hook
 * 
 * Custom hook that manages tree data state including:
 * - Initial data loading
 * - Node expansion/collapse
 * - Search with debounce
 * - Loading states
 */

import { useEffect, useState } from 'react'
import { fetchTreeNodes } from '../../../../../api/client'
import { fetchTreeSearchResults } from './treeApi'
import { type TreeNode, apiToTreeNode, updateNodeChildren } from './treeTypes'

export interface UseTreeDataResult {
  // Tree data
  data: TreeNode[] | null
  expanded: string[]
  loading: Record<string, boolean>
  
  // Search
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchResults: TreeNode[]
  searching: boolean
  searchError: string | null
  isSearching: boolean
  
  // Actions
  fetchChildren: (vid: string) => Promise<void>
  toggleExpanded: (vid: string) => void
}

export function useTreeData(): UseTreeDataResult {
  const [data, setData] = useState<TreeNode[] | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<TreeNode[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedSearch = searchTerm.trim()
  const isSearching = trimmedSearch.length > 0

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

  // Search with debounce
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
        const results = await fetchTreeSearchResults(trimmedSearch, controller.signal)
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

  return {
    data,
    expanded,
    loading,
    searchTerm,
    setSearchTerm,
    searchResults,
    searching,
    searchError,
    isSearching,
    fetchChildren,
    toggleExpanded,
  }
}
