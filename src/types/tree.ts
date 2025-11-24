export interface ApiTreeNode {
  DisplayName: string
  VID: string
  children: ApiTreeNode[]
}

export interface TreeSelection {
  displayName: string
  vid: string
}
