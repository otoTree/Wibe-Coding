# 知识碎片持久化功能实现

本文档说明了如何为 iKnow 应用实现数据持久化功能，使用 IndexedDB 作为本地存储解决方案。

## 实现概述

### 核心文件

1. **`/lib/db.ts`** - IndexedDB 数据库操作类
2. **`/lib/stores/fragment-store.ts`** - 集成持久化的 Zustand 状态管理
3. **`/hooks/use-fragment-store-init.ts`** - Store 初始化 Hook
4. **`/components/store-initializer.tsx`** - Store 初始化组件
5. **`/app/layout.tsx`** - 应用根布局（集成初始化）

### 技术栈

- **IndexedDB**: 浏览器本地数据库，支持大容量数据存储
- **Zustand**: 轻量级状态管理库
- **TypeScript**: 类型安全的 JavaScript

## 功能特性

### 1. 自动持久化
- 所有的增删改操作都会自动同步到 IndexedDB
- 应用重启后数据自动恢复
- 支持离线使用

### 2. 类型安全
- 完整的 TypeScript 类型定义
- 编译时类型检查
- 智能代码提示

### 3. 错误处理
- 数据库操作异常处理
- 降级到内存存储
- 用户友好的错误提示

### 4. 性能优化
- 异步操作避免阻塞 UI
- 索引优化查询性能
- 批量操作支持

## 数据结构

### Fragment 接口
```typescript
export interface Fragment {
  id?: number                // 主键（IndexedDB 自动递增）
  title: string              // 标题
  content: string            // 正文内容
  tags: string[]             // 关联标签名称
  category?: string          // 所属分类名称（可选）
  priority: 'low' | 'medium' | 'high'   // 优先级
  status: 'draft' | 'active' | 'archived' // 状态
  createdAt: Date            // 创建时间
  updatedAt: Date            // 最近更新时间
  lastAccessedAt?: Date      // 最近访问时间（可选）
  metadata?: {
    wordCount: number        // 字数
    readingTime: number      // 预估阅读时长（分钟）
    source?: string          // 来源（可选，如网址）
    attachments?: string[]   // 附件 URL 列表（可选）
  }
}
```

## 使用方法

### 1. 基本操作

```typescript
import { useFragmentStore } from '@/lib/stores/fragment-store'

function MyComponent() {
  const { fragments, addFragment, updateFragment, deleteFragment } = useFragmentStore()

  // 添加碎片
  const handleAdd = async () => {
    await addFragment({
      title: '新碎片',
      content: '内容',
      tags: ['标签1'],
      priority: 'medium',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // 更新碎片
  const handleUpdate = async (fragment: Fragment) => {
    await updateFragment({
      ...fragment,
      title: '更新后的标题'
    })
  }

  // 删除碎片
  const handleDelete = async (id: number) => {
    await deleteFragment(id)
  }

  return (
    <div>
      {fragments.map(fragment => (
        <div key={fragment.id}>{fragment.title}</div>
      ))}
    </div>
  )
}
```

### 2. 查询操作

```typescript
const { 
  getFragmentById, 
  getFragmentsByCategory, 
  getFragmentsByTag, 
  searchFragments 
} = useFragmentStore()

// 按 ID 查询
const fragment = getFragmentById(1)

// 按分类查询
const techFragments = getFragmentsByCategory('技术笔记')

// 按标签查询
const reactFragments = getFragmentsByTag('React')

// 全文搜索
const searchResults = searchFragments('TypeScript')
```

## 数据库架构

### 对象存储
- **名称**: `fragments`
- **主键**: `id` (自动递增)

### 索引
- `title`: 标题索引
- `category`: 分类索引
- `tags`: 标签索引（多值）
- `createdAt`: 创建时间索引

## 初始化流程

1. 应用启动时，`StoreInitializer` 组件自动初始化
2. 调用 `fragmentDB.init()` 创建/打开数据库
3. 从 IndexedDB 加载现有数据
4. 如果数据库为空，使用示例数据初始化
5. 设置 `isInitialized` 状态为 `true`

## 错误处理策略

1. **数据库初始化失败**: 降级到内存存储，使用示例数据
2. **操作失败**: 抛出异常，由调用方处理
3. **数据格式错误**: 自动修复或使用默认值
4. **网络问题**: 本地存储不受影响

## 测试

应用包含了一个测试组件 `FragmentTest`，可以用来验证持久化功能：

- 添加测试碎片
- 删除碎片
- 查看当前数据状态
- 验证数据在页面刷新后是否保持

## 注意事项

1. **浏览器兼容性**: IndexedDB 在现代浏览器中广泛支持
2. **存储限制**: 受浏览器存储配额限制
3. **数据迁移**: 版本升级时需要考虑数据迁移
4. **隐私模式**: 在隐私/无痕模式下可能无法持久化

## 未来扩展

1. **云同步**: 集成云存储服务
2. **数据导出**: 支持导出为 JSON/CSV
3. **数据备份**: 自动备份机制
4. **版本控制**: 碎片版本历史
5. **全文索引**: 更强大的搜索功能