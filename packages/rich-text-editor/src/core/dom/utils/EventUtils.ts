/**
 * 事件操作工具类
 * 统一管理DOM元素的事件监听、触发和清理
 */

export type EventCallback<T extends Event = Event> = (event: T) => void

export interface EventListenerOptions {
  once?: boolean
  passive?: boolean
  capture?: boolean
  signal?: AbortSignal
}

export class EventUtils {
  /**
   * 添加事件监听器
   */
  static addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: EventCallback<HTMLElementEventMap[K]>,
    options?: EventListenerOptions
  ): void
  static addEventListener(
    element: HTMLElement,
    type: string,
    listener: EventCallback,
    options?: EventListenerOptions
  ): void
  static addEventListener(
    element: HTMLElement,
    type: string,
    listener: EventCallback,
    options?: EventListenerOptions
  ): void {
    element.addEventListener(type, listener as EventListener, options)
  }

  /**
   * 移除事件监听器
   */
  static removeEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: EventCallback<HTMLElementEventMap[K]>,
    options?: boolean | EventListenerOptions
  ): void
  static removeEventListener(
    element: HTMLElement,
    type: string,
    listener: EventCallback,
    options?: boolean | EventListenerOptions
  ): void
  static removeEventListener(
    element: HTMLElement,
    type: string,
    listener: EventCallback,
    options?: boolean | EventListenerOptions
  ): void {
    element.removeEventListener(type, listener as EventListener, options)
  }

  /**
   * 触发事件
   */
  static dispatchEvent(element: HTMLElement, event: Event): boolean {
    return element.dispatchEvent(event)
  }

  /**
   * 创建并触发自定义事件
   */
  static triggerEvent(element: HTMLElement, type: string, detail?: unknown): boolean {
    const event = new CustomEvent(type, { detail })
    return element.dispatchEvent(event)
  }

  /**
   * 添加点击事件监听器
   */
  static onClick(element: HTMLElement, listener: EventCallback<MouseEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'click', listener, options)
  }

  /**
   * 添加鼠标悬停事件监听器
   */
  static onMouseEnter(element: HTMLElement, listener: EventCallback<MouseEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'mouseenter', listener, options)
  }

  /**
   * 添加鼠标离开事件监听器
   */
  static onMouseLeave(element: HTMLElement, listener: EventCallback<MouseEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'mouseleave', listener, options)
  }

  /**
   * 添加鼠标悬停和离开事件监听器
   */
  static onHover(
    element: HTMLElement, 
    enterListener: EventCallback<MouseEvent>, 
    leaveListener: EventCallback<MouseEvent>,
    options?: EventListenerOptions
  ): void {
    this.onMouseEnter(element, enterListener, options)
    this.onMouseLeave(element, leaveListener, options)
  }

  /**
   * 添加焦点事件监听器
   */
  static onFocus(element: HTMLElement, listener: EventCallback<FocusEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'focus', listener, options)
  }

  /**
   * 添加失焦事件监听器
   */
  static onBlur(element: HTMLElement, listener: EventCallback<FocusEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'blur', listener, options)
  }

  /**
   * 添加输入事件监听器
   */
  static onInput(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'input', listener, options)
  }

  /**
   * 添加变化事件监听器
   */
  static onChange(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'change', listener, options)
  }

  /**
   * 添加键盘按下事件监听器
   */
  static onKeyDown(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'keydown', listener, options)
  }

  /**
   * 添加键盘抬起事件监听器
   */
  static onKeyUp(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'keyup', listener, options)
  }

  /**
   * 添加特定按键的事件监听器
   */
  static onKey(
    element: HTMLElement, 
    key: string, 
    listener: EventCallback<KeyboardEvent>,
    options?: EventListenerOptions
  ): void {
    this.onKeyDown(element, (event) => {
      if (event.key === key) {
        listener(event)
      }
    }, options)
  }

  /**
   * 添加回车键事件监听器
   */
  static onEnter(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void {
    this.onKey(element, 'Enter', listener, options)
  }

  /**
   * 添加Escape键事件监听器
   */
  static onEscape(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void {
    this.onKey(element, 'Escape', listener, options)
  }

  /**
   * 添加表单提交事件监听器
   */
  static onSubmit(element: HTMLFormElement, listener: EventCallback<SubmitEvent>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'submit', listener, options)
  }

  /**
   * 添加加载完成事件监听器
   */
  static onLoad(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'load', listener, options)
  }

  /**
   * 添加滚动事件监听器
   */
  static onScroll(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'scroll', listener, options)
  }

  /**
   * 添加尺寸变化事件监听器
   */
  static onResize(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void {
    this.addEventListener(element, 'resize', listener, options)
  }

  /**
   * 阻止事件默认行为
   */
  static preventDefault(event: Event): void {
    event.preventDefault()
  }

  /**
   * 阻止事件冒泡
   */
  static stopPropagation(event: Event): void {
    event.stopPropagation()
  }

  /**
   * 阻止事件默认行为和冒泡
   */
  static stopEvent(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * 创建事件委托
   */
  static delegate<K extends keyof HTMLElementEventMap>(
    container: HTMLElement,
    selector: string,
    type: K,
    listener: EventCallback<HTMLElementEventMap[K]>,
    options?: EventListenerOptions
  ): void {
    this.addEventListener(container, type, (event) => {
      const target = event.target as HTMLElement
      const delegateTarget = target.closest(selector) as HTMLElement
      
      if (delegateTarget && container.contains(delegateTarget)) {
        // 创建一个新的事件对象，但修改currentTarget
        Object.defineProperty(event, 'currentTarget', {
          value: delegateTarget,
          writable: false
        })
        listener(event)
      }
    }, options)
  }

  /**
   * 一次性事件监听器
   */
  static once<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: EventCallback<HTMLElementEventMap[K]>
  ): void {
    this.addEventListener(element, type, listener, { once: true })
  }

  /**
   * 等待事件发生（Promise版本）
   */
  static waitForEvent<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    timeout?: number
  ): Promise<HTMLElementEventMap[K]> {
    return new Promise((resolve, reject) => {
      const timeoutId = timeout ? setTimeout(() => {
        reject(new Error(`Event ${type} timeout after ${timeout}ms`))
      }, timeout) : null

      this.once(element, type, (event) => {
        if (timeoutId) clearTimeout(timeoutId)
        resolve(event)
      })
    })
  }
}
