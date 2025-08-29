"use client"

import React, { useState, useCallback } from 'react'
import { AIChatDialog } from './ai-chat-dialog'
import { EmbeddedChatPanel } from './embedded-chat-panel'
import { Fragment } from '../../lib/types'
import { ChatSession, ChatMessage } from '../../lib/ai-chat-types'
import { aiChatService } from '../../lib/ai-chat-service'

interface AIChatManagerProps {
  children: React.ReactNode
}

type ChatMode = 'dialog' | 'embedded'

interface AIChatManagerContextType {
  openChat: (fragments?: Fragment[], mode?: ChatMode) => void
  closeChat: () => void
  isOpen: boolean
  currentSession?: ChatSession
  sendMessage: (content: string) => Promise<void>
  addFragmentToContext: (fragment: Fragment) => void
  // 嵌入式聊天相关
  openEmbeddedChat: (fragments?: Fragment[], position?: { x: number; y: number }) => void
  closeEmbeddedChat: () => void
  minimizeEmbeddedChat: () => void
  isEmbeddedOpen: boolean
  isEmbeddedMinimized: boolean
  embeddedPosition: { x: number; y: number }
  embeddedSize: { width: number; height: number }
}

const AIChatManagerContext = React.createContext<AIChatManagerContextType | null>(null)

