export interface ApiTreeNode {
  DisplayName: string
  VID: string
  children: ApiTreeNode[]
}

export interface TreeSelection {
  vid: string
  displayName: string
}

export type TreeSelectionList = TreeSelection[]

/** State structure for the tree step (includes measurements and attachments) */
export interface TreeStepState {
  measurements: TreeSelectionList
  attachments: unknown[] // Will be typed as Attachment[] when imported
}
