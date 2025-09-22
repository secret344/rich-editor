/**
 * 状态管理器 - 管理按钮和菜单的状态更新
 * 替代定时器方式，提供外部调用的状态更新机制
 */

export interface StateUpdatable {
  updateState: () => void
}

export class StateManager {
  private static instance: StateManager | null = null
  private updateables: Set<StateUpdatable> = new Set()
  private isUpdating = false

  private constructor() {}

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager()
    }
    return StateManager.instance
  }

  /**
   * 注册需要状态更新的对象
   */
  register(updateable: StateUpdatable): void {
    this.updateables.add(updateable)
  }

  /**
   * 取消注册状态更新对象
   */
  unregister(updateable: StateUpdatable): void {
    this.updateables.delete(updateable)
  }

  /**
   * 更新所有注册的对象状态
   */
  updateAll(): void {
    if (this.isUpdating) return // 防止重复更新
    
    this.isUpdating = true
    
    // 遍历并更新所有对象
    for (const updateable of this.updateables) {
      try {
        updateable.updateState()
      } catch (error) {
        console.warn('状态更新失败:', error)
      }
    }
    
    this.isUpdating = false
  }

  /**
   * 清理所有注册的对象
   */
  cleanup(): void {
    this.updateables.clear()
  }

  /**
   * 获取注册数量（用于调试）
   */
  get registeredCount(): number {
    return this.updateables.size
  }
}
