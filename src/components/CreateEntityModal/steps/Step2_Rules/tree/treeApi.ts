/**
 * Tree API
 * 
 * API calls for tree search functionality.
 */

import type { ApiTreeNode } from '../../../../../types/tree'
import { type TreeNode, apiToTreeNode } from './treeTypes'

const SEARCH_ENDPOINT = 'https://replace-with-real-api/tree-search'
const APP_TOKEN = '123lidor'

/** Fetch tree search results */
export async function fetchTreeSearchResults(term: string, signal?: AbortSignal): Promise<TreeNode[]> {
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
  return json.map(apiToTreeNode)
}
