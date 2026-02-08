/**
 * Tree module exports
 */

export { TreeNodeView, type TreeNodeViewProps } from './TreeNodeView'
export { VirtualTreeList, type VirtualTreeListProps } from './VirtualTreeList'
export { SelectionTags } from './SelectionTags'
export { useTreeData, type UseTreeDataResult } from './useTreeData'
export { useTreeNodes, type UseTreeNodesResult } from './useTreeNodes'
export { useTreeSearch, type UseTreeSearchResult } from './useTreeSearch'
export { 
  type TreeNode, 
  type TreeNodeMap,
  type FlattenResult,
  flattenApiNodes, 
  mergeChildren,
  // Legacy (deprecated)
  apiToTreeNode, 
  updateNodeChildren,
} from './treeTypes'
export { fetchTreeSearchResults } from './treeApi'
