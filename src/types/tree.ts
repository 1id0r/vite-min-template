export interface ApiTreeNode {
  DisplayName: string
  VID: string
  children: ApiTreeNode[]
}

/**
 * Mantine tree node format used for rendering tree components
 * Contains display label, unique value identifier, and optional children
 */
export type MantineNode = {
  label: React.ReactNode
  value: string
  children?: MantineNode[]
}

export interface TreeSelection {
  vid: string
  displayName: string
}

export type TreeSelectionList = TreeSelection[]
