"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FragmentFlow } from "@/components/fragment-flow"
import { useFragmentStore } from "@/lib/stores/fragment-store"
import { Fragment } from "@/lib/types"

export default function BrainPage() {
  const { fragments, setSelectedFragment, updateFragment, deleteFragment } = useFragmentStore()
  
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
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">第二大脑</h1>
        <p className="text-muted-foreground">
          构建您的个人知识网络和思维导图
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              知识图谱
              <Badge variant="secondary">实时</Badge>
            </CardTitle>
            <CardDescription>
              可视化您的知识连接，基于标签自动建立关联
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {fragments.length > 0 ? (
              <FragmentFlow
                fragments={fragments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <p>暂无知识碎片，请先添加一些内容</p>
              </div>
            )}
          </CardContent>
        </Card>
        

      </div>
    </div>
  )
}