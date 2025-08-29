import { Fragment } from '@/lib/types'

// 优先级颜色配置
export const priorityColors: Record<Fragment['priority'], string> = {
  low: 'border-green-400 bg-green-50',
  medium: 'border-yellow-400 bg-yellow-50',
  high: 'border-red-400 bg-red-50'
}

// 优先级圆点颜色配置
export const priorityDotColors: Record<Fragment['priority'], string> = {
  low: 'bg-green-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-400'
}

// 状态颜色配置
export const statusColors: Record<Fragment['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-blue-100 text-blue-600',
  archived: 'bg-purple-100 text-purple-600'
}

// MiniMap 节点描边颜色
export const getMiniMapStrokeColor = (priority: Fragment['priority']): string => {
  switch (priority) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#10b981'
    default: return '#6b7280'
  }
}

// MiniMap 节点填充颜色
export const getMiniMapNodeColor = (priority: Fragment['priority']): string => {
  switch (priority) {
    case 'high': return '#fecaca'
    case 'medium': return '#fef3c7'
    case 'low': return '#d1fae5'
    default: return '#f3f4f6'
  }
}

// 连接线颜色配置
export const getEdgeColor = (commonTagsCount: number): string => {
  if (commonTagsCount > 2) return '#ef4444'
  if (commonTagsCount > 1) return '#f59e0b'
  return '#6b7280'
}

// 连接线宽度配置
export const getEdgeWidth = (commonTagsCount: number): number => {
  return Math.min(commonTagsCount * 2, 6)
}