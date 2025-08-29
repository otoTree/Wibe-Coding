"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FragmentInput } from "@/components/fragment-input"
import { FragmentList } from "@/components/fragment-list"
import { FragmentFlow } from "@/components/fragment-flow"
import { FragmentDetail } from "@/components/fragment-detail"
import { Fragment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, List, Network } from "lucide-react"
import { useFragmentStore } from "@/lib/stores/fragment-store"

export default function FragmentsPage() {
  const { 
    fragments, 
    selectedFragment, 
    setSelectedFragment, 
    updateFragment, 
    deleteFragment 
  } = useFragmentStore()
  const [showInput, setShowInput] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('list')

  const handleEdit = (fragment: Fragment) => {
    setSelectedFragment(fragment)
  }

  const handleDelete = (fragment: Fragment) => {
    if (confirm(`确定要删除碎片 "${fragment.title}" 吗？`)) {
      deleteFragment(fragment.id!)
    }
  }

  const handleView = (fragment: Fragment) => {
    setSelectedFragment(fragment)
  }

  const handleSave = (updatedFragment: Fragment) => {
    updateFragment(updatedFragment)
    setSelectedFragment(null)
  }

  const handleCloseDetail = () => {
    setSelectedFragment(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">碎片管理</h1>
          <p className="text-muted-foreground">
            管理和组织您的知识碎片
          </p>
        </div>
        <Button onClick={() => setShowInput(!showInput)}>
          <Plus className="h-4 w-4 mr-2" />
          {showInput ? "隐藏输入" : "添加碎片"}
        </Button>
      </div>
      
      {showInput && (
        <Card>
          <CardHeader>
            <CardTitle>添加新碎片</CardTitle>
            <CardDescription>
              快速记录您的想法和知识
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FragmentInput />
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">我的碎片</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-1" />
                列表视图
              </Button>
              <Button
                variant={viewMode === 'flow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('flow')}
              >
                <Network className="h-4 w-4 mr-1" />
                图谱视图
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              共 {fragments.length} 个碎片
            </div>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <FragmentList
            fragments={fragments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <FragmentFlow
                fragments={fragments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* 碎片详情弹窗 */}
      {selectedFragment && (
        <FragmentDetail
          fragment={selectedFragment}
          isOpen={!!selectedFragment}
          onClose={handleCloseDetail}
          onSave={handleSave}
        />
      )}
    </div>
  )
}