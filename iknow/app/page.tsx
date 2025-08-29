import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">欢迎来到 iKnow</h1>
        <p className="text-xl text-muted-foreground mt-2">
          您的个人知识管理系统
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>碎片管理</CardTitle>
            <CardDescription>
              收集、整理和管理您的知识碎片
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              快速记录想法，使用标签分类，轻松搜索内容。让零散的知识变得有序。
            </p>
            <Button asChild>
              <Link href="/fragments">开始管理碎片</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>第二大脑</CardTitle>
            <CardDescription>
              构建您的个人知识网络
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              通过知识图谱和思维导图，建立概念之间的联系，形成完整的知识体系。
            </p>
            <Button asChild variant="outline">
              <Link href="/brain">探索大脑</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>快速开始</CardTitle>
          <CardDescription>
            几个简单步骤，开启您的知识管理之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>在碎片管理中记录您的第一个想法</li>
            <li>使用标签为内容分类</li>
            <li>在第二大脑中建立知识连接</li>
            <li>定期回顾和整理您的知识库</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
