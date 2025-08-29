"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { FloatingChatButtonProps } from '@/lib/ai-chat-types'
import { cn } from '@/lib/utils'

export function FloatingChatButton({ 
  fragment, 
  onChatStart, 
  position = 'bottom-right' 
}: FloatingChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const positionClasses = {
    'top-right': 'top-1 right-1',
    'bottom-right': 'bottom-1 right-1',
    'top-left': 'top-1 left-1',
    'bottom-left': 'bottom-1 left-1'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onChatStart(fragment)
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "absolute h-7 w-7 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md group",
        positionClasses[position],
        isHovered ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="开始AI对话"
    >
      <MessageCircle className="h-4 w-4 text-blue-600" />
    </Button>
  )
}