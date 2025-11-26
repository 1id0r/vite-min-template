export interface ApiTreeNode {
  DisplayName: string
  VID: string
  children: ApiTreeNode[]
}

export interface TreeSelection {
  vid: string
  displayName: string
}
