/**
 * 事件管理器 - 统一管理所有事件监听器
 * 确保在组件销毁时能够统一清理，防止内存泄漏
 */
export class EventManager {
  private listeners: Array<{
    element: EventTarget
    event: string
    handler: EventListenerOrEventListenerObject
    options?: boolean | AddEventListenerOptions
  }> = []

  /**
   * 添加事件监听器
   */
  addEventListener(
    element: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options)
    this.listeners.push({ element, event, handler, options })
  }

  /**
   * 移除特定的事件监听器
   */
  removeEventListener(
    element: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.removeEventListener(event, handler, options)
    this.listeners = this.listeners.filter(
      listener => !(
        listener.element === element &&
        listener.event === event &&
        listener.handler === handler &&
        listener.options === options
      )
    )
  }

  /**
   * 添加点击外部关闭事件
   */
  addClickOutsideListener(
    targetElement: HTMLElement,
    callback: () => void,
    excludeElements: HTMLElement[] = []
  ): void {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (!targetElement.contains(target)) {
        // 检查是否点击了排除的元素
        const isExcluded = excludeElements.some(el => el.contains(target))
        if (!isExcluded) {
          callback()
        }
      }
    }
    this.addEventListener(document, 'click', handler as EventListener)
  }

  /**
   * 添加键盘事件监听器
   */
  addKeydownListener(
    element: EventTarget,
    handler: (e: KeyboardEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(element, 'keydown', handler as EventListener, options)
  }

  /**
   * 添加窗口大小改变事件监听器
   */
  addResizeListener(handler: () => void): void {
    this.addEventListener(window, 'resize', handler)
  }

  /**
   * 添加滚动事件监听器
   */
  addScrollListener(
    element: EventTarget,
    handler: (e: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(element, 'scroll', handler, options)
  }

  /**
   * 添加焦点事件监听器
   */
  addFocusListener(
    element: EventTarget,
    handler: (e: FocusEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(element, 'focus', handler as EventListener, options)
  }

  /**
   * 添加失焦事件监听器
   */
  addBlurListener(
    element: EventTarget,
    handler: (e: FocusEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(element, 'blur', handler as EventListener, options)
  }

  /**
   * 添加鼠标事件监听器
   */
  addMouseListener(
    element: EventTarget,
    event: 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave',
    handler: (e: MouseEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(element, event, handler as EventListener, options)
  }

  /**
   * 添加触摸事件监听器
   */
  addTouchListener(
    element: EventTarget,
    event: 'touchstart' | 'touchend' | 'touchmove',
    handler: (e: TouchEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.addEventListener(element, event, handler as EventListener, options)
  }

  /**
   * 清理所有事件监听器
   */
  cleanup(): void {
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options)
    })
    this.listeners = []
  }

  /**
   * 获取当前监听器数量
   */
  getListenerCount(): number {
    return this.listeners.length
  }

  /**
   * 检查是否有特定元素的事件监听器
   */
  hasListenersFor(element: EventTarget): boolean {
    return this.listeners.some(listener => listener.element === element)
  }

  /**
   * 清理特定元素的所有事件监听器
   */
  cleanupForElement(element: EventTarget): void {
    this.listeners = this.listeners.filter(listener => {
      if (listener.element === element) {
        element.removeEventListener(listener.event, listener.handler, listener.options)
        return false
      }
      return true
    })
  }
}
