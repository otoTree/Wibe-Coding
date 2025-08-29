// 主组件
export { FragmentFlow } from '../fragment-flow'

// 子组件
export { FragmentNode } from './fragment-node'
export { FragmentStatsPanel } from './fragment-stats-panel'

// 工具函数和类型
export { generateNodesAndEdges, calculateStats } from './fragment-utils'
export type { FragmentNodeData } from './fragment-utils'

// 样式常量
export {
  priorityColors,
  priorityDotColors,
  statusColors,
  getMiniMapStrokeColor,
  getMiniMapNodeColor,
  getEdgeColor,
  getEdgeWidth
} from './fragment-styles'