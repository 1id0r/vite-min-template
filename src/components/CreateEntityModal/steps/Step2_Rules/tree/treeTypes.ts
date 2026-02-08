/**
 * Tree Types and Utilities
 * 
 * Flat Record-based structure for O(1) lookups with 600k+ nodes.
 */

import type { ApiTreeNode } from '../../../../../types/tree'

/** Internal tree node representation (flat structure) */
export type TreeNode = {
  label: React.ReactNode
  value: string
  parentId: string | null
  childIds: string[]
}

/** Flat map of all nodes by ID for O(1) access */
export type TreeNodeMap = Record<string, TreeNode>

/** Result of flattening API response */
export interface FlattenResult {
  nodeMap: TreeNodeMap
  rootIds: string[]
}

/** 
 * Convert nested API tree nodes to flat TreeNodeMap.
 * Preserves the nested-to-flat transformation for initial root-3 fetch
 * and subsequent 1-level child fetches.
 */
export function flattenApiNodes(
  nodes: ApiTreeNode[],
  parentId: string | null = null
): FlattenResult {
  const nodeMap: TreeNodeMap = {}
  const rootIds: string[] = []

  function processNode(node: ApiTreeNode, parent: string | null) {
    const childIds = node.children?.map(c => c.VID) ?? []
    
    nodeMap[node.VID] = {
      label: node.DisplayName,
      value: node.VID,
      parentId: parent,
      childIds,
    }

    if (parent === null) {
      rootIds.push(node.VID)
    }

    // Recursively process children (for depth > 1 fetches)
    node.children?.forEach(child => processNode(child, node.VID))
  }

  nodes.forEach(node => processNode(node, parentId))

  return { nodeMap, rootIds }
}

/** 
 * Merge new children into existing nodeMap.
 * O(1) update - just spreads new nodes and updates parent's childIds.
 */
export function mergeChildren(
  nodeMap: TreeNodeMap,
  parentId: string,
  childNodes: ApiTreeNode[]
): TreeNodeMap {
  const { nodeMap: newNodes } = flattenApiNodes(childNodes, parentId)
  const childIds = childNodes.map(c => c.VID)

  return {
    ...nodeMap,
    ...newNodes,
    [parentId]: {
      ...nodeMap[parentId],
      childIds,
    },
  }
}

// Legacy exports for backward compatibility during migration
/** @deprecated Use flattenApiNodes instead */
export function apiToTreeNode(node: ApiTreeNode): TreeNode {
  return {
    label: node.DisplayName,
    value: node.VID,
    parentId: null,
    childIds: node.children?.map(c => c.VID) ?? [],
  }
}

/** @deprecated No longer needed with flat structure */
export function updateNodeChildren(nodes: TreeNode[], value: string, children: TreeNode[]): TreeNode[] {
  return nodes.map((n) => {
    if (n.value === value) {
      return { ...n, childIds: children.map(c => c.value) }
    }
    return n
  })
}
