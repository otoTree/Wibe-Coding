"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface DraggableResizablePanelProps {
  children: React.ReactNode
  initialPosition: { x: number; y: number }
  initialSize: { width: number; height: number }
  minSize?: { width: number; height: number }
  maxSize?: { width: number; height: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  className?: string
  disabled?: boolean
}

export function DraggableResizablePanel({
  children,
  initialPosition,
  initialSize,
  minSize = { width: 300, height: 400 },
  maxSize = { width: 800, height: 800 },
  onPositionChange,
  onSizeChange,
  className,
  disabled = false
}: DraggableResizablePanelProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  
  const panelRef = useRef<HTMLDivElement>(null)

  // 更新位置
  const updatePosition = useCallback((newPosition: { x: number; y: number }) => {
    // 确保面板不会超出视窗边界
    const maxX = window.innerWidth - size.width
    const maxY = window.innerHeight - size.height
    
    const constrainedPosition = {
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY))
    }
    
    setPosition(constrainedPosition)
    onPositionChange?.(constrainedPosition)
  }, [size, onPositionChange])

  // 更新大小
  const updateSize = useCallback((newSize: { width: number; height: number }) => {
    const constrainedSize = {
      width: Math.max(minSize.width, Math.min(newSize.width, maxSize.width)),
      height: Math.max(minSize.height, Math.min(newSize.height, maxSize.height))
    }
    
    setSize(constrainedSize)
    onSizeChange?.(constrainedSize)
  }, [minSize, maxSize, onSizeChange])

  // 拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (disabled || isResizing) return
    
    // 如果点击的是按钮或其子元素，不启动拖拽
    const target = e.target as HTMLElement
    if (target.closest('button') || target.tagName === 'BUTTON') {
      return
    }
    
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }, [disabled, isResizing, position])

  // 调整大小开始
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (disabled) return
    
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }, [disabled, size])

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updatePosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        
        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = position.x
        let newY = position.y
        
        if (resizeDirection.includes('right')) {
          newWidth = resizeStart.width + deltaX
        }
        if (resizeDirection.includes('left')) {
          newWidth = resizeStart.width - deltaX
          newX = position.x + deltaX
        }
        if (resizeDirection.includes('bottom')) {
          newHeight = resizeStart.height + deltaY
        }
        if (resizeDirection.includes('top')) {
          newHeight = resizeStart.height - deltaY
          newY = position.y + deltaY
        }
        
        // 应用约束
        newWidth = Math.max(minSize.width, Math.min(newWidth, maxSize.width))
        newHeight = Math.max(minSize.height, Math.min(newHeight, maxSize.height))
        
        updateSize({ width: newWidth, height: newHeight })
        
        // 如果是从左边或上边调整大小，需要更新位置
        if (resizeDirection.includes('left') || resizeDirection.includes('top')) {
          updatePosition({ x: newX, y: newY })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection('')
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = isDragging ? 'move' : 'nw-resize'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeDirection, position, updatePosition, updateSize, minSize, maxSize])

  // 调整大小手柄组件
  const ResizeHandle = ({ direction, className: handleClassName }: { direction: string; className: string }) => (
    <div
      className={cn(
        "absolute bg-transparent hover:bg-blue-500/20 transition-colors",
        handleClassName
      )}
      onMouseDown={(e) => handleResizeStart(e, direction)}
      style={{ cursor: `${direction}-resize` }}
    />
  )

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl",
        isDragging && "shadow-2xl",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {/* 拖拽区域 */}
      <div
        className="absolute inset-x-0 top-0 h-12 cursor-move pointer-events-auto"
        onMouseDown={handleDragStart}
        style={{ zIndex: 1 }}
      />
      
      {/* 调整大小手柄 */}
      {!disabled && (
        <>
          {/* 边缘手柄 */}
          <ResizeHandle direction="top" className="top-0 left-2 right-2 h-1" />
          <ResizeHandle direction="bottom" className="bottom-0 left-2 right-2 h-1" />
          <ResizeHandle direction="left" className="left-0 top-2 bottom-2 w-1" />
          <ResizeHandle direction="right" className="right-0 top-2 bottom-2 w-1" />
          
          {/* 角落手柄 */}
          <ResizeHandle direction="top-left" className="top-0 left-0 w-2 h-2" />
          <ResizeHandle direction="top-right" className="top-0 right-0 w-2 h-2" />
          <ResizeHandle direction="bottom-left" className="bottom-0 left-0 w-2 h-2" />
          <ResizeHandle direction="bottom-right" className="bottom-0 right-0 w-2 h-2" />
        </>
      )}
      
      {/* 内容区域 */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  )
}