"use client"

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Fragment } from '@/lib/types'
import { FragmentNode } from './fragment-flow/fragment-node'
import { FragmentStatsPanel } from './fragment-flow/fragment-stats-panel'
import { generateNodesAndEdges, calculateStats, FragmentNodeData } from './fragment-flow/fragment-utils'
import { getMiniMapStrokeColor, getMiniMapNodeColor } from './fragment-flow/fragment-styles'
import { AIChatManager, useAIChat } from './ai-chat/ai-chat-manager'
import { Button } from '@/components/ui/button'
import { MessageCircle, Bot } from 'lucide-react'

interface FragmentFlowProps {
  fragments: Fragment[]
  onEdit?: (fragment: Fragment) => void
  onDelete?: (fragment: Fragment) => void
  onView?: (fragment: Fragment) => void
}



// 节点类型定义
const nodeTypes = {
  fragmentNode: FragmentNode,
}

function FragmentFlowContent({ fragments, onEdit, onDelete, onView }: FragmentFlowProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const { openEmbeddedChat, isEmbeddedOpen } = useAIChat()
  
  const handleToggleExpand = useCallback((fragmentId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fragmentId)) {
        newSet.delete(fragmentId)
      } else {
        newSet.add(fragmentId)
      }
      return newSet
    })
  }, [])
  
  // 生成节点和边
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return generateNodesAndEdges(
      fragments,
      expandedNodes,
      onEdit,
      onDelete,
      onView,
      handleToggleExpand
    )
  }, [fragments, onEdit, onDelete, onView, expandedNodes, handleToggleExpand])
  
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )
  
  // 统计信息
  const stats = useMemo(() => {
    return calculateStats(fragments, edges)
  }, [fragments, edges])
  
  const handleOpenAIChat = () => {
    // 获取当前选中或所有的fragments作为上下文
    const contextFragments = fragments.slice(0, 3) // 限制上下文数量
    openEmbeddedChat(contextFragments, { x: 50, y: 50 })
  }

  return (
    <div className="w-full h-[600px] border rounded-lg bg-gray-50 relative">
      {/* AI聊天按钮 */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleOpenAIChat}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          disabled={isEmbeddedOpen}
        >
          <Bot className="h-4 w-4 mr-2" />
          AI 助手
        </Button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            const priority = (n.data as unknown as FragmentNodeData)?.fragment?.priority
            return getMiniMapStrokeColor(priority || 'low')
          }}
          nodeColor={(n) => {
            const priority = (n.data as unknown as FragmentNodeData)?.fragment?.priority
            return getMiniMapNodeColor(priority || 'low')
          }}
          maskColor="rgb(240, 240, 240, 0.6)"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        <FragmentStatsPanel 
          totalFragments={stats.totalFragments}
          totalConnections={stats.totalConnections}
          totalTags={stats.totalTags}
        />
        </ReactFlow>
    </div>
  )
}

export function FragmentFlow({ fragments, onEdit, onDelete, onView }: FragmentFlowProps) {
  return (
    <AIChatManager>
      <FragmentFlowContent 
        fragments={fragments}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    </AIChatManager>
  )
}