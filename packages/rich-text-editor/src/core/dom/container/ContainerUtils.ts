export interface ContainerOptions {
  className?: string
  id?: string
  tag?: keyof HTMLElementTagNameMap
  innerHTML?: string
  textContent?: string
  style?: string
}

export class ContainerUtils {
  /**
   * 创建容器元素
   */
  static createContainer(options: ContainerOptions = {}): HTMLElement {
    const tag = options.tag || 'div'
    const container = document.createElement(tag)
    
    if (options.id) container.id = options.id
    if (options.className) container.className = options.className
    if (options.innerHTML) container.innerHTML = options.innerHTML
    if (options.textContent) container.textContent = options.textContent
    if (options.style) container.style.cssText = options.style
    
    return container
  }

  /**
   * 创建滚动容器
   */
  static createScrollContainer(options: ContainerOptions = {}): HTMLElement {
    const container = this.createContainer({
      ...options,
      className: `rich:flex rich:items-center rich:gap-0.5 rich:overflow-x-auto rich:scrollbar-thin rich:scrollbar-thumb-gray-200 rich:scrollbar-track-transparent rich:px-1 ${options.className || ''}`
    })
    return container
  }

  /**
   * 创建分隔线 — MD3 outline-variant (subtle, 20px tall)
   */
  static createDivider(): HTMLElement {
    const divider = document.createElement('div')
    divider.className = 'rich:w-px rich:h-5 rich:bg-gray-200 rich:mx-0.5 rich:flex-shrink-0'
    return divider
  }

  /**
   * 创建组容器
   */
  static createGroup(options: ContainerOptions = {}): HTMLElement {
    return this.createContainer({
      ...options,
      className: `rich:flex rich:items-center rich:gap-1 ${options.className || ''}`
    })
  }

  /**
   * 创建工具栏容器
   */
  static createToolbar(options: ContainerOptions = {}): HTMLElement {
    return this.createContainer({
      ...options,
      className: `rich:bg-white rich:border-b rich:border-gray-200 ${options.className || ''}`
    })
  }
}
