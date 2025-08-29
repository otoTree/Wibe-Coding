"use client"

import { useEffect } from 'react'
import { useFragmentStore } from '@/lib/stores/fragment-store'

/**
 * 用于初始化Fragment Store的Hook
 * 应该在应用的根组件中调用
 */
export function useFragmentStoreInit() {
  const { initializeStore, isInitialized } = useFragmentStore()

  useEffect(() => {
    if (!isInitialized) {
      initializeStore().catch(error => {
        console.error('Failed to initialize fragment store:', error)
      })
    }
  }, [initializeStore, isInitialized])

  return { isInitialized }
}