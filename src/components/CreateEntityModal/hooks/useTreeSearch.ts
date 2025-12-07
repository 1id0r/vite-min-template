import { useEffect, useMemo, useState } from 'react'
import type { ApiTreeNode, MantineNode } from '../../../types/tree'
import { apiToMantine } from '../utils/treeTransformers'

interface UseTreeSearchConfig {
  searchEndpoint: string
  appToken: string
  debounceMs?: number
}

interface UseTreeSearchResult {
  searchTerm: string
  setSearchTerm: (term: string) => void
  isSearching: boolean
  searchResults: MantineNode[]
  searching: boolean
  searchError: string | null
}

/**
 * Custom hook for tree search with debouncing and request cancellation
 *
 * Implements a debounced search with automatic request cancellation when:
 * - User types new search term before previous request completes
 * - Component unmounts
 * - Search term is cleared
 *
 * Features:
 * - Configurable debounce delay (default from config)
 * - Automatic cleanup of in-flight requests
 * - Error handling with user-friendly messages
 * - Loading state tracking
 *
 * @param config - Search configuration (endpoint, token, debounce delay)
 * @returns Search state and control functions
 *
 * @example
 * const { searchTerm, setSearchTerm, isSearching, searchResults, searching, searchError } =
 *   useTreeSearch({
 *     searchEndpoint: TREE_SEARCH_ENDPOINT,
 *     appToken: TREE_SEARCH_APP_TOKEN,
 *     debounceMs: 350
 *   })
 */
export function useTreeSearch(config: UseTreeSearchConfig): UseTreeSearchResult {
  const { searchEndpoint, appToken, debounceMs = 350 } = config

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MantineNode[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedSearch = searchTerm.trim()
  const isSearching = trimmedSearch.length > 0

  /**
   * Fetch search results from the API
   *
   * @param term - Search term to query
   * @param signal - AbortSignal for cancelling the request
   * @returns Array of matching tree nodes in Mantine format
   */
  const fetchSearchResults = async (term: string, signal?: AbortSignal): Promise<MantineNode[]> => {
    const url = new URL(searchEndpoint)
    url.searchParams.set('name', term)

    const response = await fetch(url.toString(), {
      signal,
      headers: {
        accept: 'text/plain',
        AppToken: appToken,
      },
    })

    if (!response.ok) {
      throw new Error('Search failed')
    }

    const json = (await response.json()) as ApiTreeNode[]
    return json.map(apiToMantine)
  }

  /**
   * Effect: Debounced search with request cancellation
   *
   * This effect implements the core search logic with the following behavior:
   *
   * 1. **Empty Search**: If search term is empty, immediately clears results
   * 2. **Debouncing**: Waits for debounceMs (default 350ms) after user stops typing
   * 3. **AbortController**: Creates cancellation token for the fetch request
   * 4. **Search Execution**: Fetches results and updates state
   * 5. **Error Handling**: Catches and displays errors, ignoring aborted requests
   * 6. **Cleanup**: On unmount or search term change:
   *    - Clears the debounce timeout
   *    - Aborts any in-flight request
   *
   * This prevents race conditions where an old request returns after a new one,
   * and reduces unnecessary API calls while user is still typing.
   */
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
        // Ignore errors from aborted requests (user typed new search or unmounted)
        if (controller.signal.aborted) {
          return
        }
        setSearchResults([])
        setSearchError(error instanceof Error ? error.message : 'Search failed')
      } finally {
        setSearching(false)
      }
    }, debounceMs)

    // Cleanup: Clear timeout and abort request on search term change or unmount
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [isSearching, trimmedSearch, debounceMs])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      searchTerm,
      setSearchTerm,
      isSearching,
      searchResults,
      searching,
      searchError,
    }),
    [searchTerm, isSearching, searchResults, searching, searchError]
  )
}
