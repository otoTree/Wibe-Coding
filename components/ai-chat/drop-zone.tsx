"use client"

import React, { useState, useRef } from 'react'
import { DropZoneProps } from '@/lib/ai-chat-types'
import { cn } from '@/lib/utils'

export function DropZone({ onFragmentDrop, isActive, children }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    // 不要阻止事件传播，让拖拽事件能够正常工作
    if (isActive) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    
    // 只有当鼠标真正离开drop zone时才设置为false
    const rect = dropZoneRef.current?.getBoundingClientRect()
    if (rect) {
      const { clientX, clientY } = e
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragOver(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (!isActive) return

    try {
      const fragmentData = e.dataTransfer.getData('application/json')
      if (fragmentData) {
        const fragment = JSON.parse(fragmentData)
        const rect = dropZoneRef.current?.getBoundingClientRect()
        if (rect) {
          const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          }
          onFragmentDrop(fragment, position)
        }
      }
    } catch (error) {
      console.error('Error parsing dropped fragment data:', error)
    }
  }

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        "relative w-full h-full transition-all duration-200",
        isActive && "cursor-copy",
        isDragOver && isActive && "bg-blue-50/50 ring-2 ring-blue-300 ring-dashed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 backdrop-blur-sm z-10 pointer-events-none">
          <div className="text-blue-600 font-medium text-lg flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-dashed rounded-full flex items-center justify-center">
              +
            </div>
            拖拽到此处添加到对话上下文
          </div>
        </div>
      )}
    </div>
  )
}