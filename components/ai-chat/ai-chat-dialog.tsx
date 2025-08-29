"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Send, X, Bot, User, FileText } from 'lucide-react'
import { AIChatComponentProps, ChatMessage, ChatContextFragment } from '@/lib/ai-chat-types'
import { Fragment } from '@/lib/types'
import { DropZone } from './drop-zone'
import { cn } from '@/lib/utils'
import { aiChatService } from '@/lib/ai-chat-service'

export function AIChatDialog({ 
  isOpen, 
  onClose, 
  initialFragments = [], 
  onFragmentAdd, 
  onFragmentRemove 
}: AIChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [contextFragments, setContextFragments] = useState<ChatContextFragment[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初始化时添加初始碎片
  useEffect(() => {
    if (initialFragments.length > 0) {
      const newContextFragments = initialFragments.map((fragment, index) => ({
        fragment,
        addedAt: new Date(),
        position: { x: index * 20, y: index * 20 }
      }))
      setContextFragments(newContextFragments)
    }
  }, [initialFragments])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
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
        `dialog_${Date.now()}`
      )
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI对话错误:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，发生了错误，请稍后重试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  const handleFragmentDrop = (fragment: Fragment, position: { x: number; y: number }) => {
    // 检查是否已存在
    const exists = contextFragments.some(cf => cf.fragment.id === fragment.id)
    if (exists) return

    const newContextFragment: ChatContextFragment = {
      fragment,
      addedAt: new Date(),
      position
    }

    setContextFragments(prev => [...prev, newContextFragment])
    onFragmentAdd?.(fragment)
  }

  const handleRemoveFragment = (fragmentId: string) => {
    setContextFragments(prev => prev.filter(cf => cf.fragment.id?.toString() !== fragmentId))
    onFragmentRemove?.(fragmentId)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI 智能对话
            {contextFragments.length > 0 && (
              <Badge variant="secondary">
                {contextFragments.length} 个上下文碎片
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 左侧：上下文碎片 */}
          <div className="w-80 border-r bg-gray-50/50 p-4 flex flex-col">
            <h3 className="text-sm font-medium mb-3 text-gray-700">对话上下文</h3>
            <DropZone 
              onFragmentDrop={handleFragmentDrop} 
              isActive={true}
            >
              <ScrollArea className="flex-1 min-h-[200px]">
                <div className="space-y-2 pr-2">
                {contextFragments.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    拖拽碎片到此处
                    <br />
                    构建对话上下文
                  </div>
                ) : (
                  contextFragments.map((cf, index) => (
                    <Card key={cf.fragment.id || index} className="relative group">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium break-words">
                              <span className="line-clamp-2">{cf.fragment.title}</span>
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">
                              {cf.fragment.content.substring(0, 80)}...
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {cf.fragment.tags.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {cf.fragment.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{cf.fragment.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveFragment(cf.fragment.id?.toString() || '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                </div>
              </ScrollArea>
            </DropZone>
          </div>

          {/* 右侧：对话区域 */}
          <div className="flex-1 flex flex-col">
            {/* 消息列表 */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>开始与AI对话吧！</p>
                    <p className="text-sm mt-1">您可以拖拽碎片到左侧构建上下文</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2 break-words overflow-wrap-anywhere",
                          message.type === 'user'
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          message.type === 'user' ? "text-blue-100" : "text-gray-500"
                        )}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="flex-shrink-0 border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}