import { create } from 'zustand'
import { Fragment } from '@/lib/types'
import { fragmentDB } from '@/lib/db'

// 示例数据
const sampleFragments: Fragment[] = [
  {
    id: 1,
    title: "React Hooks 最佳实践",
    content: "React Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。\n\n主要的 Hooks 包括：\n- useState: 管理组件状态\n- useEffect: 处理副作用\n- useContext: 使用 Context\n- useReducer: 复杂状态管理\n\n使用 Hooks 的好处：\n1. 更简洁的代码\n2. 更好的逻辑复用\n3. 更容易测试",
    tags: ["React", "前端开发", "JavaScript", "Hooks"],
    category: "技术笔记",
    priority: "high",
    status: "active",
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-20T14:20:00'),
    lastAccessedAt: new Date('2024-01-22T09:15:00'),
    metadata: {
      wordCount: 180,
      readingTime: 2,
      source: "https://reactjs.org/docs/hooks-intro.html"
    }
  },
  {
    id: 2,
    title: "TypeScript 类型系统",
    content: "TypeScript 是 JavaScript 的超集，为 JavaScript 添加了静态类型定义。\n\n核心概念：\n- 基础类型：string, number, boolean, array, object\n- 接口 (Interface)：定义对象的结构\n- 泛型 (Generics)：创建可重用的组件\n- 联合类型：多种类型的组合\n- 类型守卫：运行时类型检查",
    tags: ["TypeScript", "类型系统", "前端开发"],
    category: "技术笔记",
    priority: "medium",
    status: "active",
    createdAt: new Date('2024-01-10T16:45:00'),
    updatedAt: new Date('2024-01-18T11:30:00'),
    metadata: {
      wordCount: 120,
      readingTime: 1
    }
  },
  {
    id: 3,
    title: "项目管理心得",
    content: "在软件开发项目中，良好的项目管理是成功的关键。\n\n重要原则：\n1. 明确的需求定义\n2. 合理的时间规划\n3. 有效的沟通机制\n4. 风险识别和应对\n5. 持续的进度跟踪\n\n常用工具：\n- Jira: 任务管理\n- Confluence: 文档协作\n- Slack: 团队沟通\n- Git: 版本控制",
    tags: ["项目管理", "团队协作", "软件开发"],
    category: "工作经验",
    priority: "low",
    status: "draft",
    createdAt: new Date('2024-01-05T09:20:00'),
    updatedAt: new Date('2024-01-12T15:45:00'),
    metadata: {
      wordCount: 150,
      readingTime: 2
    }
  },
  {
    id: 4,
    title: "CSS Grid 布局指南",
    content: "CSS Grid 是一个二维布局系统，非常适合创建复杂的网页布局。\n\n基本概念：\n- Grid Container: 网格容器\n- Grid Item: 网格项目\n- Grid Line: 网格线\n- Grid Track: 网格轨道\n- Grid Cell: 网格单元格\n- Grid Area: 网格区域\n\n常用属性：\n- display: grid\n- grid-template-columns\n- grid-template-rows\n- grid-gap\n- grid-area",
    tags: ["CSS", "布局", "前端开发", "Grid"],
    category: "技术笔记",
    priority: "medium",
    status: "archived",
    createdAt: new Date('2023-12-20T14:10:00'),
    updatedAt: new Date('2024-01-08T10:25:00'),
    metadata: {
      wordCount: 140,
      readingTime: 1,
      source: "https://css-tricks.com/snippets/css/complete-guide-grid/"
    }
  }
]

interface FragmentStore {
  fragments: Fragment[]
  selectedFragment: Fragment | null
  isInitialized: boolean
  
  // Actions
  initializeStore: () => Promise<void>
  setFragments: (fragments: Fragment[]) => void
  addFragment: (fragment: Fragment) => Promise<void>
  updateFragment: (fragment: Fragment) => Promise<void>
  deleteFragment: (id: number) => Promise<void>
  setSelectedFragment: (fragment: Fragment | null) => void
  
  // Getters
  getFragmentById: (id: number) => Fragment | undefined
  getFragmentsByCategory: (category: string) => Fragment[]
  getFragmentsByTag: (tag: string) => Fragment[]
  searchFragments: (query: string) => Fragment[]
}

export const useFragmentStore = create<FragmentStore>((set, get) => ({
  fragments: [],
  selectedFragment: null,
  isInitialized: false,
  
  initializeStore: async () => {
    try {
      await fragmentDB.init()
      const fragments = await fragmentDB.getAllFragments()
      
      // 如果数据库为空，使用示例数据初始化
      if (fragments.length === 0) {
        await fragmentDB.setFragments(sampleFragments)
        set({ fragments: sampleFragments, isInitialized: true })
      } else {
        set({ fragments, isInitialized: true })
      }
    } catch (error) {
      console.error('Failed to initialize store:', error)
      // 如果数据库初始化失败，使用示例数据
      set({ fragments: sampleFragments, isInitialized: true })
    }
  },
  
  setFragments: (fragments) => set({ fragments }),
  
  addFragment: async (fragment) => {
    try {
      const fragmentToAdd = {
        ...fragment,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const newFragment = await fragmentDB.addFragment(fragmentToAdd)
      set((state) => ({ fragments: [...state.fragments, newFragment] }))
    } catch (error) {
      console.error('Failed to add fragment:', error)
      throw error
    }
  },
  
  updateFragment: async (updatedFragment) => {
    try {
      const fragmentToUpdate = {
        ...updatedFragment,
        updatedAt: new Date()
      }
      
      await fragmentDB.updateFragment(fragmentToUpdate)
      set((state) => ({
        fragments: state.fragments.map(f => 
          f.id === fragmentToUpdate.id ? fragmentToUpdate : f
        )
      }))
    } catch (error) {
      console.error('Failed to update fragment:', error)
      throw error
    }
  },
  
  deleteFragment: async (id) => {
    try {
      await fragmentDB.deleteFragment(id)
      set((state) => ({
        fragments: state.fragments.filter(f => f.id !== id),
        selectedFragment: state.selectedFragment?.id === id ? null : state.selectedFragment
      }))
    } catch (error) {
      console.error('Failed to delete fragment:', error)
      throw error
    }
  },
  
  setSelectedFragment: (fragment) => set({ selectedFragment: fragment }),
  
  getFragmentById: (id) => {
    return get().fragments.find(f => f.id === id)
  },
  
  getFragmentsByCategory: (category) => {
    return get().fragments.filter(f => f.category === category)
  },
  
  getFragmentsByTag: (tag) => {
    return get().fragments.filter(f => f.tags.includes(tag))
  },
  
  searchFragments: (query) => {
    const fragments = get().fragments
    const lowercaseQuery = query.toLowerCase()
    
    return fragments.filter(f => 
      f.title.toLowerCase().includes(lowercaseQuery) ||
      f.content.toLowerCase().includes(lowercaseQuery) ||
      f.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      (f.category && f.category.toLowerCase().includes(lowercaseQuery))
    )
  }
}))