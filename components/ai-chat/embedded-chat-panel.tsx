"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, X, Bot, User, FileText, Minimize2, Maximize2, MessageCircle, Move } from 'lucide-react'
import { ChatMessage, ChatContextFragment } from '@/lib/ai-chat-types'
import { Fragment } from '@/lib/types'
import { DropZone } from './drop-zone'
import { DraggableResizablePanel } from './draggable-resizable-panel'
import { cn } from '@/package/utils/utils'
import { aiChatService } from '@/lib/ai-chat-service'

interface EmbeddedChatPanelProps {
  isVisible: boolean
  onClose: () => void
  onMinimize?: () => void
  initialFragments?: Fragment[]
  onFragmentAdd?: (fragment: Fragment) => void
  onFragmentRemove?: (fragmentId: string) => void
  className?: string
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  isMinimized?: boolean
  onPositionChange?: (position: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
}

export function EmbeddedChatPanel({
  isVisible,
  onClose,
  onMinimize,
  initialFragments = [],
  onFragmentAdd,
  onFragmentRemove,
  className,
  position = { x: 20, y: 20 },
  size = { width: 400, height: 500 },
  isMinimized = false,
  onPositionChange,
  onSizeChange
}: EmbeddedChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [contextFragments, setContextFragments] = useState<ChatContextFragment[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 同步initialFragments到contextFragments，避免重复添加
  useEffect(() => {
    if (initialFragments.length === 0) {
      setContextFragments([])
      return
    }

    // 获取当前已存在的碎片ID
    const existingIds = new Set(contextFragments.map(cf => cf.fragment.id))
    
    // 找出真正新增的碎片
    const newFragments = initialFragments.filter(fragment => !existingIds.has(fragment.id))
    
    if (newFragments.length > 0) {
      const baseTime = Date.now()
      const newContextFragments = newFragments.map((fragment, index) => ({
        fragment,
        addedAt: new Date(baseTime + index), // 确保每个碎片有唯一的时间戳
        position: { x: (contextFragments.length + index) * 20, y: (contextFragments.length + index) * 20 }
      }))
      setContextFragments(prev => [...prev, ...newContextFragments])
    }
    
    // 如果initialFragments中缺少某些已存在的碎片，移除它们
    const initialIds = new Set(initialFragments.map(f => f.id))
    setContextFragments(prev => prev.filter(cf => initialIds.has(cf.fragment.id)))
  }, [initialFragments])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    if (isVisible && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isVisible, isMinimized])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date(),
      fragments: contextFragments.map(cf => cf.fragment)
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // 使用AI服务获取响应
      const response = await aiChatService.sendMessage(
        inputValue,
        contextFragments,
        `embedded_${Date.now()}`
      )
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'assistant',
        timestamp: new Date(),
        fragments: contextFragments.map(cf => cf.fragment)
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFragmentDrop = (fragment: Fragment, dropPosition: { x: number; y: number }) => {
    const newContextFragment: ChatContextFragment = {
      fragment,
      addedAt: new Date(),
      position: dropPosition
    }
    
    setContextFragments(prev => {
      const exists = prev.some(cf => cf.fragment.id === fragment.id)
      if (exists) return prev
      return [...prev, newContextFragment]
    })
    
    onFragmentAdd?.(fragment)
  }

  const handleRemoveFragment = (fragmentId: string) => {
    setContextFragments(prev => prev.filter(cf => cf.fragment.id!.toString() !== fragmentId))
    onFragmentRemove?.(fragmentId)
  }

  if (!isVisible) return null

  // 最小化状态
  if (isMinimized) {
    return (
      <DraggableResizablePanel
        initialPosition={position}
        initialSize={{ width: 200, height: 60 }}
        onPositionChange={onPositionChange}
        className={className}
        disabled={false}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors h-full"
          onClick={onMinimize}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">AI 对话</span>
            {contextFragments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {contextFragments.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </DraggableResizablePanel>
    )
  }

  return (
    <DraggableResizablePanel
      initialPosition={position}
      initialSize={size}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      minSize={{ width: 300, height: 400 }}
      maxSize={{ width: 600, height: 700 }}
      className={className}
    >
      <DropZone
        onFragmentDrop={handleFragmentDrop}
        isActive={isDragActive}
      >
        <Card className="h-full border-0 shadow-none">
          <CardHeader className="pb-2 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-gray-400 cursor-move" />
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-medium">AI 对话助手</CardTitle>
                {contextFragments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {contextFragments.length} 个碎片
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {onMinimize && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={onMinimize}
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={onClose}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(100%-60px)] overflow-hidden">
            {/* 上下文碎片显示 */}
            {contextFragments.length > 0 && (
              <div className="flex-shrink-0 p-3 border-b bg-gray-50 max-h-32">
                <div className="text-xs text-gray-600 mb-2">对话上下文:</div>
                <ScrollArea className="max-h-20">
                  <div className="flex flex-wrap gap-1 pr-2">
                    {contextFragments.map((cf, index) => (
                      <Badge
                        key={`fragment-${cf.fragment.id || index}-${cf.addedAt.getTime()}`}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-red-50 hover:border-red-300 group break-words flex-shrink-0"
                        onClick={() => handleRemoveFragment(cf.fragment.id!.toString())}
                      >
                        <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{cf.fragment.title}</span>
                        <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* 消息列表 */}
            <ScrollArea className="flex-1 p-3 min-h-0">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>开始与AI助手对话</p>
                    <p className="text-xs mt-1">拖拽知识碎片到此处添加上下文</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.type === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3 w-3 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm break-words overflow-wrap-anywhere",
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* 输入区域 */}
            <div className="flex-shrink-0 p-3 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DropZone>
    </DraggableResizablePanel>
  )
}