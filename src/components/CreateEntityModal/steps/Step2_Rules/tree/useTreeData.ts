/**
 * useTreeData Hook
 * 
 * Composition hook that combines tree node management and search functionality.
 * Maintains backward compatibility with the original API.
 * 
 * @see useTreeNodes - Tree data, expansion, and lazy loading
 * @see useTreeSearch - Debounced search functionality
 */

import { type TreeNode } from './treeTypes'
import { useTreeNodes, type UseTreeNodesResult } from './useTreeNodes'
import { useTreeSearch, type UseTreeSearchResult } from './useTreeSearch'

export interface UseTreeDataResult extends UseTreeNodesResult, UseTreeSearchResult {}

// Re-export individual hooks for granular usage
export { useTreeNodes, type UseTreeNodesResult } from './useTreeNodes'
export { useTreeSearch, type UseTreeSearchResult } from './useTreeSearch'

// Re-export TreeNode type for convenience
export type { TreeNode }

export function useTreeData(): UseTreeDataResult {
  const nodes = useTreeNodes()
  const search = useTreeSearch()

  return {
    ...nodes,
    ...search,
  }
}
