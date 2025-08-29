"use client"

import { Panel } from '@xyflow/react'

interface FragmentStatsPanelProps {
  totalFragments: number
  totalConnections: number
  totalTags: number
}

export function FragmentStatsPanel({ 
  totalFragments, 
  totalConnections, 
  totalTags 
}: FragmentStatsPanelProps) {
  return (
    <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-md">
      <div className="text-sm space-y-1">
        <div className="font-medium text-gray-900">知识图谱统计</div>
        <div className="text-gray-600">碎片数量: {totalFragments}</div>
        <div className="text-gray-600">连接数量: {totalConnections}</div>
        <div className="text-gray-600">标签数量: {totalTags}</div>
      </div>
    </Panel>
  )
}