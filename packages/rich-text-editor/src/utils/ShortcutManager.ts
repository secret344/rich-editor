/**
 * 快捷键定义
 */
export interface ShortcutDefinition {
  /** 触发按键（不区分大小写，例如 'Escape'、'z'） */
  key: string
  /** 快捷键处理函数，返回 true 时阻止后续低优先级处理器执行 */
  handler: (e: KeyboardEvent) => boolean | void
  /** 是否需要 Ctrl 键（Mac 上同时匹配 Meta/Command 键），不传则不检查 */
  ctrl?: boolean
  /** 是否需要 Alt 键，不传则不检查 */
  alt?: boolean
  /** 是否需要 Shift 键，不传则不检查 */
  shift?: boolean
  /** 优先级，值越高越先执行，默认为 0 */
  priority?: number
  /** 描述（用于调试） */
  description?: string
}

/**
 * 快捷键管理器
 *
 * 使用单例模式，在 document 上绑定唯一的 keydown 事件监听器，
 * 将键盘事件按优先级分发给已注册的处理器。
 *
 * - 避免多组件重复绑定相同按键导致的冲突
 * - 通过优先级控制事件处理顺序（例如：下拉面板 Escape 优先于全屏 Escape）
 * - 统一生命周期管理，防止内存泄漏
 */
export class ShortcutManager {
  private static instance: ShortcutManager | null = null
  private registrations: Map<string, ShortcutDefinition> = new Map()
  private listener: ((e: KeyboardEvent) => void) | null = null

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager()
    }
    return ShortcutManager.instance
  }

  /**
   * 注册快捷键
   * @param id 唯一标识，相同 id 会覆盖已有注册
   * @param definition 快捷键定义
   */
  register(id: string, definition: ShortcutDefinition): void {
    this.registrations.set(id, definition)
    this.ensureListener()
  }

  /**
   * 取消注册快捷键
   * @param id 注册时使用的唯一标识
   */
  unregister(id: string): void {
    this.registrations.delete(id)
    if (this.registrations.size === 0) {
      this.removeListener()
    }
  }

  private ensureListener(): void {
    if (!this.listener) {
      this.listener = (e: KeyboardEvent) => this.dispatch(e)
      document.addEventListener('keydown', this.listener)
    }
  }

  private removeListener(): void {
    if (this.listener) {
      document.removeEventListener('keydown', this.listener)
      this.listener = null
    }
  }

  private dispatch(e: KeyboardEvent): void {
    const sorted = [...this.registrations.values()].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    )
    for (const def of sorted) {
      if (this.matches(e, def)) {
        const result = def.handler(e)
        if (result === true) break
      }
    }
  }

  private matches(e: KeyboardEvent, def: ShortcutDefinition): boolean {
    if (e.key.toLowerCase() !== def.key.toLowerCase()) return false
    if (def.ctrl !== undefined) {
      const hasCtrl = e.ctrlKey || e.metaKey
      if (hasCtrl !== def.ctrl) return false
    }
    if (def.alt !== undefined && e.altKey !== def.alt) return false
    if (def.shift !== undefined && e.shiftKey !== def.shift) return false
    return true
  }

  /**
   * 清理所有已注册快捷键，并移除 document 监听器
   */
  cleanup(): void {
    this.registrations.clear()
    this.removeListener()
  }

  /**
   * 获取已注册快捷键数量（用于调试）
   */
  get registeredCount(): number {
    return this.registrations.size
  }
}
