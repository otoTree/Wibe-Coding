import { Fragment } from './types'

// IndexedDB 数据库配置
const DB_NAME = 'iknow-fragments'
const DB_VERSION = 1
const STORE_NAME = 'fragments'

class FragmentDB {
  private db: IDBDatabase | null = null

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          
          // 创建索引
          store.createIndex('title', 'title', { unique: false })
          store.createIndex('category', 'category', { unique: false })
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  // 获取所有碎片
  async getAllFragments(): Promise<Fragment[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const fragments = request.result.map((fragment: Fragment & { createdAt: string; updatedAt: string; lastAccessedAt?: string }) => ({
          ...fragment,
          createdAt: new Date(fragment.createdAt),
          updatedAt: new Date(fragment.updatedAt),
          lastAccessedAt: fragment.lastAccessedAt ? new Date(fragment.lastAccessedAt) : undefined
        }))
        resolve(fragments)
      }

      request.onerror = () => {
        reject(new Error('Failed to get fragments'))
      }
    })
  }

  // 添加碎片
  async addFragment(fragment: Omit<Fragment, 'id'>): Promise<Fragment> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const fragmentToAdd = {
        ...fragment,
        createdAt: fragment.createdAt.toISOString(),
        updatedAt: fragment.updatedAt.toISOString(),
        lastAccessedAt: fragment.lastAccessedAt?.toISOString()
      }
      
      const request = store.add(fragmentToAdd)

      request.onsuccess = () => {
        const newFragment = {
          ...fragment,
          id: request.result as number
        }
        resolve(newFragment)
      }

      request.onerror = () => {
        reject(new Error('Failed to add fragment'))
      }
    })
  }

  // 更新碎片
  async updateFragment(fragment: Fragment): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const fragmentToUpdate = {
        ...fragment,
        createdAt: fragment.createdAt.toISOString(),
        updatedAt: fragment.updatedAt.toISOString(),
        lastAccessedAt: fragment.lastAccessedAt?.toISOString()
      }
      
      const request = store.put(fragmentToUpdate)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to update fragment'))
      }
    })
  }

  // 删除碎片
  async deleteFragment(id: number): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete fragment'))
      }
    })
  }

  // 批量设置碎片（用于初始化）
  async setFragments(fragments: Fragment[]): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      // 先清空现有数据
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // 添加新数据
        let completed = 0
        const total = fragments.length
        
        if (total === 0) {
          resolve()
          return
        }
        
        fragments.forEach(fragment => {
          const fragmentToAdd = {
            ...fragment,
            createdAt: fragment.createdAt.toISOString(),
            updatedAt: fragment.updatedAt.toISOString(),
            lastAccessedAt: fragment.lastAccessedAt?.toISOString()
          }
          
          const addRequest = store.add(fragmentToAdd)
          
          addRequest.onsuccess = () => {
            completed++
            if (completed === total) {
              resolve()
            }
          }
          
          addRequest.onerror = () => {
            reject(new Error('Failed to set fragments'))
          }
        })
      }
      
      clearRequest.onerror = () => {
        reject(new Error('Failed to clear existing fragments'))
      }
    })
  }
}

// 导出单例实例
export const fragmentDB = new FragmentDB()