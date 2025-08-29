"use client"

import { useFragmentStoreInit } from '@/hooks/use-fragment-store-init'
import { ReactNode } from 'react'

interface StoreInitializerProps {
  children: ReactNode
}

/**
 * 用于初始化应用store的客户端组件
 * 包装在layout中使用
 */
export function StoreInitializer({ children }: StoreInitializerProps) {
  // 初始化Fragment Store
  useFragmentStoreInit()

  return <>{children}</>
}