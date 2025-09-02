"use client"

import React from 'react'
import { Fragment } from '@/lib/types'
import { cn } from '@/package/utils/utils'

interface DraggableFragmentProps {
  fragment: Fragment
  children: React.ReactNode
  className?: string
  onDragStart?: (fragment: Fragment) => void
  onDragEnd?: () => void
}

export function DraggableFragment({ 
  fragment, 
  children, 
  className,
  onDragStart,
  onDragEnd
}: DraggableFragmentProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // 设置拖拽数据
    e.dataTransfer.setData('application/json', JSON.stringify(fragment))
    e.dataTransfer.effectAllowed = 'copy'
    
    // 设置拖拽图像
    const dragImage = document.createElement('div')
    dragImage.innerHTML = `
      <div style="
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        padding: 8px 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        color: #1f2937;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      ">
        📄 ${fragment.title}
      </div>
    `
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    document.body.appendChild(dragImage)
    
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    
    // 清理拖拽图像
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 100)
    
    onDragStart?.(fragment)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd?.()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  )
}