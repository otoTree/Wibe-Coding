// AI对话组件相关类型定义

import { Fragment } from './types'

// 消息类型
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  fragments?: Fragment[]  // 关联的碎片
}

// 对话上下文中的碎片
export interface ChatContextFragment {
  fragment: Fragment
  addedAt: Date
  position: { x: number; y: number }  // 在对话界面中的位置
}

// 对话会话
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  contextFragments: ChatContextFragment[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

// 拖拽状态
export interface DragState {
  isDragging: boolean
  draggedFragment?: Fragment
  dragPosition?: { x: number; y: number }
}

// AI对话配置
export interface AIChatConfig {
  apiEndpoint: string
  model: string
  maxTokens: number
  temperature: number
}

// 对话组件属性
export interface AIChatComponentProps {
  isOpen: boolean
  onClose: () => void
  initialFragments?: Fragment[]
  onFragmentAdd?: (fragment: Fragment) => void
  onFragmentRemove?: (fragmentId: string) => void
}

// 悬浮Chat按钮属性
export interface FloatingChatButtonProps {
  fragment: Fragment
  onChatStart: (fragment: Fragment) => void
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

// 拖拽区域属性
export interface DropZoneProps {
  onFragmentDrop: (fragment: Fragment, position: { x: number; y: number }) => void
  isActive: boolean
  children: React.ReactNode
}