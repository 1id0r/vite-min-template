/**
 * Tree Types and Utilities
 * 
 * Type definitions and helper functions for the tree component.
 */

import type { ApiTreeNode } from '../../../../../types/tree'

/** Internal tree node representation */
export type TreeNode = {
  label: React.ReactNode
  value: string
  children?: TreeNode[]
}

/** Convert API tree node to internal format */
export function apiToTreeNode(node: ApiTreeNode): TreeNode {
  return {
    label: node.DisplayName,
    value: node.VID,
    children: node.children?.map(apiToTreeNode) ?? [],
  }
}

/** Recursively update children for a specific node */
export function updateNodeChildren(nodes: TreeNode[], value: string, children: TreeNode[]): TreeNode[] {
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
