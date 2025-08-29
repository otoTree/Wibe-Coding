import { Node, Edge } from '@xyflow/react'
import { Fragment } from '@/lib/types'
import { getEdgeColor, getEdgeWidth } from './fragment-styles'

export interface FragmentNodeData {
  fragment: Fragment
  onEdit?: (fragment: Fragment) => void
  onDelete?: (fragment: Fragment) => void
  onView?: (fragment: Fragment) => void
  isExpanded?: boolean
  onToggleExpand?: (fragmentId: string) => void
}

/**
 * 生成节点和边的数据
 */
export function generateNodesAndEdges(
  fragments: Fragment[],
  expandedNodes: Set<string>,
  onEdit?: (fragment: Fragment) => void,
  onDelete?: (fragment: Fragment) => void,
  onView?: (fragment: Fragment) => void,
  onToggleExpand?: (fragmentId: string) => void
): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const tagToFragments: { [tag: string]: Fragment[] } = {}
  
  // 按标签分组碎片
  fragments.forEach(fragment => {
    fragment.tags.forEach(tag => {
      if (!tagToFragments[tag]) {
        tagToFragments[tag] = []
      }
      tagToFragments[tag].push(fragment)
    })
  })
  
  // 创建节点
  fragments.forEach((fragment, index) => {
    const x = (index % 5) * 300 + Math.random() * 100
    const y = Math.floor(index / 5) * 200 + Math.random() * 100
    
    // 确保每个节点都有唯一的ID，优先使用fragment.id，否则使用index
    const fragmentId = fragment.id !== undefined ? fragment.id.toString() : `temp-${index}`
    nodes.push({
      id: fragmentId,
      type: 'fragmentNode',
      position: { x, y },
      data: {
        fragment,
        onEdit,
        onDelete,
        onView,
        isExpanded: expandedNodes.has(fragmentId),
        onToggleExpand
      },
    })
  })
  
  // 创建边（基于共同标签）
  const processedPairs = new Set<string>()
  
  Object.entries(tagToFragments).forEach(([tag, fragmentsWithSameTag]) => {
    console.log('edge data',fragmentsWithSameTag)
    if (fragmentsWithSameTag.length > 1) {
      // 为有相同标签的碎片创建连接
      for (let i = 0; i < fragmentsWithSameTag.length; i++) {
        for (let j = i + 1; j < fragmentsWithSameTag.length; j++) {
          const fragment1 = fragmentsWithSameTag[i]
          const fragment2 = fragmentsWithSameTag[j]
          
          // 获取对应的节点ID，需要与创建节点时的逻辑保持一致
          const fragment1Index = fragments.indexOf(fragment1)
          const fragment2Index = fragments.indexOf(fragment2)
          const id1 = fragment1.id !== undefined ? fragment1.id.toString() : `temp-${fragment1Index}`
          const id2 = fragment2.id !== undefined ? fragment2.id.toString() : `temp-${fragment2Index}`
          
          // 避免重复连接和空ID
          if (id1 && id2) {
            const pairKey = [id1, id2].sort().join('-')
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey)
              
              // 计算共同标签数量作为连接强度
              const commonTags = fragment1.tags.filter(tag => fragment2.tags.includes(tag))
              
              edges.push({
                id: `${id1}-${id2}`,
                source: id1,
                target: id2,
                type: 'bezier',
                animated: true,
                style: {
                  strokeWidth: getEdgeWidth(commonTags.length),
                  stroke: getEdgeColor(commonTags.length)
                },
                label: `${commonTags.length} 个共同标签`,
                labelStyle: {
                  fontSize: 12,
                  fontWeight: 600,
                  fill: '#374151'
                },
                labelBgStyle: {
                  fill: '#ffffff',
                  fillOpacity: 0.8
                }
              })
            }
          }
        }
      }
    }
  })
  
  return { nodes, edges }
}

/**
 * 计算统计信息
 */
export function calculateStats(fragments: Fragment[], edges: Edge[]) {
  const totalFragments = fragments.length
  const totalConnections = edges.length
  const allTags = new Set(fragments.flatMap(f => f.tags))
  const totalTags = allTags.size
  
  return {
    totalFragments,
    totalConnections,
    totalTags
  }
}