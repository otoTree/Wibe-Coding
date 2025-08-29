"use client"

import { useState, useMemo } from "react"
import { Fragment, FragmentFilter, FragmentSort } from "@/lib/types"
import { FragmentCard } from "./fragment-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, SortAsc, SortDesc, X } from "lucide-react"

interface FragmentListProps {
  fragments: Fragment[]
  onEdit?: (fragment: Fragment) => void
  onDelete?: (fragment: Fragment) => void
  onView?: (fragment: Fragment) => void
}

export function FragmentList({ fragments, onEdit, onDelete, onView }: FragmentListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<Fragment['priority'] | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<Fragment['status'] | "all">("all")
  const [sortField, setSortField] = useState<FragmentSort['field']>("updatedAt")
  const [sortOrder, setSortOrder] = useState<FragmentSort['order']>("desc")

  // 获取所有可用的标签和分类
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    fragments.forEach(fragment => {
      fragment.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [fragments])

  const allCategories = useMemo(() => {
    const categorySet = new Set<string>()
    fragments.forEach(fragment => {
      if (fragment.category) categorySet.add(fragment.category)
    })
    return Array.from(categorySet).sort()
  }, [fragments])

  // 过滤和排序碎片
  const filteredAndSortedFragments = useMemo(() => {
    const filtered = fragments.filter(fragment => {
      // 搜索查询过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = fragment.title.toLowerCase().includes(query)
        const matchesContent = fragment.content.toLowerCase().includes(query)
        const matchesTags = fragment.tags.some(tag => tag.toLowerCase().includes(query))
        if (!matchesTitle && !matchesContent && !matchesTags) {
          return false
        }
      }

      // 标签过滤
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => fragment.tags.includes(tag))
        if (!hasSelectedTag) return false
      }

      // 分类过滤
      if (selectedCategory && selectedCategory !== 'all' && fragment.category !== selectedCategory) {
        return false
      }

      // 优先级过滤
      if (selectedPriority && selectedPriority !== 'all' && fragment.priority !== selectedPriority) {
        return false
      }

      // 状态过滤
      if (selectedStatus && selectedStatus !== 'all' && fragment.status !== selectedStatus) {
        return false
      }

      return true
    })

    // 排序
    filtered.sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'createdAt':
        case 'updatedAt':
        case 'lastAccessedAt':
          aValue = new Date(a[sortField] || 0).getTime()
          bValue = new Date(b[sortField] || 0).getTime()
          break
        default:
          aValue = a[sortField]
          bValue = b[sortField]
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [fragments, searchQuery, selectedTags, selectedCategory, selectedPriority, selectedStatus, sortField, sortOrder])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setSelectedCategory("all")
    setSelectedPriority("all")
    setSelectedStatus("all")
  }

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || (selectedCategory && selectedCategory !== 'all') || (selectedPriority && selectedPriority !== 'all') || (selectedStatus && selectedStatus !== 'all')

  return (
    <div className="space-y-4">
      {/* 搜索和过滤栏 */}
      <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索碎片标题、内容或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 过滤器 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 分类过滤 */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分类</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 优先级过滤 */}
          <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as Fragment['priority'] | "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有优先级</SelectItem>
              <SelectItem value="high">高优先级</SelectItem>
              <SelectItem value="medium">中优先级</SelectItem>
              <SelectItem value="low">低优先级</SelectItem>
            </SelectContent>
          </Select>

          {/* 状态过滤 */}
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Fragment['status'] | "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="active">活跃</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
            </SelectContent>
          </Select>

          {/* 排序 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setSortField('updatedAt'); setSortOrder('desc') }}>
                最近更新
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('createdAt'); setSortOrder('desc') }}>
                最近创建
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('title'); setSortOrder('asc') }}>
                标题 A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('priority'); setSortOrder('desc') }}>
                优先级高到低
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? '降序' : '升序'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 清除过滤器 */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              清除过滤
            </Button>
          )}
        </div>

        {/* 标签过滤 */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">标签过滤:</div>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          显示 {filteredAndSortedFragments.length} 个碎片
          {fragments.length !== filteredAndSortedFragments.length && (
            <span> (共 {fragments.length} 个)</span>
          )}
        </span>
      </div>

      {/* 碎片列表 */}
      {filteredAndSortedFragments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {hasActiveFilters ? "没有找到匹配的碎片" : "还没有任何碎片"}
          </div>
          {hasActiveFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              清除所有过滤条件
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedFragments.map(fragment => (
            <FragmentCard
              key={fragment.id}
              fragment={fragment}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}