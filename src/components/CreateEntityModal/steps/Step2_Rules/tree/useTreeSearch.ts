/**
 * useTreeSearch Hook
 * 
 * Manages search functionality including:
 * - Search term state
 * - Debounced API calls
 * - Search results and error handling
 */

import { useEffect, useState } from 'react'
import { fetchTreeSearchResults } from './treeApi'
import { type TreeNode } from './treeTypes'

export interface UseTreeSearchResult {
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchResults: TreeNode[]
  searching: boolean
  searchError: string | null
  isSearching: boolean
}

export function useTreeSearch(): UseTreeSearchResult {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<TreeNode[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedSearch = searchTerm.trim()
  const isSearching = trimmedSearch.length > 0

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
    searchTerm,
    setSearchTerm,
    searchResults,
    searching,
    searchError,
    isSearching,
  }
}