export function AIChatManager({ children }: AIChatManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialFragments, setInitialFragments] = useState<Fragment[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | undefined>()
  
  // 嵌入模式状态
  const [isEmbeddedOpen, setIsEmbeddedOpen] = useState(false)
  const [isEmbeddedMinimized, setIsEmbeddedMinimized] = useState(false)
  const [embeddedPosition, setEmbeddedPosition] = useState({ x: 20, y: 20 })
  const [embeddedSize, setEmbeddedSize] = useState({ width: 400, height: 500 })
  const [embeddedFragments, setEmbeddedFragments] = useState<Fragment[]>([])

  // 处理嵌入式聊天面板位置变化
  const handleEmbeddedPositionChange = useCallback((position: { x: number; y: number }) => {
    setEmbeddedPosition(position)
  }, [])

  // 处理嵌入式聊天面板大小变化
  const handleEmbeddedSizeChange = useCallback((size: { width: number; height: number }) => {
    setEmbeddedSize(size)
  }, [])
  const [currentMode, setCurrentMode] = useState<ChatMode>('dialog')

  const openChat = useCallback((fragments: Fragment[] = [], mode: ChatMode = 'dialog') => {
    setInitialFragments(fragments)
    setCurrentMode(mode)
    
    if (mode === 'dialog') {
      setIsOpen(true)
    } else {
      setEmbeddedFragments(fragments)
      setIsEmbeddedOpen(true)
      setIsEmbeddedMinimized(false)
    }
    
    // 创建新的会话
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: fragments.length > 0 ? `关于 ${fragments[0].title} 的对话` : '新对话',
      messages: [],
      contextFragments: fragments.map((fragment, index) => ({
        fragment,
        addedAt: new Date(),
        position: { x: index * 20, y: index * 20 }
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
    
    setCurrentSession(newSession)
  }, [])

  const closeChat = useCallback(() => {
    if (currentMode === 'dialog') {
      setIsOpen(false)
      setInitialFragments([])
    } else {
      setIsEmbeddedOpen(false)
      setEmbeddedFragments([])
    }
    setCurrentSession(undefined)
  }, [currentMode])

  const openEmbeddedChat = useCallback((fragments: Fragment[] = [], position?: { x: number; y: number }) => {
    if (position) {
      setEmbeddedPosition(position)
    }
    openChat(fragments, 'embedded')
  }, [openChat])

  const closeEmbeddedChat = useCallback(() => {
    setIsEmbeddedOpen(false)
    setEmbeddedFragments([])
    setCurrentSession(undefined)
  }, [])

  const minimizeEmbeddedChat = useCallback(() => {
    setIsEmbeddedMinimized(prev => !prev)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    // 添加用户消息
    setCurrentSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        updatedAt: new Date()
      }
    })

    try {
      // 提取所有碎片的tags
      const allTags = currentSession.contextFragments.reduce((tags: string[], contextFragment) => {
        return [...tags, ...contextFragment.fragment.tags]
      }, [])
      
      // 去重tags
      const uniqueTags = [...new Set(allTags)]
      
      // 构建简化的上下文，只包含tags信息
       const simplifiedContext = uniqueTags.length > 0 ? [{
          fragment: {
            id: 999999,
            title: '相关标签',
            content: `相关标签: ${uniqueTags.join(', ')}`,
            tags: uniqueTags,
            priority: 'medium' as const,
            status: 'active' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          addedAt: new Date(),
          position: { x: 0, y: 0 }
        }] : []
      
      // 使用AI服务获取响应
      const response = await aiChatService.sendMessage(
        content, 
        simplifiedContext,
        currentSession.id
      )
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date()
      }

      setCurrentSession(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, aiMessage],
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('AI Chat Error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，我暂时无法回复您的消息，请稍后再试。',
        timestamp: new Date()
      }

      setCurrentSession(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, errorMessage],
          updatedAt: new Date()
        }
      })
    }
  }, [currentSession])

  const handleFragmentAdd = useCallback((fragment: Fragment) => {
    console.log('Fragment added to chat:', fragment.title)
  }, [])

  const handleFragmentRemove = useCallback((fragmentId: string) => {
    console.log('Fragment removed from chat:', fragmentId)
  }, [])

  const addFragmentToContext = useCallback((fragment: Fragment) => {
    // 如果没有活跃的会话，先打开嵌入式聊天
    if (!currentSession) {
      openEmbeddedChat([fragment])
      return
    }

    // 检查碎片是否已存在于上下文中
    const exists = currentSession.contextFragments.some(cf => cf.fragment.id === fragment.id)
    if (exists) {
      console.log('Fragment already exists in context:', fragment.title)
      return
    }

    // 如果是嵌入式模式，更新embeddedFragments状态
    if (currentMode === 'embedded' && isEmbeddedOpen) {
      setEmbeddedFragments(prev => {
        const fragmentExists = prev.some(f => f.id === fragment.id)
        if (fragmentExists) return prev
        return [...prev, fragment]
      })
    }

    // 添加碎片到当前会话的上下文
    setCurrentSession(prev => {
      if (!prev) return prev
      const newContextFragment = {
        fragment,
        addedAt: new Date(),
        position: { x: prev.contextFragments.length * 20, y: prev.contextFragments.length * 20 }
      }
      return {
        ...prev,
        contextFragments: [...prev.contextFragments, newContextFragment],
        updatedAt: new Date()
      }
    })

    console.log('Fragment added to context:', fragment.title)
  }, [currentSession, currentMode, isEmbeddedOpen, openEmbeddedChat])

  const contextValue: AIChatManagerContextType = {
    openChat,
    closeChat,
    isOpen,
    currentSession,
    sendMessage,
    addFragmentToContext,
    openEmbeddedChat,
    closeEmbeddedChat,
    minimizeEmbeddedChat,
    isEmbeddedOpen,
    isEmbeddedMinimized,
    embeddedPosition,
    embeddedSize
  }

  return (
    <AIChatManagerContext.Provider value={contextValue}>
      {children}
      <AIChatDialog
        isOpen={isOpen}
        onClose={closeChat}
        initialFragments={initialFragments}
        onFragmentAdd={handleFragmentAdd}
        onFragmentRemove={handleFragmentRemove}
      />
      <EmbeddedChatPanel
        isVisible={isEmbeddedOpen}
        onClose={closeEmbeddedChat}
        onMinimize={minimizeEmbeddedChat}
        initialFragments={embeddedFragments}
        onFragmentAdd={handleFragmentAdd}
        onFragmentRemove={handleFragmentRemove}
        position={embeddedPosition}
        size={embeddedSize}
        isMinimized={isEmbeddedMinimized}
        onPositionChange={handleEmbeddedPositionChange}
        onSizeChange={handleEmbeddedSizeChange}
      />
    </AIChatManagerContext.Provider>
  )
}

// Hook for using the chat manager
export function useAIChat() {
  const context = React.useContext(AIChatManagerContext)
  if (!context) {
    throw new Error('useAIChat must be used within an AIChatManager')
  }
  return context
}