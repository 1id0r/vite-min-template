import type { ApiTreeNode, MantineNode } from '../../../types/tree'

/**
 * Transforms API tree node format to Mantine tree node format
 *
 * Converts the backend API format (DisplayName, VID, children) to the
 * format expected by the Mantine tree components (label, value, children).
 *
 * @param node - API tree node with DisplayName, VID, and children
 * @returns Mantine tree node with label, value, and children
 *
 * @example
 * const apiNode = { DisplayName: 'Root', VID: '123', children: [] }
 * const mantineNode = apiToMantine(apiNode)
 * // { label: 'Root', value: '123', children: [] }
 */
export function apiToMantine(node: ApiTreeNode): MantineNode {
  return {
    label: node.DisplayName,
    value: node.VID,
    children: node.children?.map(apiToMantine) ?? [],
  }
}

/**
 * Recursively updates children of a specific node in the tree
 *
 * Traverses the tree to find the node matching the given value and
 * replaces its children array. Used for lazy-loading node children
 * after user expands a node.
 *
 * @param nodes - Current tree nodes array
 * @param value - VID of the node to update
 * @param children - New children array to assign to the matched node
 * @returns New tree nodes array with updated children (immutable update)
 *
 * @example
 * const tree = [{ label: 'Root', value: '1', children: [] }]
 * const newChildren = [{ label: 'Child', value: '2', children: [] }]
 * const updated = updateNodeChildren(tree, '1', newChildren)
 * // Root node now has the new children
 */
export function updateNodeChildren(nodes: MantineNode[], value: string, children: MantineNode[]): MantineNode[] {
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
